/* eslint-disable promise/always-return */
/* eslint-disable promise/catch-or-return */
/* eslint-disable no-nested-ternary */
/* eslint-disable camelcase */
import DeleteIcon from '@mui/icons-material/Delete';
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-material.css";
import Draggable from "react-draggable";

import { AgGridReact } from 'ag-grid-react';
import { useCallback, useMemo, useRef, useState } from "react";

import { Box, Button, IconButton, Popover, Switch, Tooltip } from "@mui/material";
import { ColDef } from "ag-grid-community";
import PopupState, { bindPopover, bindTrigger } from 'material-ui-popup-state';
import {
  CreateTransaction,
  DeleteTransaction,
  GetCategoriesByType,
  GetTransactions,
  UpdateTransaction,
} from "../../../wailsjs/go/db/Db";
import { ent } from "../../../wailsjs/go/models";
import TransactionSearch from '../TransactionSearch/TransactionSearch';

import { convertToUnixTimestamp, formatCurrency, formatDate } from '../../Utils/Formatters';
import { createPinnedCellPlaceholder, isEmptyPinnedCell, isRowDataCompleted } from '../../Utils/TableHelpers';

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
        Boolean(transaction.ignored),
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
        Number(transaction.reimbursed_by_id),
        Boolean(transaction.ignored)
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

const TransactionsTable = ({ type }: { type: string }) => {
  // hooks
  const [hideReimbursed, setHideReimbursed] = useState(type == "Income" ? true : false)
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
  
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setHideReimbursed(event.target.checked);
    gridRef.current?.api.redrawRows();
  };

  const filteredTransactions = useMemo(() => {
    let updatedTransactions = fetchedTransactions.map((transaction) => ({
      ...transaction,
      ignored: transaction.ignored === undefined ? false : transaction.ignored,
    }));

    return type === "Income"
      ? updatedTransactions.filter((transaction) => Number(transaction.amount) > 0)
      : updatedTransactions.filter((transaction) => Number(transaction.amount) < 0);
  }, [type, fetchedTransactions]);

  const nonReimbursedTransactions = useMemo(() => {
    return filteredTransactions.filter((transaction) =>
      transaction.edges.reimbursed_by_transaction == null
    )
  }, [filteredTransactions]);

  const categoryIds = useMemo(() => (
    fetchedCategories.map((category) => (category.id)).concat(-1)
  ), [fetchedCategories]);

  let inputRow = new ent.Transaction
  inputRow.ignored = false

  const colDefs = useMemo<ColDef<ent.Transaction>[]>(() => (
    [
      {
        headerComponent: () => {
          return <Box sx={{ display: "flex", gap: "1rem" }}>
            {type === "Income" && (
              <div className='transactions-search-toolbar-text'>
                Hide reimbursed <Switch defaultChecked onChange={handleChange} />
              </ div>
              
            )}
          </Box>
        },
        cellRenderer: (props: any) => {
          if (props.node.rowPinned == 'top') return
          return <Box sx={{ display: "flex", gap: "1rem" }}>
            <Tooltip title="Delete">
              <IconButton
                color="error"
                onClick={() => {
                  deleteTransaction(props.data.id);
                  props.api.applyTransaction({
                    remove: [props.node.data]
                  });
                }}
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
                      {...bindTrigger(popupState)}
                      onClick={() => {
                        props.node.setSelected(true)
                        popupState.open();
                      }}
                    >
                      Reimburse
                    </Button>
                    <Draggable>
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
                        onClose={() => {
                          props.node.setSelected(false)
                        }}
                      >
                        <div className='reimburse-popover'>
                          <TransactionSearch
                            type="Income"
                            onSelect={(transaction) => {
                              if (transaction) {
                                props.data.reimbursed_by_id = transaction.id;
                              } else {
                                props.data.reimbursed_by_id = null;
                              }
                              updateTransaction(props.data);
                              filteredTransactions.forEach(
                                (transactionItr, idx) => {
                                  if (transactionItr.reimbursed_by_id === transaction.id && transactionItr.id !== props.data.id) {
                                    filteredTransactions[idx].reimbursed_by_id = undefined;
                                  }
                                }
                              );
                              popupState.close();
                              props.api.redrawRows();
                            }}
                          />
                        </div>
                      </Popover>
                    </Draggable>
                  </ div>
                )}
              </PopupState>
            )}
          </Box >
        },
        suppressHeaderFilterButton: true,
        suppressAutoSize: true,
        editable: false,
        minWidth: 200,
        maxWidth: 200,
      },
      {
        field: "ignored",
        headerName: "Ignored",
        cellDataType: 'boolean',
        editable: (params: any) => !isEmptyPinnedCell(params), 
        suppressHeaderFilterButton: true,
        //valueFormatter: params => params.value == null ? false : params.value,
        suppressAutoSize: true,
        minWidth: 100,
        maxWidth: 100,
      },
      {
        field: "time",
        headerName: "Date",
        sort: "desc",
        cellEditor: "agDateCellEditor",
        cellRenderer: (params: any) =>
          isEmptyPinnedCell(params)
            ? createPinnedCellPlaceholder(params)
            : formatDate(params.value),
        valueFormatter: params => formatDate(params.value),
        valueParser: params => convertToUnixTimestamp("dd/mm/yyyy", params.newValue)
      },
      {
        field: "description",
        cellRenderer: (params: any) =>
          isEmptyPinnedCell(params)
            ? createPinnedCellPlaceholder(params)
            : params.value,
      },
      {
        field: "amount",
        cellRenderer: (params: any) =>
          isEmptyPinnedCell(params)
            ? createPinnedCellPlaceholder(params)
            : useMemo(() => {
          const reimbursedTransaction = fetchedTransactions.find(
            (transaction) => transaction.id === params.data.reimbursed_by_id
          );
              if (reimbursedTransaction) {
                if (type === "Expense") {
                  const totalAmount = params.value + Number(reimbursedTransaction.amount);
                  return (
                    <>
                      {formatCurrency(totalAmount)}{' '}
                      <span style={{ color: 'green' }}>
                        ({formatCurrency(Number(reimbursedTransaction.amount)) + " - " + reimbursedTransaction.description})
                      </span>
                    </>
                  );
                } else {
                  return (
                    <>
                      {formatCurrency(params.value)}{' '}
                      <span style={{ color: 'red' }}>
                        (reimburses - {reimbursedTransaction.description})
                      </span>
                    </>
                  );
                }
          } else {
            return formatCurrency(params.value);
          }
        }, [fetchedTransactions]),
      },
      {
        field: "category_id",
        headerName: "Category",
        cellStyle: { 'textAlign': "left" },
        cellEditor: 'agSelectCellEditor',
        cellEditorParams: {
          values: categoryIds,
          useFormatter: true
        },
        cellRenderer: (params: any) =>
          isEmptyPinnedCell(params)
            ? 'Category...'
            : fetchedCategories.find(cat => cat.id === params.value)?.name || '❗ Uncategorized',
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

  const onCellValueChanged = useCallback((event: any) => {
    if (event.rowPinned == 'top') return;
    updateTransaction(event.data as ent.Transaction);
  }, []);

  const onCellEditingStopped = (params: any) => {
    if (params.rowPinned == 'top' && isRowDataCompleted(colDefs, inputRow)) {
      // add to fetchedCategories
      createTransaction(params.data)
      //reset pinned row
      inputRow = new ent.Transaction
      inputRow.ignored = false
    }
  }

  return (
    <div className="ag-theme-material-dark">
      <AgGridReact
        suppressScrollOnNewData={true}
        pinnedTopRowData={[inputRow]}
        onCellEditingStopped={onCellEditingStopped}
        ref={gridRef}
        rowData={hideReimbursed ? nonReimbursedTransactions : filteredTransactions}
        columnDefs={colDefs}
        defaultColDef={defaultColDef}
        onGridReady={onGridReady}
        onGridSizeChanged={onGridSizeChanged}
        //onColumnResized={onGridSizeChanged}
        onCellValueChanged={onCellValueChanged}
      />
    </div >
  )
};

export default TransactionsTable;
