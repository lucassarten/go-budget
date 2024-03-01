/* eslint-disable promise/always-return */
/* eslint-disable promise/catch-or-return */
/* eslint-disable no-nested-ternary */
/* eslint-disable camelcase */
import { useCallback, useMemo, useState } from 'react';
import {
  MaterialReactTable,
  useMaterialReactTable,
  MRT_EditActionButtons,
  type MRT_ColumnDef,
  type MRT_TableOptions,
  type MRT_Row,
  createRow,
} from 'material-react-table';
import {
  Box,
  Button,
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
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

import { Exec, QueryCategories } from "../../../wailsjs/go/db/Db";
import { db } from "../../../wailsjs/go/models";

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
    target: !validateAmount(String(category.target))
      ? 'Target must be a positive number'
      : '',
    colour: !validateColour(category.colour) ? 'Colour must be a valid hex code' : '',
  };
}

function useCreateCategory(type: string){
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (category: db.Category) => {
      // update row in db
      return await Exec(
        `INSERT INTO Categories${type} (name, target, colour) VALUES (?, ?, ?)`,
        [category.name, category.target, category.colour]
      );
    },
    //client side optimistic update
    onMutate: (newCategoryInfo: db.Category) => {
      queryClient.setQueryData(['categories'+type], (prevCategories: any) =>
        [
        ...prevCategories, newCategoryInfo
        ] as db.Category[],
      );
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['categories'+type] }),
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

function useUpdateCategory(type: string){
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (category: db.Category) => {
      // update row in db
      console.log("attempting to update categories")
      return await Exec(
        `UPDATE Categories${type} SET name = ?, target = ?, colour = ? WHERE name = ?`, 
        [category.name, category.target, category.colour, category.name]
      );
    },
    //client side optimistic update
    onMutate: (newCategoryInfo: db.Category) => {
      queryClient.setQueryData(['categories'+type], (prevCategories: any) =>
        prevCategories?.map((prevCategory: db.Category) =>
          prevCategory.name === newCategoryInfo.name ? newCategoryInfo : prevCategory,
        ),
      );
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['categories'+type] }),
  });
}

function useDeleteCategory(type: string){
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (name: string) => {
      // update row in db
      console.log("attempting to delete category from db")
      return await Exec(`DELETE FROM Categories${type} WHERE name = ?`, [name]);
    },
    // client side optimistic update
    onMutate: (name: string) => {
      queryClient.setQueryData(['categories'+type], (prevCategories: any) =>
        prevCategories?.filter((prevCategory: db.Category) => prevCategory.name !== name),
      );
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['categories'+type] }),
  });
}

const CategoryTable = ({ type }: { type: string }) => {
  const [validationErrors, setValidationErrors] = useState<Record<string, string | undefined>>({});

  const columns = useMemo<MRT_ColumnDef<db.Category>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'name',
        size: 100,
        // date picker
        muiEditTextFieldProps: {
          required: true,
          error: !!validationErrors?.name,
          helperText: validationErrors?.name,
          //remove any previous validation errors when user focuses on the input
          onFocus: () =>
            setValidationErrors({
              ...validationErrors,
              name: undefined,
            }),
          // validate on change
          onChange: (event: { target: { value: string; }; }) => {
            const isValid = validateRequired(event.target.value);
            if (!isValid) {
              setValidationErrors({
                ...validationErrors,
                name: 'Name is required',
              });
            } else {
              setValidationErrors({
                ...validationErrors,
                name: undefined,
              });
            }
          },
          // validate on blur
          onBlur: (event: { target: { value: string; }; }) => {
            const isValid = validateRequired(event.target.value);
            if (!isValid) {
              setValidationErrors({
                ...validationErrors,
                name: 'Name is required',
              });
            } else {
              setValidationErrors({
                ...validationErrors,
                name: undefined,
              });
            }
          }
        },
      },
      {
        accessorKey: 'target',
        header: 'target',
        size: 50,
        // format as currency
        Cell: ({ cell }) => formatCurrency(cell.getValue() as number),
        muiEditTextFieldProps: {
          required: true,
          error: !!validationErrors?.target,
          helperText: validationErrors?.target,
          //remove any previous validation errors when user focuses on the input
          onFocus: () =>
            setValidationErrors({
              ...validationErrors,
              target: undefined,
            }),
          // validate on change
          onChange: (event: { target: { value: string; }; }) => {
            const isValid = validateAmount(event.target.value);
            if (!isValid) {
              setValidationErrors({
                ...validationErrors,
                target: 'Target must be a positive number',
              });
            } else {
              setValidationErrors({
                ...validationErrors,
                target: undefined,
              });
            }
          },
          // validate on blur
          onBlur: (event: { target: { value: string; }; }) => {
            const isValid = validateAmount(event.target.value);
            if (!isValid) {
              setValidationErrors({
                ...validationErrors,
                target: 'Target must be a positive number',
              });
            } else {
              setValidationErrors({
                ...validationErrors,
                target: undefined,
              });
            }
          }
        },
      },
      {
        accessorKey: 'colour',
        header: 'colour',
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
          //remove any previous validation errors when user focuses on the input
          onFocus: () =>
            setValidationErrors({
              ...validationErrors,
              colour: undefined,
            }),
          // validate on change
          onChange: (event: { target: { value: string; }; }) => {
            const isValid = validateColour(event.target.value);
            if (!isValid) {
              setValidationErrors({
                ...validationErrors,
                colour: 'Colour must be a valid hex code',
              });
            } else {
              setValidationErrors({
                ...validationErrors,
                colour: undefined,
              });
            }
          },
          // validate on blur
          onBlur: (event: { target: { value: string; }; }) => {
            const isValid = validateColour(event.target.value);
            if (!isValid) {
              setValidationErrors({
                ...validationErrors,
                colour: 'Colour must be a valid hex code',
              });
            } else {
              setValidationErrors({
                ...validationErrors,
                colour: undefined,
              });
            }
          }
        },
      },
    ],
    [validationErrors],
  );

  // hooks
  const { mutateAsync: createCategory, isPending: isCreatingCategory } = useCreateCategory(type);
  const {
    data: fetchedCategories = [],
    isError: isLoadingCategoriesError,
    isFetching: isFetchingCategories,
    isLoading: isLoadingCategories,
  } = useGetCategories(type);
  const { mutateAsync: updateCategory, isPending: isUpdatingCategory } = useUpdateCategory(type);
  const  { mutateAsync: deleteCategory, isPending: isDeletingCategory } = useDeleteCategory(type);

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
      setValidationErrors(newValidationErrors);
      return;
    }
    setValidationErrors({});
    await createCategory(values);
    table.setCreatingRow(false);
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
      setValidationErrors(newValidationErrors);
      return;
    }
    setValidationErrors({});
    await updateCategory(values);
    table.setEditingRow(null);
  };

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
        minHeight: '500px',
      },
      style: {
        maxHeight: 'calc(100vh - 121px)',
      }
    },
    onCreatingRowCancel: () => setValidationErrors({}),
    onCreatingRowSave: handleCreateCategory,
    onEditingRowCancel: () => setValidationErrors({}),
    onEditingRowSave: handleSaveCategory,
    renderCreateRowDialogContent: useCallback<
      Required<MRT_TableOptions<db.Category>>['renderCreateRowDialogContent']
    >(
      ({ table, row, internalEditComponents }) => 
      <>
        <DialogTitle variant="h3">Add Category</DialogTitle>
        <DialogContent
          sx={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
        >
          {internalEditComponents} {/* or render custom edit components here */}
        </DialogContent>
        <DialogActions>
          <MRT_EditActionButtons variant="text" table={table} row={row} />
        </DialogActions>
      </>,
      [],
    ),
    //optionally customize modal content
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
          <IconButton onClick={() => table.setEditingRow(row)}>
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
      <span className="table-top-toolbar-container">
        <Button
          className="button-add-category"
          variant="contained"
          onClick={() => {
            table.setCreatingRow(true);
            table.setCreatingRow(
              createRow(table, {
                name: 'category',
                target: 0,
                colour: '#'+Math.floor(Math.random()*16777215).toString(16),
              }),
            );
            // scroll to top of table
            document.querySelector('.MuiTableContainer-root')?.scrollTo({
              top: 0,
              behavior: 'smooth',
            });
          }}
        >
          Add
        </Button>
        <h2>{type}</h2>
      </span>,
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
