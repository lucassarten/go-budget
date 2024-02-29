// /* eslint-disable promise/always-return */
// /* eslint-disable promise/catch-or-return */
// /* eslint-disable no-nested-ternary */
// /* eslint-disable camelcase */
// import { useCallback, useEffect, useMemo, useState } from 'react';
// import MaterialReactTable, {
//   MRT_Cell,
//   MRT_ColumnDef,
//   MRT_RowSelectionState,
// } from 'material-react-table';
// import {
//   Button,
//   Dialog,
//   DialogActions,
//   DialogContent,
//   DialogTitle,
//   MenuItem,
//   Stack,
//   TextField,
// } from '@mui/material';

// import { buttonStyleAdd, buttonStyleCancel } from '../../styles/MUI';

// import { Category, Transaction } from '../Types';
// import { Query } from "../../../wailsjs/go/main/Db";

// const formatCurrency = (value: number) => {
//   const formatter = new Intl.NumberFormat('en-US', {
//     style: 'currency',
//     currency: 'NZD',
//     currencyDisplay: 'symbol',
//   });
//   return formatter.format(value);
// };
// const formatDate = (value: string) => {
//   const date = new Date(value);
//   return date.toLocaleDateString('en-NZ', {
//     year: 'numeric',
//     month: 'numeric',
//     day: 'numeric',
//   });
// };
// const validateRequired = (value: string) => !!value.length;
// const validateDate = (value: string) => {
//   const date = new Date(value);
//   return !Number.isNaN(date.getTime());
// };
// const validateAmount = (value: string) => {
//   const number = Number(value);
//   return !Number.isNaN(number);
// };
// const validateCategory = (value: string, categories: Category[]) => {
//   const category = categories.find((c) => c.name === value);
//   return !!category;
// };

// interface CreateModalProps {
//   columns: MRT_ColumnDef<Transaction>[];
//   onClose: () => void;
//   // eslint-disable-next-line no-unused-vars
//   onSubmit: (values: Transaction) => void;
//   open: boolean;
//   categories: Category[];
//   type: string;
// }

// export function AddTransactionModal({
//   open,
//   columns,
//   onClose,
//   onSubmit,
//   categories,
//   type,
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
//       <DialogTitle textAlign="center">Add {type}</DialogTitle>
//       <DialogContent>
//         <form
//           onSubmit={(e) => e.preventDefault()}
//           className="add-transaction-form"
//         >
//           <Stack
//             sx={{
//               width: '100%',
//               minWidth: { xs: '300px', sm: '360px', md: '400px' },
//               gap: '1.5rem',
//             }}
//           >
//             {
//               // date picker
//               columns.slice(1, 2).map((column) => (
//                 // date picker
//                 <TextField
//                   key={column.accessorKey}
//                   label={column.header}
//                   name={column.accessorKey}
//                   onChange={(e) =>
//                     setValues({ ...values, [e.target.name]: e.target.value })
//                   }
//                   type="date"
//                   required
//                   error={!validateDate(values.date)}
//                   InputLabelProps={{
//                     shrink: true,
//                   }}
//                 />
//               ))
//             }
//             {columns.slice(2, 3).map((column) => (
//               <TextField
//                 key={column.accessorKey}
//                 label={column.header}
//                 name={column.accessorKey}
//                 onChange={(e) =>
//                   setValues({ ...values, [e.target.name]: e.target.value })
//                 }
//                 required
//                 error={!validateRequired(values.description)}
//               />
//             ))}
//             {columns.slice(3, 4).map((column) => (
//               <TextField
//                 key={column.accessorKey}
//                 label={column.header}
//                 name={column.accessorKey}
//                 onChange={(e) =>
//                   setValues({ ...values, [e.target.name]: e.target.value })
//                 }
//                 required
//                 error={
//                   !validateAmount(values.amount) ||
//                   !validateRequired(values.amount)
//                 }
//                 helperText={
//                   !validateAmount(values.amount)
//                     ? `${column.accessorKey} must be a number`
//                     : ''
//                 }
//               />
//             ))}
//             {columns.slice(4).map((column) => (
//               <TextField
//                 key={column.accessorKey}
//                 label={column.header}
//                 name={column.accessorKey}
//                 onChange={(e) =>
//                   setValues({ ...values, [e.target.name]: e.target.value })
//                 }
//                 select
//                 defaultValue="❓ Other"
//               >
//                 {categories.map((category) => (
//                   <MenuItem key={category.name} value={category.name}>
//                     {category.name}
//                   </MenuItem>
//                 ))}
//               </TextField>
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
//             !validateAmount(values.amount) ||
//             !validateRequired(values.amount) ||
//             !validateRequired(values.description)
//               ? buttonStyleAdd.disabled
//               : buttonStyleAdd
//           }
//           // inactive if there are validation errors
//           disabled={
//             !validateAmount(values.amount) ||
//             !validateRequired(values.amount) ||
//             !validateRequired(values.description)
//           }
//         >
//           Add
//         </Button>
//       </DialogActions>
//     </Dialog>
//   );
// }

// function TransactionsTable({ type }: any) {
//   const [createModalOpen, setCreateModalOpen] = useState(false);
//   const [tableData, setTableData] = useState<Transaction[]>([]);
//   const [validationErrors, setValidationErrors] = useState<{
//     [cellId: string]: string;
//   }>({});
//   const [categories, setCategories] = useState<Category[]>([]);
//   const [rowSelection, setRowSelection] = useState<MRT_RowSelectionState>({});
//   const [pagination, setPagination] = useState({
//     pageIndex: 0,
//     pageSize: 20,
//   });
//   useEffect(() => {
//     // get positive transactions from db
//     dbQuery(
//       `SELECT * FROM Transactions WHERE ${
//         type === 'Income' ? 'amount > 0' : 'amount < 0'
//       }`
//     ).then((resp) => {
//       setTableData(resp as Transaction[]);
//     });
//     // get categories from db
//     dbQuery(`SELECT * FROM Categories${type}`).then((resp) => {
//       setCategories(resp as Category[]);
//     });
//   }, [type]);

//   const handleCreateNewRow = (values: Transaction) => {
//     // if type is expense, make amount negative
//     if (type === 'Expense') {
//       values.amount = -values.amount;
//     } else {
//       values.amount = Math.abs(values.amount);
//     }
//     tableData.push(values);
//     // insert row into db
//     dbQuery(
//       `INSERT INTO Transactions (date, description, amount, category) VALUES ('${values.date}', '${values.description}', ${values.amount}, '${values.category}')`
//     );
//     setTableData([...tableData]);
//   };

//   const handleSaveCell = useCallback(
//     (cell: MRT_Cell<Transaction>, value: any) => {
//       // there is probably a better way to do this
//       switch (cell.column.id) {
//         case 'date':
//           tableData[cell.row.index].date = value;
//           break;
//         case 'description':
//           tableData[cell.row.index].description = value;
//           break;
//         case 'amount':
//           tableData[cell.row.index].amount = value;
//           break;
//         case 'category':
//           tableData[cell.row.index].category = value;
//           break;
//         default:
//           break;
//       }
//       // update row in db
//       dbQuery(
//         `UPDATE Transactions SET date = '${
//           tableData[cell.row.index].date
//         }', description = '${
//           tableData[cell.row.index].description
//         }', amount = ${tableData[cell.row.index].amount}, category = '${
//           tableData[cell.row.index].category
//         }' WHERE id = ${tableData[cell.row.index].id}`
//       );
//       setTableData([...tableData]);
//     },
//     [tableData]
//   );

//   const handleDeleteRows = useCallback(() => {
//     // loop through selected rows and delete them from tableData
//     const newTableData = tableData.filter((row) => !rowSelection[row.id]);
//     // delete rows from db
//     const query = `DELETE FROM Transactions WHERE id IN (${
//       Object.keys(rowSelection) as string[]
//     })`;
//     dbQuery(query);
//     setTableData(newTableData);
//     setRowSelection({});
//   }, [rowSelection, tableData]);

//   const getCommonEditTextFieldProps = useCallback(
//     (
//       cell: MRT_Cell<Transaction>
//     ): MRT_ColumnDef<Transaction>['muiTableBodyCellEditTextFieldProps'] => {
//       return {
//         error: !!validationErrors[cell.id],
//         helperText: validationErrors[cell.id],
//         onFocus: () => {
//           delete validationErrors[cell.id];
//           setValidationErrors({
//             ...validationErrors,
//           });
//         },
//         onChange: (event) => {
//           const isValid =
//             cell.column.id === 'date'
//               ? validateDate(event.target.value)
//               : cell.column.id === 'amount'
//               ? validateAmount(event.target.value)
//               : cell.column.id === 'category'
//               ? validateCategory(event.target.value, categories)
//               : validateRequired(event.target.value);
//           if (!isValid) {
//             // set validation error for cell if invalid
//             setValidationErrors({
//               ...validationErrors,
//               [cell.id]: `${cell.column.columnDef.header} is invalid`,
//             });
//           } else {
//             // remove validation error for cell if valid
//             delete validationErrors[cell.id];
//             setValidationErrors({
//               ...validationErrors,
//             });
//           }
//         },
//         onBlur: (event) => {
//           const isValid =
//             cell.column.id === 'date'
//               ? validateDate(event.target.value)
//               : cell.column.id === 'amount'
//               ? validateAmount(event.target.value)
//               : cell.column.id === 'category'
//               ? validateCategory(event.target.value, categories)
//               : validateRequired(event.target.value);
//           if (isValid) {
//             handleSaveCell(cell, event.target.value);
//           }
//         },
//       };
//     },
//     [categories, handleSaveCell, validationErrors]
//   );

//   const categoriesMap = categories.map((category) => (
//     <MenuItem key={category.name} value={category.name}>
//       {category.name}
//     </MenuItem>
//   ));

//   const columns = useMemo<MRT_ColumnDef<Transaction>[]>(
//     () => [
//       {
//         accessorKey: 'id',
//         header: 'ID',
//         enableColumnOrdering: false,
//         enableEditing: false,
//         enableSorting: false,
//         size: 50,
//         hide: true, // no clue why this doesn't work so will have to do below
//         // hide header
//         muiTableHeadCellProps: {
//           style: {
//             display: 'none',
//           },
//         },
//         // hide cell
//         muiTableBodyCellProps: {
//           style: {
//             display: 'none',
//           },
//         },
//       },
//       {
//         accessorKey: 'date',
//         header: 'Date',
//         size: 100,
//         // date picker
//         muiTableBodyCellEditTextFieldProps: ({ cell }) => ({
//           ...getCommonEditTextFieldProps(cell),
//           type: 'date',
//           format: 'dd/MM/yyyy',
//         }),
//         // display as dd/MM/yyyy
//         Cell: ({ cell }) => formatDate(cell.getValue() as string),
//       },
//       {
//         accessorKey: 'description',
//         header: 'Description',
//         size: 250,
//         muiTableBodyCellEditTextFieldProps: ({ cell }) => ({
//           ...getCommonEditTextFieldProps(cell),
//         }),
//       },
//       {
//         accessorKey: 'amount',
//         header: 'Amount',
//         size: 50,
//         muiTableBodyCellEditTextFieldProps: ({ cell }) => ({
//           ...getCommonEditTextFieldProps(cell),
//         }),
//         // format as currency
//         Cell: ({ cell }) => formatCurrency(cell.getValue() as number),
//       },
//       {
//         accessorKey: 'category',
//         header: 'Category',
//         size: 50,
//         muiTableBodyCellEditTextFieldProps: ({ cell }) => ({
//           select: true,
//           children: categoriesMap,
//           ...getCommonEditTextFieldProps(cell),
//         }),
//       },
//     ],
//     [categoriesMap, getCommonEditTextFieldProps]
//   );

//   return (
//     <div className={`transactions-table-${type}`}>
//       <MaterialReactTable
//         muiTableContainerProps={
//           {
//             style: {
//               maxHeight: 'calc(100vh - 167px)',
//             },
//           } as any
//         }
//         enableBottomToolbar
//         enableTopToolbar
//         enableStickyFooter
//         enableStickyHeader
//         enablePagination
//         onPaginationChange={setPagination}
//         columns={columns}
//         data={tableData}
//         enableColumnOrdering
//         editingMode="cell"
//         enableEditing
//         enableRowSelection
//         onRowSelectionChange={setRowSelection}
//         state={{ rowSelection, pagination }}
//         getRowId={(row) => row.id}
//         renderTopToolbarCustomActions={() => (
//           <span className="table-top-toolbar-container">
//             <button
//               className="button-add-transaction"
//               type="button"
//               onClick={() => setCreateModalOpen(true)}
//             >
//               Add
//             </button>
//             <button
//               className="button-delete-transaction"
//               type="button"
//               disabled={Object.keys(rowSelection).length === 0}
//               onClick={() => handleDeleteRows()}
//             >
//               Delete
//             </button>
//           </span>
//         )}
//       />
//       <AddTransactionModal
//         columns={columns}
//         open={createModalOpen}
//         onClose={() => setCreateModalOpen(false)}
//         onSubmit={handleCreateNewRow}
//         categories={categories}
//         type={type}
//       />
//     </div>
//   );
// }

// export default TransactionsTable;

export {}