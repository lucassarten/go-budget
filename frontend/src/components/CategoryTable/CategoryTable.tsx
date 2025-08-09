/* eslint-disable promise/always-return */
/* eslint-disable promise/catch-or-return */
/* eslint-disable no-nested-ternary */
/* eslint-disable camelcase */
import DeleteIcon from '@mui/icons-material/Delete';
import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import { ColDef, colorSchemeDark, themeMaterial } from "ag-grid-community";
import { AgGridReact } from 'ag-grid-react';

import { useCallback, useMemo, useRef } from 'react';
import { CreateCategory, DeleteCategory, GetCategoriesByType, GetCategoryByID, UpdateCategory } from "../../../wailsjs/go/db/Db.js";
import { ent } from "../../../wailsjs/go/models.js";

import { IconButton, Tooltip } from '@mui/material';
import { formatCurrency } from '../../Utils/Formatters';
import { createPinnedCellPlaceholder, isEmptyPinnedCell, isRowDataCompleted } from '../../Utils/TableHelpers';
import './CategoryTable.css';

const themeMaterialdark = themeMaterial.withPart(colorSchemeDark)
  .withParams({
    backgroundColor: window.getComputedStyle(document.body).getPropertyValue('--background-colour'),
    accentColor: window.getComputedStyle(document.body).getPropertyValue('--accent-colour'),
  });

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

const CategoryTable = ({ type }: { type: string }) => {
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

  let inputRow = new ent.Transaction

  const colDefs = useMemo<ColDef<ent.Category>[]>(() => (
    [
      {
        headerClass: 'col-header',
        cellRenderer: (props: any) => {
          if (props.node.rowPinned == 'top') return
          return <Tooltip title="Delete">
              <IconButton
                color="error"
                onClick={() => {
                  deleteCategory(props.data.id);
                  props.api.applyTransaction({
                    remove: [props.node.data]
                  });
                }}
              >
                <DeleteIcon />
              </IconButton>
            </Tooltip>
        },
        suppressHeaderFilterButton: true,
        suppressAutoSize: true,
        editable: false,
        minWidth: 50,
        maxWidth: 50,
      },
      {
        headerClass: 'col-header',
        field: "name",
        headerName: "Name",
        cellStyle: { 'textAlign': "left" },
        sort: "desc",
        cellRenderer: (params: any) =>
          isEmptyPinnedCell(params)
            ? createPinnedCellPlaceholder(params)
            : params.value,
      }, 
      {
        headerClass: 'col-header',
        field: "weekly",
        headerName: "Weekly Budget",
        cellRenderer: (params: any) =>
          isEmptyPinnedCell(params)
            ? createPinnedCellPlaceholder(params)
            : formatCurrency(params.value)
      },
      {
        headerClass: 'col-header',
        field: "monthly",
        headerName: "Monthly Budget",
        cellRenderer: (params: any) =>
          isEmptyPinnedCell(params)
            ? createPinnedCellPlaceholder(params)
            : formatCurrency(params.value)
      },
      {
        headerClass: 'col-header',
        field: "colour",
        headerName: "Colour",
        cellRenderer: (params: any) =>
          isEmptyPinnedCell(params)
            ? createPinnedCellPlaceholder(params)
            : <div
            style={{
              backgroundColor: String(params.value),
              width: '100%',
              height: '100%'
            }}
          >
            {params.value as React.ReactNode}
          </div>
      }
    ]), []);

  const defaultColDef = useMemo(() => ({
    filter: true,
    editable: true,
  }), []);

  const gridRef = useRef<AgGridReact>(null);

  const onGridReady = useCallback((event: any) => {
    event.api.sizeColumnsToFit();
  }, []);

  const onGridSizeChanged = useCallback((event: any) => {
    event.api.sizeColumnsToFit();
  }, []);

  const onCellValueChanged = useCallback((event: any) => {
    if (event.rowPinned == 'top') return;
    updateCategory(event.data as ent.Transaction);
  }, []);

  const onCellEditingStopped = (params: any) => {
    if (params.rowPinned == 'top' && isRowDataCompleted(colDefs, inputRow)) {
      // add to fetchedCategories
      createCategory(params.data)
      //reset pinned row
      inputRow = new ent.Transaction
    } 
  }

  return (
    <div className="ag-theme-material-dark">
      <AgGridReact
        theme={themeMaterialdark}
        suppressScrollOnNewData={true}
        pinnedTopRowData={[inputRow]}
        onCellEditingStopped={onCellEditingStopped}
        ref={gridRef}
        rowData={fetchedCategories}
        columnDefs={colDefs}
        defaultColDef={defaultColDef}
        onGridReady={onGridReady}
        onGridSizeChanged={onGridSizeChanged}
        //onColumnResized={onGridSizeChanged}
        onCellValueChanged={onCellValueChanged}
      />
    </div >
  )
}

export default CategoryTable;
