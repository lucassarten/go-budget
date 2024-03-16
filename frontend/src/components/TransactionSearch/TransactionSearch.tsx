/* eslint-disable promise/always-return */
/* eslint-disable promise/catch-or-return */
/* eslint-disable no-nested-ternary */
/* eslint-disable camelcase */
import { Box, Button } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import {
  MaterialReactTable,
  useMaterialReactTable,
  type MRT_ColumnDef,
  type MRT_TableOptions,
} from "material-react-table";
import { useCallback, useMemo, useState } from "react";

import { QueryTransactions } from "../../../wailsjs/go/db/Db";
import { db } from "../../../wailsjs/go/models";

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

function useGetTransactions(type: string) {
  return useQuery<db.Transaction[]>({
    queryKey: ["reimbursements"],
    queryFn: async () => {
      console.log("attempting to get reimbursement transactions from db");
      return await QueryTransactions(
        `SELECT * FROM Transactions WHERE ${type === "Income" ? "amount > 0" : "amount < 0"
        }`,
        []
      );
    },
    refetchOnWindowFocus: false,
  });
}

const TransactionSearch = ({
  type,
  onSelect,
}: {
  type: string;
  onSelect: (transaction: db.Transaction) => void;
}) => {
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 20,
  });
  // hooks
  const {
    data: fetchedTransactions = [],
    isError: isLoadingTransactionsError,
    isFetching: isFetchingTransactions,
    isLoading: isLoadingTransactions,
  } = useGetTransactions(type);

  const filteredTransactions = useMemo(() => {
    return type === "Income"
      ? fetchedTransactions.filter((transaction) => transaction.amount > 0)
      : fetchedTransactions.filter((transaction) => transaction.amount < 0);
  }, [type, fetchedTransactions]);

  const columns = useMemo<MRT_ColumnDef<db.Transaction>[]>(
    () => [
      {
        accessorKey: "id",
        header: "ID",
        enableColumnOrdering: false,
        enableEditing: false,
        enableSorting: false,
        size: 50,
        hide: true, // no clue why this doesn't work so will have to do below
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
        dateSetting: { locale: "en-NZ" },
        format: "dd/MM/yyyy",
        size: 100,
        // display as DD/MM/YYYY
        Cell: ({ cell }) => formatDate(cell.getValue() as string),
      },
      {
        accessorKey: "description",
        header: "Description",
        size: 250,
      },
      {
        accessorKey: "amount",
        header: "Amount",
        size: 50,
        // format as currency
        Cell: ({ cell }) => formatCurrency(cell.getValue() as number),
      },
      {
        accessorKey: "category",
        header: "Category",
        size: 50,
      },
    ],
    []
  );

  const table = useMaterialReactTable<db.Transaction>({
    columns,
    data: filteredTransactions,
    createDisplayMode: "row",
    enableEditing: true,
    enableBottomToolbar: true,
    enableStickyFooter: true,
    enableTopToolbar: true,
    enableStickyHeader: true,
    enablePagination: true,
    onPaginationChange: setPagination,
    memoMode: "cells",
    // getRowId: (row) => row.id,
    muiTableContainerProps: {
      sx: {
        minHeight: "calc(100vh - 167px)",
      },
      style: {
        maxHeight: "calc(100vh - 167px)",
      },
    },
    renderRowActions: useCallback<
      Required<MRT_TableOptions<db.Transaction>>["renderRowActions"]
    >(
      ({ row, table }) => (
        <Box sx={{ display: "flex", gap: "1rem" }}>
          <Button onClick={() => onSelect(row.original)}>Select</Button>
        </Box>
      ),
      []
    ),
    renderTopToolbarCustomActions: useCallback<
      Required<
        MRT_TableOptions<db.Transaction>
      >["renderTopToolbarCustomActions"]
    >(
      ({ table }) => (
        <div className="table-top-toolbar-container">
          <Button onClick={() => onSelect(new db.Transaction())}>None</Button>
        </div>
      ),
      []
    ),
    state: {
      isLoading: isLoadingTransactions,
      showAlertBanner: isLoadingTransactionsError,
      showProgressBars: isFetchingTransactions,
      pagination,
    },
  });

  return (
    <div className="reimbursementPopover">
      <MaterialReactTable table={table} />
    </div>
  );
};

export default TransactionSearch;
