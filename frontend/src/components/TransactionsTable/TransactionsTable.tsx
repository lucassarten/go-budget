/* eslint-disable promise/always-return */
/* eslint-disable promise/catch-or-return */
/* eslint-disable no-nested-ternary */
/* eslint-disable camelcase */
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import {
  Box,
  Button,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  Popover,
  Tooltip,
} from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getUnixTime, parse } from 'date-fns';
import debounce from "lodash.debounce";
import {
  MRT_EditActionButtons,
  MaterialReactTable,
  createRow,
  useMaterialReactTable,
  type MRT_ColumnDef,
  type MRT_Row,
  type MRT_TableOptions,
} from "material-react-table";
import PopupState, { bindPopover, bindTrigger } from "material-ui-popup-state";
import { useCallback, useMemo, useReducer, useState } from "react";

import {
  CreateTransaction,
  DeleteTransaction,
  GetCategoriesByType,
  GetTransactions,
  UpdateTransaction,
} from "../../../wailsjs/go/db/Db";
import { ent } from "../../../wailsjs/go/models";
import TransactionSearch from "../TransactionSearch/TransactionSearch";

// validation functions

const formatCurrency = (value: number) => {
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "NZD",
    currencyDisplay: "symbol",
  });
  return formatter.format(value);
};

const formatDate = (value: string) => {
  const date = new Date(value);
  return date.toLocaleDateString("en-NZ", {
    day: "numeric",
    month: "numeric",
    year: "numeric",
  });
};

const convertToUnixTimestamp = (pattern: string, dateStr: string) => {
  const parsedDate = parse(dateStr, pattern, new Date());
  return getUnixTime(parsedDate);
}

const validateRequired = (value: string) => !!value.length;

const validateDate = (value: number) => {
  const date = new Date(value);
  return !Number.isNaN(date.getTime());
};

const validateAmount = (value: string) => {
  const number = Number(value);
  return !Number.isNaN(number);
};

const validateTransaction = (transaction: ent.Transaction) => {
  return {
    date: validateDate(Number(transaction.time))
      ? undefined
      : "Date must be a valid date",
    description: validateRequired(String(transaction.description))
      ? undefined
      : "Description is required",
    amount: validateAmount(Number(transaction.amount).toString())
      ? undefined
      : "Amount must be a number >0",
  };
};

// database management functions

function useCreateTransaction(type: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (transaction: ent.Transaction) => {
      if (type === "Income") {
        transaction.amount = Math.abs(Number(transaction.amount));
      } else {
        transaction.amount = -Math.abs(Number(transaction.amount));
      }
      // update row in db
      return await CreateTransaction(
        Number(transaction.time),
        String(transaction.description),
        Number(transaction.amount),
        Number(transaction.category_id),
      );
    },
    //client side optimistic update
    onMutate: (newTransactionInfo: ent.Transaction) => {
      queryClient.setQueryData(
        ["transactions"],
        (prevTransactions: any) =>
          [...prevTransactions, newTransactionInfo] as ent.Transaction[]
      );
    },
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: ["transactions"] }),
  });
}

function useGetCategories(type: string) {
  return useQuery<ent.Category[]>({
    queryKey: ["categories" + type],
    queryFn: async () => {
      return await GetCategoriesByType(type);
    },
    refetchOnWindowFocus: false,
  });
}

function useGetTransactions(type: string) {
  return useQuery<ent.Transaction[]>({
    queryKey: ["transactions"],
    queryFn: async () => {
      return await GetTransactions();
    },
    refetchOnWindowFocus: false,
  });
}

function useUpdateTransaction(type: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (transaction: ent.Transaction) => {
      if (type === "Income") {
        transaction.amount = Math.abs(Number(transaction.amount));
      } else {
        transaction.amount = -Math.abs(Number(transaction.amount));
      }
      // update row in db
      return await UpdateTransaction(
        Number(transaction.id),
        Number(transaction.time),
        String(transaction.description),
        Number(transaction.amount),
        Number(transaction.category_id),
        Number(transaction.reimbursed_by_id)
      );
    },
    // client side optimistic update
    onMutate: (newTransactionInfo: ent.Transaction) => {
      queryClient.setQueryData(["transactions"], (prevTransactions: any) =>
        prevTransactions?.map((prevTransaction: ent.Transaction) =>
          prevTransaction.id === newTransactionInfo.id
            ? newTransactionInfo
            : prevTransaction
        )
      );
    },
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: ["transactions"] }),
  });
}

function useDeleteTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      // update row in db
      return await DeleteTransaction(id);
    },
    // client side optimistic update
    onMutate: (id: number) => {
      queryClient.setQueryData(["transactions"], (prevTransactions: any) =>
        prevTransactions?.filter(
          (prevTransaction: ent.Transaction) => prevTransaction.id !== id
        )
      );
    },
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: ["transactions"] }),
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
    (state: ValidationErrors, action: ValidationAction) => ({
      ...state,
      ...action,
    }),
    {}
  );
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 20,
  });
  // validation handlers

  const handleDateChange = debounce(
    useCallback(
      (event: { target: { value: string } }) => {
        const isValid = validateDate(convertToUnixTimestamp("dd/MM/yyyy", event.target.value));

        dispatchValidationErrors({
          date: isValid ? undefined : "Date must be a valid date",
        });
      },
      [validateDate]
    ),
    500
  );

  const handleDescriptionChange = debounce(
    useCallback(
      (event: { target: { value: string } }) => {
        const isValid = validateRequired(event.target.value);

        dispatchValidationErrors({
          description: isValid ? undefined : "Description is required",
        });
      },
      [validateRequired]
    ),
    500
  );

  const handleAmountChange = debounce(
    useCallback(
      (event: { target: { value: string } }) => {
        const isValid = validateAmount(event.target.value);

        dispatchValidationErrors({
          amount: isValid ? undefined : "Amount must be a number >0",
        });
      },
      [validateAmount]
    ),
    500
  );

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
  const { mutateAsync: createTransaction, isPending: isCreatingTransaction } =
    useCreateTransaction(type);
  const { mutateAsync: updateTransaction, isPending: isUpdatingTransaction } =
    useUpdateTransaction(type);
  const { mutateAsync: deleteTransaction, isPending: isDeletingTransaction } =
    useDeleteTransaction();

  const filteredTransactions = useMemo(() => {
    return type === "Income"
      ? fetchedTransactions.filter((transaction) => Number(transaction.amount) > 0)
      : fetchedTransactions.filter((transaction) => Number(transaction.amount) < 0);
  }, [type, fetchedTransactions]);

  // actions
  const handleCreateTransaction: MRT_TableOptions<ent.Transaction>["onCreatingRowSave"] =
    async ({ values, table }: { values: ent.Transaction; table: any }) => {
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
    };

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
        date: new Date().toISOString().split("T")[0],
        description: "",
        amount: 1,
        category: fetchedCategories[0]?.name || "",
      })
    );
    // scroll to top of table
    document.querySelector(".MuiTableContainer-root")?.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleEditingRow = (table: any, row: MRT_Row<ent.Transaction>) => {
    dispatchValidationErrors({
      date: undefined,
      description: undefined,
      amount: undefined,
      category: undefined,
    });
    table.setEditingRow(row);
  };

  const openDeleteConfirmModal = (row: MRT_Row<ent.Transaction>) => {
    if (window.confirm("Are you sure you want to delete this Transaction?")) {
      deleteTransaction(Number(row.original.id));
    }
  };

  const handleSaveTransaction: MRT_TableOptions<ent.Transaction>["onEditingRowSave"] =
    async ({ values, table }: { values: ent.Transaction; table: any }) => {
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

  const columns = useMemo<MRT_ColumnDef<ent.Transaction>[]>(
    () => [
      {
        accessorKey: "id",
        header: "ID",
        enableColumnOrdering: false,
        enableEditing: false,
        enableSorting: false,
        size: 50,
        // hide: true, // no clue why this doesn't work so will have to do below
        // hide header
        muiTableHeadCellProps: {
          style: {
            display: "none",
          },
        },
        // hide cell
        muiTableBodyCellProps: {
          style: {
            display: "none",
          },
        },
      },
      {
        accessorKey: "date",
        header: "Date",
        type: "date",
        format: "dd/MM/yyyy",
        size: 100,
        // date picker
        muiEditTextFieldProps: {
          required: true,
          type: "date",
          format: "dd/MM/yyyy",
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
        accessorKey: "description",
        header: "Description",
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
        accessorKey: "amount",
        header: "Amount",
        size: 50,
        muiEditTextFieldProps: {
          type: "number",
          format: "currency",
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
        Cell: ({ cell }) => {
          const transactionAmount = cell.getValue() as number;
          const reimbursedTransaction = fetchedTransactions.find(
            (transaction) => transaction.id === cell.row.original.reimbursed_by_id
          );

          if (reimbursedTransaction) {
            const totalAmount = transactionAmount + Number(reimbursedTransaction.amount);
            return (
              <>
                {formatCurrency(totalAmount)}{' '}
                <span style={{ color: 'green' }}>
                  ({formatCurrency(Number(reimbursedTransaction.amount))} Reimbursed)
                </span>
              </>
            );
          } else {
            return formatCurrency(transactionAmount);
          }
        },
      },
      {
        accessorKey: "edges.category.name",
        header: "Category",
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

  const table = useMaterialReactTable<ent.Transaction>({
    columns,
    data: filteredTransactions,
    createDisplayMode: "row",
    editDisplayMode: "row",
    enableEditing: true,
    enableBottomToolbar: true,
    enableStickyFooter: true,
    enableTopToolbar: true,
    enableStickyHeader: true,
    enablePagination: true,
    onPaginationChange: setPagination,
    memoMode: "cells",
    // getRowId: (row) => row.id,
    muiToolbarAlertBannerProps: isLoadingCategoriesError
      ? {
        color: "error",
        children: "Error loading data",
      }
      : undefined,
    muiTableContainerProps: {
      sx: {
        minHeight: "calc(100vh - 167px)",
      },
      style: {
        maxHeight: "calc(100vh - 167px)",
      },
    },
    onCreatingRowCancel: () =>
      dispatchValidationErrors({
        date: undefined,
        description: undefined,
        amount: undefined,
        category: undefined,
      }),
    onCreatingRowSave: handleCreateTransaction,
    onEditingRowCancel: () =>
      dispatchValidationErrors({
        date: undefined,
        description: undefined,
        amount: undefined,
        category: undefined,
      }),
    onEditingRowSave: handleSaveTransaction,
    renderEditRowDialogContent: useCallback<
      Required<MRT_TableOptions<ent.Transaction>>["renderEditRowDialogContent"]
    >(
      ({ table, row, internalEditComponents }) => (
        <>
          <DialogTitle variant="h3">Edit Transaction</DialogTitle>
          <DialogContent
            sx={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}
          >
            {internalEditComponents}{" "}
            {/* or render custom edit components here */}
          </DialogContent>
          <DialogActions>
            <MRT_EditActionButtons variant="text" table={table} row={row} />
          </DialogActions>
        </>
      ),
      []
    ),
    renderRowActions: useCallback<
      Required<MRT_TableOptions<ent.Transaction>>["renderRowActions"]
    >(
      ({ row, table }) => (
        <Box sx={{ display: "flex", gap: "1rem" }}>
          <Tooltip title="Edit">
            <IconButton onClick={() => handleEditingRow(table, row)}>
              <EditIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton
              color="error"
              onClick={() => openDeleteConfirmModal(row)}
            >
              <DeleteIcon />
            </IconButton>
          </Tooltip>
          {type === "Expense" && (
            <PopupState variant="popover" popupId="demo-popup-popover">
              {(popupState) => (
                <div>
                  <Button
                    aria-describedby="reimburse-popover"
                    variant="contained"
                    {...bindTrigger(popupState)}
                  >
                    Reimburse
                  </Button>
                  <Popover
                    {...bindPopover(popupState)}
                    id="reimburse-popover"
                    anchorOrigin={{
                      vertical: "bottom",
                      horizontal: "left",
                    }}
                    transformOrigin={{
                      vertical: "top",
                      horizontal: "left",
                    }}
                  >
                    <TransactionSearch
                      type="Income"
                      onSelect={(transaction) => {
                        row.original.reimbursed_by_id = transaction.id;
                        const reimbursedByTransaction =
                          fetchedTransactions.find(
                            (transaction) =>
                              transaction.id === row.original.reimbursed_by_id
                          );
                        // if (reimbursedByTransaction) {
                        //   reimbursedByTransaction.category_id = "🔁 Reimbursement";
                        //   updateTransaction(reimbursedByTransaction);
                        // }
                        updateTransaction(row.original);
                        popupState.close();
                      }}
                    />
                  </Popover>
                </div>
              )}
            </PopupState>
          )}
        </Box>
      ),
      []
    ),
    renderTopToolbarCustomActions: useCallback<
      Required<
        MRT_TableOptions<ent.Transaction>
      >["renderTopToolbarCustomActions"]
    >(
      ({ table }) => (
        <div className="table-top-toolbar-container">
          <div onClick={() => handleCreatingRow(table)}>
            <IconButton>
              <AddIcon />
            </IconButton>
          </div>
          <h2>{type}</h2>
        </div>
      ),
      []
    ),
    state: {
      isLoading: isLoadingTransactions || isLoadingCategories,
      isSaving:
        isCreatingTransaction || isUpdatingTransaction || isDeletingTransaction,
      showAlertBanner: isLoadingTransactionsError || isLoadingCategoriesError,
      showProgressBars: isFetchingTransactions || isFetchingCategories,
      pagination,
    },
  });

  return <MaterialReactTable table={table} />;
};

export default TransactionsTable;
