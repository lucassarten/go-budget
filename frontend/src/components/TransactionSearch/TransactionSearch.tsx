/* eslint-disable promise/always-return */
/* eslint-disable promise/catch-or-return */
/* eslint-disable no-nested-ternary */
/* eslint-disable camelcase */
import { Box, Button, Switch } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { useCallback, useMemo, useRef, useState } from "react";

import { ColDef, colorSchemeDark, themeMaterial } from "ag-grid-community";

import { AgGridReact } from "ag-grid-react";
import { GetCategoriesByType, GetTransactions } from "../../../wailsjs/go/db/Db";
import { ent } from "../../../wailsjs/go/models";
import { formatCurrency, formatDate } from "../../Utils/Formatters";

const themeMaterialdark = themeMaterial.withPart(colorSchemeDark)
  .withParams({
    backgroundColor: window.getComputedStyle(document.body).getPropertyValue('--background-colour'),
    accentColor: window.getComputedStyle(document.body).getPropertyValue('--accent-colour'),
  });

function useGetTransactions(type: string) {
  return useQuery<ent.Transaction[]>({
    queryKey: ["reimbursements"],
    queryFn: async () => {
      return await GetTransactions();
    },
    refetchOnWindowFocus: false,
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

const TransactionSearch = ({
  type,
  onSelect,
}: {
  type: string;
  onSelect: (transaction: ent.Transaction) => void;
}) => {
  const [reimbursedOnly, setReimbursedOnly] = useState(true)
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

  const filteredTransactions = useMemo(() => {
    return type === "Income"
      ? fetchedTransactions.filter((transaction) => Number(transaction.amount) > 0)
      : fetchedTransactions.filter((transaction) => Number(transaction.amount) < 0);
  }, [type, fetchedTransactions]);

  const nonReimbursedTransactions = useMemo(() => {
    return filteredTransactions.filter((transaction) =>
      transaction.edges.reimbursed_by_transaction == null
    )
  }, [filteredTransactions]);

  const categoryIds = useMemo(() => (
    fetchedCategories.map((category) => (category.id))
  ), [fetchedCategories]);

  const colDefs = useMemo<ColDef<ent.Transaction>[]>(() => (
    [
      {
        headerClass: 'col-header',
        cellRenderer: (props: any) => {
          return <Box sx={{ display: "flex", gap: "1rem" }}>
            <Button onClick={() => onSelect(props.data)}>Select</Button>
          </Box>
        },
        suppressHeaderFilterButton: true,
        suppressAutoSize: true,
        editable: false,
        minWidth: 100,
        maxWidth: 100,
      },
      {
        field: "time",
        headerName: "Date",
        sort: "desc",
        cellEditor: "agDateCellEditor",
        valueFormatter: params => formatDate(params.value),
      },
      {
        headerClass: 'col-header',
        field: "description",
      },
      {
        headerClass: 'col-header',
        field: "amount",
        valueFormatter: params => formatCurrency(params.value),
      },
      {
        headerClass: 'col-header',
        field: "category_id",
        headerName: "Category",
        cellStyle: { 'textAlign': "left" },
        cellEditor: 'agSelectCellEditor',
        cellEditorParams: {
          values: categoryIds,
          useFormatter: true
        },
        valueFormatter: params => fetchedCategories.find(cat => cat.id === params.value)?.name || '❗ Uncategorized',
        valueParser: params => fetchedCategories.find(cat => cat.name === params.newValue)?.id
      }
    ]), [categoryIds]);

  const defaultColDef = useMemo(() => ({
    filter: true,
    editable: true
  }), []);

  const gridRef = useRef<AgGridReact>(null);

  const onGridReady = useCallback((event: any) => {
    event.api.sizeColumnsToFit();
  }, []);

  const onGridSizeChanged = useCallback((event: any) => {
    event.api.sizeColumnsToFit();
  }, []);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setReimbursedOnly(event.target.checked);
    gridRef.current?.api.redrawRows();
  };

  return (
    <>
      <Box className="transactions-search-toolbar" alignItems="center">
        <Button className="transactions-search-toolbar-button" onClick={() => onSelect(new ent.Transaction())}>None</Button>
        <div className='transactions-search-toolbar-text'>Show only non-reimbursed</ div>
        <Switch defaultChecked onChange={handleChange} />
      </Box>
      <div className="ag-theme-material-dark" style={{ height: 'calc(100% - 30px)' }}>
        <AgGridReact
          theme={themeMaterialdark}
          suppressScrollOnNewData={true}
          ref={gridRef}
          rowData={reimbursedOnly ? nonReimbursedTransactions : filteredTransactions}
          columnDefs={colDefs}
          defaultColDef={defaultColDef}
          onGridReady={onGridReady}
          onGridSizeChanged={onGridSizeChanged}
        //onColumnResized={onGridSizeChanged}
        //onCellValueChanged={onCellValueChanged}
        />
      </div >
    </>);
};

export default TransactionSearch;
