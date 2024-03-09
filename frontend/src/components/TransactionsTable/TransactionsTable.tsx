/* eslint-disable promise/always-return */
/* eslint-disable promise/catch-or-return */
/* eslint-disable no-nested-ternary */
/* eslint-disable camelcase */
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import {
  Box,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  Tooltip,
} from '@mui/material';
import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import debounce from 'lodash.debounce';
import {
  MRT_EditActionButtons,
  MaterialReactTable,
  createRow,
  useMaterialReactTable,
  type MRT_ColumnDef,
  type MRT_Row,
  type MRT_TableOptions,
} from 'material-react-table';
import { useCallback, useMemo, useReducer, useState } from 'react';

import { Exec, QueryCategories, QueryTransactions } from "../../../wailsjs/go/db/Db";
import { db } from "../../../wailsjs/go/models";

// validation functions

const formatCurrency = (value: number) => {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'NZD',
    currencyDisplay: 'symbol',
  });
  return formatter.format(value);
};

const formatDate = (value: string) => {
  const date = new Date(value);
  return date.toLocaleDateString('en-NZ', {
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
  });
};

const validateRequired = (value: string) => !!value.length;

const validateDate = (value: string) => {
  const date = new Date(value);
  return !Number.isNaN(date.getTime());
};

const validateAmount = (value: string) => {
  const number = Number(value);
  return !Number.isNaN(number);
};

const validateTransaction = (transaction: db.Transaction) => {
  return {
    date: validateDate(transaction.date) ? undefined : 'Date must be a valid date',
    description: validateRequired(transaction.description) ? undefined : 'Description is required',
    amount: validateAmount(transaction.amount.toString()) ? undefined : 'Amount must be a number >0',
  };
};

// database management functions

function useCreateTransaction(type: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (transaction: db.Transaction) => {
      if (type === 'Income') {
        transaction.amount = Math.abs(transaction.amount);
      } else {
        transaction.amount = -Math.abs(transaction.amount);
      }
      // update row in db
      return await Exec(
        `INSERT INTO Transactions (date, description, amount, category) VALUES (?, ?, ?, ?)`,
        [transaction.date, transaction.description, transaction.amount, transaction.category]
      );
    },
    //client side optimistic update
    onMutate: (newTransactionInfo: db.Transaction) => {
      queryClient.setQueryData(['transactions'], (prevTransactions: any) =>
        [
        ...prevTransactions, newTransactionInfo
        ] as db.Transaction[],
      );
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['transactions'] }),
  });
}

function useGetCategories(type: string) {
  return useQuery<db.Category[]>({
    queryKey: ['categories'+type],
    queryFn: async () => {
      console.log("attempting to get categories from db")
      return await QueryCategories(`SELECT * FROM Categories${type}`, []);
    },
    refetchOnWindowFocus: false,
  });
}

function useGetTransactions(type: string) {
  return useQuery<db.Transaction[]>({
    queryKey: ['transactions'],
    queryFn: async () => {
      console.log("attempting to get transactions from db")
      return await QueryTransactions(`SELECT * FROM Transactions WHERE ${
        type === 'Income' ? 'amount > 0' : 'amount < 0'
      }`, []);
    },
    refetchOnWindowFocus: false,
  });
}

function useUpdateTransaction(type: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (transaction: db.Transaction) => {
      if (type === 'Income') {
        transaction.amount = Math.abs(transaction.amount);
      } else {
        transaction.amount = -Math.abs(transaction.amount);
      }
      // update row in db
      return await Exec(
        `UPDATE Transactions SET date = ?, description = ?, amount = ?, category = ? WHERE id = ?`,
        [transaction.date, transaction.description, transaction.amount, transaction.category, transaction.id]
      );
    },
    // client side optimistic update
    onMutate: (newTransactionInfo: db.Transaction) => {
      queryClient.setQueryData(['transactions'], (prevTransactions: any) =>
        prevTransactions?.map((prevTransaction: db.Transaction) =>
        prevTransaction.id === newTransactionInfo.id ? newTransactionInfo : prevTransaction
        ),
      );
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['transactions'] }),
  });
}

function useDeleteTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      // update row in db
      return await Exec(
        `DELETE FROM Transactions WHERE id = ?`,
        [id]
      );
    },
    // client side optimistic update
    onMutate: (id: number) => {
      queryClient.setQueryData(['transactions'], (prevTransactions: any) =>
        prevTransactions?.filter((prevTransaction: db.Transaction) =>
        prevTransaction.id !== id
        ),
      );
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['transactions'] }),
  });
}

type ValidationErrors = {
  date?: string;
  description?: string;
  amount?: string;
  category?: string;
};

type ValidationAction = Partial<ValidationErrors>;

const TransactionsTable = ({ type }: { type: string }) => {
  const [validationErrors, dispatchValidationErrors] = useReducer(
    (state: ValidationErrors, action: ValidationAction) => ({ ...state, ...action }),
    {}
  );
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 20,
  });
  // validation handlers

  const handleDateChange = debounce(useCallback((event: { target: { value: string; }; }) => {
    const isValid = validateDate(event.target.value);

    dispatchValidationErrors({
      date: isValid ? undefined : 'Date must be a valid date'
    });
  }, [validateDate]), 500);

  const handleDescriptionChange = debounce(useCallback((event: { target: { value: string; }; }) => {
    const isValid = validateRequired(event.target.value);

    dispatchValidationErrors({
      description: isValid ? undefined : 'Description is required'
    });
  }, [validateRequired]), 500);

  const handleAmountChange = debounce(useCallback((event: { target: { value: string; }; }) => {
    const isValid = validateAmount(event.target.value);

    dispatchValidationErrors({
      amount: isValid ? undefined : 'Amount must be a number >0'
    });
  }, [validateAmount]), 500);

  // hooks
  const {
    data: fetchedTransactions = [],
    isError: isLoadingTransactionsError,
    isFetching: isFetchingTransactions,
    isLoading: isLoadingTransactions,
  } = useGetTransactions(type);
  const {
    data: fetchedCategories = [],
    isError: isLoadingCategoriesError,
    isFetching: isFetchingCategories,
    isLoading: isLoadingCategories,
  } = useGetCategories(type);
  const { mutateAsync: createTransaction, isPending: isCreatingTransaction } = useCreateTransaction(type);
  const { mutateAsync: updateTransaction, isPending: isUpdatingTransaction } = useUpdateTransaction(type);
  const  { mutateAsync: deleteTransaction, isPending: isDeletingTransaction } = useDeleteTransaction();

  // actions
  const handleCreateTransaction: MRT_TableOptions<db.Transaction>['onCreatingRowSave'] = async ({
    values,
    table,
  }: {
    values: db.Transaction;
    table: any;
  }) => {
    const newValidationErrors = validateTransaction(values);
    if (Object.values(newValidationErrors).some((error) => error)) {
      dispatchValidationErrors(newValidationErrors);
      return;
    }
    dispatchValidationErrors({
      date: undefined,
      description: undefined,
      amount: undefined,
      category: undefined,
    });
    await createTransaction(values);
    table.setCreatingRow(false);
  }

  const handleCreatingRow = (table: any) => {
    table.setCreatingRow(true);
    dispatchValidationErrors({
      date: undefined,
      description: undefined,
      amount: undefined,
      category: undefined,
    });
    table.setCreatingRow(
      createRow(table, {
        date: new Date().toISOString().split('T')[0],
        description: '',
        amount: 1,
        category: fetchedCategories[0]?.name || '',
      }),
    );
    // scroll to top of table
    document.querySelector('.MuiTableContainer-root')?.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }

  const handleEditingRow = (table: any, row: MRT_Row<db.Transaction>) => {
    dispatchValidationErrors({
      date: undefined,
      description: undefined,
      amount: undefined,
      category: undefined,
    });
    table.setEditingRow(row);
  }

  const openDeleteConfirmModal = (row: MRT_Row<db.Transaction>) => {
    if (window.confirm('Are you sure you want to delete this Transaction?')) {
      deleteTransaction(row.original.id);
    }
  };

  const handleSaveTransaction: MRT_TableOptions<db.Transaction>['onEditingRowSave'] = async ({
    values,
    table,
  }: {
    values: db.Transaction;
    table: any;
  }) => {
    const newValidationErrors = validateTransaction(values);
    if (Object.values(newValidationErrors).some((error) => error)) {
      dispatchValidationErrors(newValidationErrors);
      return;
    }
    dispatchValidationErrors({
      date: undefined,
      description: undefined,
      amount: undefined,
      category: undefined,
    });
    await updateTransaction(values);
    table.setEditingRow(null);
  };

  const columns = useMemo<MRT_ColumnDef<db.Transaction>[]>(
    () => [
      {
        accessorKey: 'id',
        header: 'ID',
        enableColumnOrdering: false,
        enableEditing: false,
        enableSorting: false,
        size: 50,
        hide: true, // no clue why this doesn't work so will have to do below
        // hide header
        muiTableHeadCellProps: {
          style: {
            display: 'none',
          },
        },
        // hide cell
        muiTableBodyCellProps: {
          style: {
            display: 'none',
          },
        },
      },
      {
        accessorKey: 'date',
        header: 'Date',
        type: 'date',
        dateSetting: { locale: "en-NZ" },
        format: 'dd/MM/yyyy',
        size: 100,
        // date picker
        muiEditTextFieldProps: {
          required: true,
          type: 'date',
          dateSetting: { locale: "en-NZ" },
          format: 'dd/MM/yyyy',
          error: !!validationErrors.date,
          helperText: validationErrors.date,
          //remove any previous validation errors when user focuses on the input
          onFocus: () =>
            dispatchValidationErrors({
              date: undefined,
          }),
          // validate on change
          onChange: handleDateChange,
          onBlur: handleDateChange,
        },

        // display as DD/MM/YYYY
        Cell: ({ cell }) => formatDate(cell.getValue() as string),
      },
      {
        accessorKey: 'description',
        header: 'Description',
        size: 250,
        muiEditTextFieldProps: {
          required: true,
          error: !!validationErrors.description,
          helperText: validationErrors.description,
          onFocus: () =>
            dispatchValidationErrors({
              description: undefined,
          }),
          onChange: handleDescriptionChange,
          onBlur: handleDescriptionChange,
        },
      },
      {
        accessorKey: 'amount',
        header: 'Amount',
        size: 50,
        muiEditTextFieldProps: {
          type: 'number',
          format: 'currency',
          required: true,
          error: !!validationErrors.amount,
          helperText: validationErrors.amount,
          onFocus: () =>
            dispatchValidationErrors({
              amount: undefined,
          }),
          onChange: handleAmountChange,
          onBlur: handleAmountChange,
        },
        // format as currency
        Cell: ({ cell }) => formatCurrency(cell.getValue() as number),
      },
      {
        accessorKey: 'category',
        header: 'Category',
        size: 50,
        muiEditTextFieldProps: {
          select: true,
          required: true,
          children: fetchedCategories.map((category) => (
            <MenuItem key={category.name} value={category.name}>
              {category.name}
            </MenuItem>
          )),
          error: !!validationErrors.category,
          helperText: validationErrors.category,
          onFocus: () =>
            dispatchValidationErrors({
              category: undefined,
          }),
          // onChange: handleCategoryChange,
          // onBlur: handleCategoryChange,
        },
      },
    ],
    [validationErrors, fetchedCategories]
  );

  const table = useMaterialReactTable<db.Transaction>({
    columns,
    data: fetchedTransactions,
    createDisplayMode: 'row',
    editDisplayMode: 'row',
    enableEditing: true,
    enableBottomToolbar: true,
    enableStickyFooter: true,
    enableTopToolbar: true,
    enableStickyHeader: true,
    enablePagination: true,
    onPaginationChange: setPagination,
    memoMode: 'cells',
    // getRowId: (row) => row.id,
    muiToolbarAlertBannerProps: isLoadingCategoriesError
      ? {
          color: 'error',
          children: 'Error loading data',
        }
      : undefined,
    muiTableContainerProps: {
      sx: {
        minHeight: 'calc(100vh - 167px)',
      },
      style: {
        maxHeight: 'calc(100vh - 167px)',
      }
    },
    onCreatingRowCancel: () => dispatchValidationErrors({
      date: undefined,
      description: undefined,
      amount: undefined,
      category: undefined,
    }),
    onCreatingRowSave: handleCreateTransaction,
    onEditingRowCancel: () => dispatchValidationErrors({
      date: undefined,
      description: undefined,
      amount: undefined,
      category: undefined,
    }),
    onEditingRowSave: handleSaveTransaction,
    renderEditRowDialogContent: useCallback<
      Required<MRT_TableOptions<db.Transaction>>['renderEditRowDialogContent']
    >( 
      ({ table, row, internalEditComponents }) => 
      <>
        <DialogTitle variant="h3">Edit Transaction</DialogTitle>
        <DialogContent
          sx={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
        >
          {internalEditComponents} {/* or render custom edit components here */}
        </DialogContent>
        <DialogActions>
          <MRT_EditActionButtons variant="text" table={table} row={row} />
        </DialogActions>
      </>,
      [],
    ),
    renderRowActions: useCallback<
    Required<MRT_TableOptions<db.Transaction>>['renderRowActions']
    >( 
      ({ row, table }) =>
      <Box sx={{ display: 'flex', gap: '1rem' }}>
        <Tooltip title="Edit">
          <IconButton onClick={() => handleEditingRow(table, row)}>
            <EditIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Delete">
          <IconButton color="error" onClick={() => openDeleteConfirmModal(row)}>
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      </Box>,
      [],
    ),
    renderTopToolbarCustomActions: useCallback<
    Required<MRT_TableOptions<db.Transaction>>['renderTopToolbarCustomActions']
    >( 
      ({ table }) => 
      <div className="table-top-toolbar-container">
        <div onClick={ () => handleCreatingRow(table) }>
        <IconButton>
          <AddIcon />
        </IconButton>
        </div>
        <h2>{type}</h2>
      </div>,
      [],
    ),
    state: {
      isLoading: isLoadingTransactions || isLoadingCategories,
      isSaving: isCreatingTransaction || isUpdatingTransaction || isDeletingTransaction,
      showAlertBanner: isLoadingTransactionsError,
      showProgressBars: isFetchingTransactions || isFetchingCategories,
      pagination,
    },
  });

  return <MaterialReactTable table={table} />;
}

export default TransactionsTable;
