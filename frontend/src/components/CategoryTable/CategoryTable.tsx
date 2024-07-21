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

import { CreateCategory, DeleteCategory, GetCategoriesByType, GetCategoryByID, UpdateCategory } from "../../../wailsjs/go/db/Db.js";
import { ent } from "../../../wailsjs/go/models.js";

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

function validateCategory(category: ent.Category) {
  return {
    name: !validateRequired(String(category.name)) ? 'Name is required' : '',
    monthly: !validateAmount(String(category.monthly))
      ? 'Target must be a positive number'
      : '',
    weekly: !validateAmount(String(category.weekly))
      ? 'Target must be a positive number'
      : '',
    colour: !validateColour(String(category.colour)) ? 'Colour must be a valid hex code' : '',
  };
}

// database management functions

function useCreateCategory(type: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (category: ent.Category) => {
      // Calculate the other budget type if not provided
      const monthly = Number(category.monthly);
      const weekly = Number(category.weekly);
      if (!weekly || weekly === 0) {
        category.weekly = monthly / 4.34524; // Assuming 4.34524 weeks in a month
      } else if (!monthly || monthly === 0) {
        category.monthly = weekly * 4.34524; // Assuming 4.34524 weeks in a month
      }
      // update row in db
      return await CreateCategory(String(category.name), Number(category.monthly), Number(category.weekly), String(category.colour), String(type));
    },
    //client side optimistic update
    onMutate: (newCategoryInfo: ent.Category) => {
      queryClient.setQueryData(['categories' + type], (prevCategories: any) =>
        [
          ...prevCategories, newCategoryInfo
        ] as ent.Category[],
      );
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['categories' + type] }),
  });
}

function useGetCategories(type: string) {
  return useQuery<ent.Category[]>({
    queryKey: ['categories' + type],
    queryFn: async () => {
      return await GetCategoriesByType(type);
    },
    refetchOnWindowFocus: false,
  });
}

function useUpdateCategory(type: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (category: ent.Category) => {
      // Get current record from db
      const current = await GetCategoryByID(Number(category.id));
      // Check if monthly or weekly is being updated
      const monthly = Number(category.monthly);
      const weekly = Number(category.weekly);
      if (category.monthly !== current.monthly) {
        category.weekly = monthly / 4.34524; // Assuming 4.34524 weeks in a month
      } else if (category.weekly !== current.weekly) {
        category.monthly = weekly * 4.34524; // Assuming 4.34524 weeks in a month
      }

      // update row in db
      return await UpdateCategory(Number(category.id), String(category.name), Number(category.monthly), Number(category.weekly), String(category.colour), String(category.type));
    },
    // client side optimistic update
    onMutate: (newCategoryInfo: ent.Category) => {
      queryClient.setQueryData(['categories' + type], (prevCategories: any) =>
        prevCategories?.map((prevCategory: ent.Category) =>
          prevCategory.id === newCategoryInfo.id ? newCategoryInfo : prevCategory,
        ),
      );
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['categories' + type] }),
  });
}

function useDeleteCategory(type: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      // update row in db
      return await DeleteCategory(id)
    },
    // client side optimistic update
    onMutate: (id: number) => {
      queryClient.setQueryData(['categories' + type], (prevCategories: any) =>
        prevCategories?.filter((prevCategory: ent.Category) => prevCategory.id !== id),
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
  const handleCreateCategory: MRT_TableOptions<ent.Category>['onCreatingRowSave'] = async ({
    values,
    table,
  }: {
    values: ent.Category;
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

  const handleEditingRow = (table: any, row: MRT_Row<ent.Category>) => {
    dispatchValidationErrors({
      name: undefined,
      weeklyBudget: undefined,
      monthlyBudget: undefined,
      colour: undefined,
    });
    table.setEditingRow(row);
  }

  const openDeleteConfirmModal = (row: MRT_Row<ent.Category>) => {
    if (window.confirm('Are you sure you want to delete this Category?')) {
      deleteCategory(Number(row.original.id));
    }
  };

  const handleSaveCategory: MRT_TableOptions<ent.Category>['onEditingRowSave'] = async ({
    values,
    table,
  }: {
    values: ent.Category;
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

  const columns = useMemo<MRT_ColumnDef<ent.Category>[]>(
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

  const table = useMaterialReactTable<ent.Category>({
    columns,
    data: fetchedCategories,
    createDisplayMode: 'row',
    editDisplayMode: 'row',
    enableEditing: true,
    enableBottomToolbar: false,
    enableStickyHeader: true,
    enablePagination: false,
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
      Required<MRT_TableOptions<ent.Category>>['renderEditRowDialogContent']
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
      Required<MRT_TableOptions<ent.Category>>['renderRowActions']
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
      Required<MRT_TableOptions<ent.Category>>['renderTopToolbarCustomActions']
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
