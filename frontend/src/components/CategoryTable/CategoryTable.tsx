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
import { useCallback, useMemo, useReducer } from 'react';

import { Exec, QueryCategories } from "../../../wailsjs/go/db/Db";
import { db } from "../../../wailsjs/go/models";

import './CategoryTable.css';

// validation functions

const validateRequired = (value: string) => !!value.length;

const formatCurrency = (value: number) => {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'NZD',
    currencyDisplay: 'symbol',
  });
  return formatter.format(value);
};

const validateAmount = (value: string) => {
  const number = Number(value);
  return !Number.isNaN(number) && number >= 0;
};

const validateColour = (value: string) => {
  const regex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
  return regex.test(value);
}

function validateCategory(category: db.Category) {
  return {
    name: !validateRequired(category.name) ? 'Name is required' : '',
    monthly: !validateAmount(String(category.monthly))
      ? 'Target must be a positive number'
      : '',
    weekly: !validateAmount(String(category.weekly))
      ? 'Target must be a positive number'
      : '',
    colour: !validateColour(category.colour) ? 'Colour must be a valid hex code' : '',
  };
}

// database management functions

function useCreateCategory(type: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (category: db.Category) => {
      // Calculate the other budget type if not provided
      const monthly = category.monthly;
      const weekly = category.weekly;
      if (!weekly || weekly === 0) {
        category.weekly = monthly / 4.34524; // Assuming 4.34524 weeks in a month
      } else if (!monthly || monthly === 0) {
        category.monthly = weekly * 4.34524; // Assuming 4.34524 weeks in a month
      }
      // update row in db
      return await Exec(
        `INSERT INTO Categories${type} (name, monthly, weekly, colour) VALUES (?, ?, ?, ?)`,
        [category.name, category.monthly, category.weekly, category.colour]
      );
    },
    //client side optimistic update
    onMutate: (newCategoryInfo: db.Category) => {
      queryClient.setQueryData(['categories' + type], (prevCategories: any) =>
        [
          ...prevCategories, newCategoryInfo
        ] as db.Category[],
      );
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['categories' + type] }),
  });
}

function useGetCategories(type: string) {
  return useQuery<db.Category[]>({
    queryKey: ['categories' + type],
    queryFn: async () => {
      return await QueryCategories(`SELECT * FROM Categories${type}`, []);
    },
    refetchOnWindowFocus: false,
  });
}

function useUpdateCategory(type: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (category: db.Category) => {
      if (category.name === '🚫 Ignore' || category.name === '❓ Other' || category.name === '🔁 Reimbursement') {
        window.alert('Cannot update default categories');
        return;
      }
      // Get current record from db
      const current = await QueryCategories(`SELECT * FROM Categories${type} WHERE name = ?`, [category.name]);
      // Check if monthly or weekly is being updated
      if (category.monthly !== current[0].monthly) {
        category.weekly = category.monthly / 4.34524; // Assuming 4.34524 weeks in a month
      } else if (category.weekly !== current[0].weekly) {
        category.monthly = category.weekly * 4.34524; // Assuming 4.34524 weeks in a month
      }

      // update row in db
      return await Exec(
        `UPDATE Categories${type} SET name = ?, monthly = ?, weekly = ?, colour = ? WHERE name = ?`,
        [category.name, category.monthly, category.weekly, category.colour, category.name]
      );
    },
    // client side optimistic update
    onMutate: (newCategoryInfo: db.Category) => {
      queryClient.setQueryData(['categories' + type], (prevCategories: any) =>
        prevCategories?.map((prevCategory: db.Category) =>
          prevCategory.name === newCategoryInfo.name ? newCategoryInfo : prevCategory,
        ),
      );
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['categories' + type] }),
  });
}

function useDeleteCategory(type: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (name: string) => {
      if (name === '🚫 Ignore' || name === '❓ Other' || name === '🔁 Reimbursement') {
        window.alert('Cannot delete default categories');
        return;
      }
      // update row in db
      return await Exec(`DELETE FROM Categories${type} WHERE name = ?`, [name]);
    },
    // client side optimistic update
    onMutate: (name: string) => {
      queryClient.setQueryData(['categories' + type], (prevCategories: any) =>
        prevCategories?.filter((prevCategory: db.Category) => prevCategory.name !== name),
      );
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['categories' + type] }),
  });
}

type ValidationErrors = {
  name?: string;
  weeklyBudget?: string;
  monthlyBudget?: string;
  colour?: string;
};

type ValidationAction = Partial<ValidationErrors>;

const CategoryTable = ({ type }: { type: string }) => {
  const [validationErrors, dispatchValidationErrors] = useReducer(
    (state: ValidationErrors, action: ValidationAction) => ({ ...state, ...action }),
    {}
  );

  // validation handlers

  const handleNameChange = debounce(useCallback((event: { target: { value: string; }; }) => {
    const isValid = validateRequired(event.target.value);

    dispatchValidationErrors({
      name: isValid ? undefined : 'Name is required',
    });
  }, [validateRequired]), 500);

  const handleTargetChange = debounce(useCallback((event: { target: { value: string; }; }) => {
    const isValid = validateAmount(event.target.value);

    dispatchValidationErrors({
      weeklyBudget: isValid ? undefined : 'Target must be a positive number',
      monthlyBudget: isValid ? undefined : 'Target must be a positive number',
    });
  }, [validateAmount]), 500);

  const handleColourChange = debounce(useCallback((event: { target: { value: string; }; }) => {
    const isValid = validateColour(event.target.value);

    dispatchValidationErrors({
      colour: isValid ? undefined : 'Colour must be a valid hex code',
    });
  }, [validateColour]), 500);


  // hooks
  const {
    data: fetchedCategories = [],
    isError: isLoadingCategoriesError,
    isFetching: isFetchingCategories,
    isLoading: isLoadingCategories,
  } = useGetCategories(type);
  const { mutateAsync: createCategory, isPending: isCreatingCategory } = useCreateCategory(type);
  const { mutateAsync: updateCategory, isPending: isUpdatingCategory } = useUpdateCategory(type);
  const { mutateAsync: deleteCategory, isPending: isDeletingCategory } = useDeleteCategory(type);

  // actions
  const handleCreateCategory: MRT_TableOptions<db.Category>['onCreatingRowSave'] = async ({
    values,
    table,
  }: {
    values: db.Category;
    table: any;
  }) => {
    const newValidationErrors = validateCategory(values);
    if (Object.values(newValidationErrors).some((error) => error)) {
      dispatchValidationErrors(newValidationErrors);
      return;
    }
    dispatchValidationErrors({
      name: undefined,
      weeklyBudget: undefined,
      monthlyBudget: undefined,
      colour: undefined,
    });
    await createCategory(values);
    table.setCreatingRow(false);
  }

  const handleCreatingRow = (table: any) => {
    table.setCreatingRow(true);
    dispatchValidationErrors({
      name: undefined,
      weeklyBudget: undefined,
      monthlyBudget: undefined,
      colour: undefined,
    });
    table.setCreatingRow(
      createRow(table, {
        name: '',
        weeklyBudget: 0,
        monthlyBudget: 0,
        colour: '#' + Math.floor(Math.random() * 16777215).toString(16),
      }),
    );
    // scroll to top of table
    document.querySelector('.MuiTableContainer-root')?.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }

  const handleEditingRow = (table: any, row: MRT_Row<db.Category>) => {
    dispatchValidationErrors({
      name: undefined,
      weeklyBudget: undefined,
      monthlyBudget: undefined,
      colour: undefined,
    });
    table.setEditingRow(row);
  }

  const openDeleteConfirmModal = (row: MRT_Row<db.Category>) => {
    if (window.confirm('Are you sure you want to delete this Category?')) {
      deleteCategory(row.original.name);
    }
  };

  const handleSaveCategory: MRT_TableOptions<db.Category>['onEditingRowSave'] = async ({
    values,
    table,
  }: {
    values: db.Category;
    table: any;
  }) => {
    const newValidationErrors = validateCategory(values);
    if (Object.values(newValidationErrors).some((error) => error)) {
      dispatchValidationErrors(newValidationErrors);
      return;
    }
    dispatchValidationErrors({
      name: undefined,
      weeklyBudget: undefined,
      monthlyBudget: undefined,
      colour: undefined,
    });
    await updateCategory(values);
    table.setEditingRow(null);
  };

  const columns = useMemo<MRT_ColumnDef<db.Category>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Name',
        size: 100,
        muiEditTextFieldProps: {
          required: true,
          error: !!validationErrors?.name,
          helperText: validationErrors?.name,
          //remove any previous validation errors when user focuses on the input
          onFocus: () =>
            dispatchValidationErrors({
              name: undefined,
            }),
          // validate on change
          onChange: handleNameChange,
          onBlur: handleNameChange,
        },
      },
      {
        accessorKey: 'weekly',
        header: 'Weekly Budget',
        size: 50,
        Cell: ({ cell }) => formatCurrency(cell.getValue() as number),
        muiEditTextFieldProps: {
          required: true,
          error: !!validationErrors?.weeklyBudget,
          helperText: validationErrors?.weeklyBudget,
          onFocus: () =>
            dispatchValidationErrors({
              weeklyBudget: undefined
            }),
          onChange: handleTargetChange,
          onBlur: handleTargetChange,
          name: 'weeklyBudget',
        },
      },
      {
        accessorKey: 'monthly',
        header: 'Monthly Budget',
        size: 50,
        Cell: ({ cell }) => formatCurrency(cell.getValue() as number),
        muiEditTextFieldProps: {
          required: true,
          error: !!validationErrors?.monthlyBudget,
          helperText: validationErrors?.monthlyBudget,
          onFocus: () =>
            dispatchValidationErrors({
              monthlyBudget: undefined
            }),
          onChange: handleTargetChange,
          onBlur: handleTargetChange,
          name: 'monthlyBudget',
        },
      },
      {
        accessorKey: 'colour',
        header: 'Colour',
        size: 50,
        // Set cell background colour to cell value
        Cell: ({ cell }) => (
          <div
            style={{
              backgroundColor: String(cell.getValue()),
              width: '100%',
              height: '100%',
            }}
          >
            {cell.getValue() as React.ReactNode}
          </div>
        ),
        muiEditTextFieldProps: {
          required: true,
          error: !!validationErrors?.colour,
          helperText: validationErrors?.colour,
          // remove any previous validation errors when user focuses on the input
          onFocus: () =>
            dispatchValidationErrors({
              colour: undefined,
            }),
          // validate on change
          onChange: handleColourChange,
          onBlur: handleColourChange,
        },
      },
    ],
    [validationErrors],
  );

  const table = useMaterialReactTable<db.Category>({
    columns,
    data: fetchedCategories,
    createDisplayMode: 'row',
    editDisplayMode: 'row',
    enableEditing: true,
    enableBottomToolbar: false,
    enableStickyHeader: true,
    enablePagination: false,
    memoMode: 'cells',
    getRowId: (row) => row.name,
    muiToolbarAlertBannerProps: isLoadingCategoriesError
      ? {
        color: 'error',
        children: 'Error loading data',
      }
      : undefined,
    muiTableContainerProps: {
      sx: {
        minHeight: 'calc(100vh - 121px)',
      },
      style: {
        maxHeight: 'calc(100vh - 121px)',
      }
    },
    onCreatingRowCancel: () => dispatchValidationErrors({
      name: undefined,
      weeklyBudget: undefined,
      monthlyBudget: undefined,
      colour: undefined,
    }),
    onCreatingRowSave: handleCreateCategory,
    onEditingRowCancel: () => dispatchValidationErrors({
      name: undefined,
      weeklyBudget: undefined,
      monthlyBudget: undefined,
      colour: undefined,
    }),
    onEditingRowSave: handleSaveCategory,
    renderEditRowDialogContent: useCallback<
      Required<MRT_TableOptions<db.Category>>['renderEditRowDialogContent']
    >(
      ({ table, row, internalEditComponents }) =>
        <>
          <DialogTitle variant="h3">Edit Category</DialogTitle>
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
      Required<MRT_TableOptions<db.Category>>['renderRowActions']
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
      Required<MRT_TableOptions<db.Category>>['renderTopToolbarCustomActions']
    >(
      ({ table }) =>
        <div className="table-top-toolbar-container">
          <div onClick={() => handleCreatingRow(table)}>
            <IconButton>
              <AddIcon />
            </IconButton>
          </div>
          <h2>{type}</h2>
        </div>,
      [],
    ),
    state: {
      isLoading: isLoadingCategories,
      isSaving: isCreatingCategory || isUpdatingCategory || isDeletingCategory,
      showAlertBanner: isLoadingCategoriesError,
      showProgressBars: isFetchingCategories,
    },
  });

  return <MaterialReactTable table={table} />;
}

export default CategoryTable;
