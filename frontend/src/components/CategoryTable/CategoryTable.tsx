/* eslint-disable promise/always-return */
/* eslint-disable promise/catch-or-return */
/* eslint-disable no-nested-ternary */
/* eslint-disable camelcase */
import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-material.css";
import debounce from 'lodash.debounce';

import { ColDef } from "ag-grid-community";
import { AgGridReact } from 'ag-grid-react';

import { useCallback, useMemo, useReducer, useRef } from 'react';
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

  let inputRow = {}

  const colDefs = useMemo<ColDef<ent.Category>[]>(() => (
    [
      {
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
        field: "weekly",
        headerName: "Weekly Budget",
        cellRenderer: (params: any) =>
          isEmptyPinnedCell(params)
            ? createPinnedCellPlaceholder(params)
            : formatCurrency(params.value)
      },
      {
        field: "monthly",
        headerName: "Monthly Budget",
        cellRenderer: (params: any) =>
          isEmptyPinnedCell(params)
            ? createPinnedCellPlaceholder(params)
            : formatCurrency(params.value)
      },
      {
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
  
  function isEmptyPinnedCell(params: any) {
    return (
      (params.node.rowPinned === 'top' && params.value == null) ||
      (params.node.rowPinned === 'top' && params.value == '')
    );
  }

  function createPinnedCellPlaceholder(params: any) {
    return params.colDef.field[0].toUpperCase() + params.colDef.field.slice(1) + '...';
  }

  function isPinnedRowDataCompleted(params: any) {
    if (params.rowPinned !== 'top') return;
    if (!inputRow) return;
    return colDefs.every((def) => {
      if (!def.field) return true
      return inputRow[def.field]
    });
  } 

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
    if (isPinnedRowDataCompleted(params)) {
      // add to fetchedCategories
      createCategory(params.data)
      //reset pinned row
      inputRow = {}
    } 
  }

  return (
    <div className="ag-theme-material-dark">
      <AgGridReact
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
