/* eslint-disable promise/always-return */
/* eslint-disable promise/catch-or-return */
/* eslint-disable no-nested-ternary */
/* eslint-disable camelcase */
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  MaterialReactTable,
  useMaterialReactTable,
  MRT_EditActionButtons,
  type MRT_Cell,
  type MRT_ColumnDef,
  type MRT_RowSelectionState,
  type MRT_TableOptions,
  type MRT_Table,
  type MRT_Row,
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
  QueryClient,
  QueryClientProvider,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { buttonStyleAdd, buttonStyleCancel } from '../../styles/MUI';

import { Category } from '../Types';
import { Query } from "../../../wailsjs/go/main/Db";

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

function validateCategory(category: Category) {
  return {
    name: !validateRequired(category.name) ? 'Name is required' : '',
    target: !validateAmount(String(category.target))
      ? 'Target must be a positive number'
      : '',
  };
}

interface CreateModalProps {
  columns: MRT_ColumnDef<Category>[];
  onClose: () => void;
  // eslint-disable-next-line no-unused-vars
  onSubmit: (values: Category) => void;
  open: boolean;
}

// export function AddCategoryModal({
//   open,
//   columns,
//   onClose,
//   onSubmit,
// }: CreateModalProps) {
//   const [values, setValues] = useState<any>(() =>
//     columns.reduce((acc, column) => {
//       acc[column.accessorKey ?? ''] = '';
//       return acc;
//     }, {} as any)
//   );

//   const handleSubmit = () => {
//     // put your validation logic here
//     onSubmit(values);
//     onClose();
//   };

//   return (
//     <Dialog open={open}>
//       <DialogTitle textAlign="center">Add Expense Category</DialogTitle>
//       <DialogContent>
//         <form
//           onSubmit={(e) => e.preventDefault()}
//           className="add-category-form"
//         >
//           <Stack
//             sx={{
//               width: '100%',
//               minWidth: { xs: '300px', sm: '360px', md: '400px' },
//               gap: '1.5rem',
//             }}
//           >
//             {columns.slice(0, 1).map((column) => (
//               <TextField
//                 key={column.accessorKey}
//                 label={column.header}
//                 name={column.accessorKey}
//                 onChange={(e) =>
//                   setValues({ ...values, [e.target.name]: e.target.value })
//                 }
//                 required
//                 error={!validateRequired(values.name)}
//               />
//             ))}
//             {columns.slice(1, 2).map((column) => (
//               <TextField
//                 key={column.accessorKey}
//                 label={column.header}
//                 name={column.accessorKey}
//                 onChange={(e) =>
//                   setValues({ ...values, [e.target.name]: e.target.value })
//                 }
//                 required
//                 error={!validateAmount(values.target)}
//                 helperText={
//                   !validateAmount(values.target)
//                     ? `${column.accessorKey} must be a positive number`
//                     : ''
//                 }
//               />
//             ))}
//             {columns.slice(2).map((column) => (
//               <TextField
//                 key={column.accessorKey}
//                 label={column.header}
//                 name={column.accessorKey}
//                 onChange={(e) =>
//                   setValues({ ...values, [e.target.name]: e.target.value })
//                 }
//               />
//             ))}
//           </Stack>
//         </form>
//       </DialogContent>
//       <DialogActions sx={{ p: '1.25rem' }}>
//         <Button onClick={onClose} style={buttonStyleCancel}>
//           Cancel
//         </Button>
//         <Button
//           onClick={handleSubmit}
//           style={
//             !validateAmount(values.target) ||
//             !validateRequired(values.target) ||
//             !validateRequired(values.name)
//               ? buttonStyleAdd.disabled
//               : buttonStyleAdd
//           }
//           // inactive if there are validation errors
//           disabled={
//             !validateAmount(values.target) ||
//             !validateRequired(values.target) ||
//             !validateRequired(values.name)
//           }
//         >
//           Add
//         </Button>
//       </DialogActions>
//     </Dialog>
//   );
// }

function useCreateCategory(){
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (category: Category) => {
      // update row in db
      return await Query(
        "INSERT INTO CategoriesExpense (name, target, colour) VALUES ?, ?, ?",
        [category.name, category.target, category.colour]
      );
    },
    //client side optimistic update
    onMutate: (newCategoryInfo: Category) => {
      queryClient.setQueryData(['categories'], (prevCategories: any) =>
        [
        ...prevCategories, newCategoryInfo
        ] as Category[],
      );
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['categories'] }),
  });
}

function useGetCategories() {
  return useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: async () => {
      console.log("attempting to get categories from db")
      return await Query("SELECT * FROM CategoriesExpense", []);
    },
    refetchOnWindowFocus: false,
  });
}

function useUpdateCategory(){
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (category: Category) => {
      // update row in db
      console.log("attempting to update categories")
      return await Query(
        "UPDATE CategoriesExpense SET name = ?, target = ?, colour = ? WHERE name = ?", 
        [category.name, category.target, category.colour, category.name]
      );
    },
    //client side optimistic update
    onMutate: (newCategoryInfo: Category) => {
      queryClient.setQueryData(['categories'], (prevCategories: any) =>
        prevCategories?.map((prevCategory: Category) =>
          prevCategory.name === newCategoryInfo.name ? newCategoryInfo : prevCategory,
        ),
      );
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['categories'] }),
  });
}

function useDeleteCategory(){
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (name: string) => {
      // update row in db
      console.log("attempting to delete category from db")
      return await Query("DELETE FROM CategoriesIncome WHERE name = ?", [name]);
    },
    // client side optimistic update
    onMutate: (name: string) => {
      queryClient.setQueryData(['categories'], (prevCategories: any) =>
        prevCategories?.filter((prevCategory: Category) => prevCategory.name !== name),
      );
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['categories'] }),
  });
}

const CategoryExpenseTable = () => {
  const [validationErrors, setValidationErrors] = useState<Record<string, string | undefined>>({});
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const columns = useMemo<MRT_ColumnDef<Category>[]>(
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
          />
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
            const isValid = validateAmount(event.target.value);
            if (!isValid) {
              setValidationErrors({
                ...validationErrors,
                colour: 'Target must be a positive number',
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
            const isValid = validateAmount(event.target.value);
            if (!isValid) {
              setValidationErrors({
                ...validationErrors,
                colour: 'Target must be a positive number',
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
  const { mutateAsync: createCategory, isPending: isCreatingCategory } = useCreateCategory();
  const {
    data: fetchedCategories = [],
    isError: isLoadingCategoriesError,
    isFetching: isFetchingCategories,
    isLoading: isLoadingCategories,
  } = useGetCategories();
  const { mutateAsync: updateCategory, isPending: isUpdatingCategory } = useUpdateCategory();
  const  { mutateAsync: deleteCategory, isPending: isDeletingCategory } = useDeleteCategory();

  // actions
  const handleCreateCategory: MRT_TableOptions<Category>['onCreatingRowSave'] = async ({
    values,
    table,
  }: {
    values: Category;
    table: any;
  }) => {
    const newValidationErrors = validateCategory(values);
    if (Object.values(newValidationErrors).some((error) => error)) {
      setValidationErrors(newValidationErrors);
      return;
    }
    setValidationErrors({});
    await createCategory(values);
    table.setCreatingRow(null);
  }

  const openDeleteConfirmModal = (row: MRT_Row<Category>) => {
    if (window.confirm('Are you sure you want to delete this Category?')) {
      deleteCategory(row.original.name);
    }
  };

  const handleSaveCategory: MRT_TableOptions<Category>['onEditingRowSave'] = async ({
    values,
    table,
  }: {
    values: Category;
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

  const table = useMaterialReactTable<Category>({
    columns,
    data: fetchedCategories,
    createDisplayMode: 'modal',
    editDisplayMode: 'row',
    enableEditing: true,
    enableBottomToolbar: false,
    enableStickyHeader: true,
    enablePagination: false,
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
    },
    onCreatingRowCancel: () => setValidationErrors({}),
    onCreatingRowSave: handleCreateCategory,
    onEditingRowCancel: () => setValidationErrors({}),
    onEditingRowSave: handleSaveCategory,
    renderCreateRowDialogContent: ({ table, row, internalEditComponents }) => (
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
      </>
    ),
    //optionally customize modal content
    renderEditRowDialogContent: ({ table, row, internalEditComponents }) => (
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
      </>
    ),
    renderRowActions: ({ row, table }) => (
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
      </Box>
    ),
    renderTopToolbarCustomActions: ({ table }) => (
      <span className="table-top-toolbar-container">
        <Button
          className="button-add-category"
          variant="contained"
          onClick={() => {
            table.setCreatingRow(true); //simplest way to open the create row modal with no default values
            //or you can pass in a row object to set default values with the `createRow` helper function
            // table.setCreatingRow(
            //   createRow(table, {
            //     //optionally pass in default values for the new row, useful for nested data or other complex scenarios
            //   }),
            // );
          }}
        >
          Add
        </Button>
        <h2>Expense</h2>
      </span>
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

export default CategoryExpenseTable;
