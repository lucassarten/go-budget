/* eslint-disable promise/always-return */
/* eslint-disable promise/catch-or-return */
/* eslint-disable no-nested-ternary */
/* eslint-disable camelcase */
import DeleteIcon from '@mui/icons-material/Delete';
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getUnixTime, parse } from 'date-fns';
import debounce from "lodash.debounce";
import Draggable from "react-draggable";
// import {
//   MRT_EditActionButtons,
//   MaterialReactTable,
//   createRow,
//   useMaterialReactTable,
//   type MRT_ColumnDef,
//   type MRT_Row,
//   type MRT_TableOptions,
// } from "material-react-table";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-material.css";

import { AgGridReact } from 'ag-grid-react';
import { useCallback, useMemo, useReducer, useRef, useState } from "react";

import { Box, Button, IconButton, Popover, Tooltip } from "@mui/material";
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

// validation functions

const unixToDate = (timestamp: number) => new Date(timestamp * 1000);
const dateToUnix = (date: { getTime: () => number; }) => Math.floor(date.getTime() / 1000);

const formatCurrency = (value: number) => {
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "NZD",
    currencyDisplay: "symbol",
  });
  return formatter.format(value);
};

const formatDate = (value: number) => {
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
        const time = convertToUnixTimestamp("yyyy-MM-dd", event.target.value)
        const isValid = validateDate(time);

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

  const categoryIds = useMemo(() => (
    fetchedCategories.map((category) => (category.id))
  ), [fetchedCategories]);

  let inputRow = {}

  const colDefs = useMemo<ColDef<ent.Transaction>[]>(() => (
    [
      {
        cellRenderer: (props: any) => {
          if (props.node.rowPinned == 'top') return
          return <Box sx={{ display: "flex", gap: "1rem" }}>
            <Tooltip title="Delete">
              <IconButton
                color="error"
                onClick={() => {
                  DeleteTransaction(props.data.id);
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
                              // const reimbursedByTransaction =
                              //   fetchedTransactions.find(
                              //     (transaction) =>
                              //       transaction.id === props.data.reimbursed_by_id
                              //   );
                              // if (reimbursedByTransaction) {
                              //   reimbursedByTransaction.category_id = "🔁 Reimbursement";
                              //   updateTransaction(reimbursedByTransaction);
                              // }
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
            : fetchedCategories.find(cat => cat.id === params.value)?.name || 'unknown',
        valueFormatter: params => fetchedCategories.find(cat => cat.id === params.value)?.name || 'unknown',
        valueParser: params => fetchedCategories.find(cat => cat.name === params.newValue)?.id
      }
    ]), [categoryIds]);
  
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
    if (isPinnedRowDataCompleted(params)) {
      // add to fetchedCategories
      createTransaction(params.data)
      //reset pinned row
      inputRow = {}
    }
  }

  const getRowStyle = (params: any) => {
    if (params.data.selected === true) {
      return {
        'background-color': '#455A64',
        'color': '#9AA3A8'
      }
    }
  };

  return (
    <div className="ag-theme-material-dark">
      <AgGridReact
        pinnedTopRowData={[inputRow]}
        onCellEditingStopped={onCellEditingStopped}
        getRowStyle={getRowStyle}
        ref={gridRef}
        rowData={filteredTransactions}
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
