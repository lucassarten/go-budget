/* eslint-disable react/destructuring-assignment */
// the statitics view presents the raw statistics of the budget in tables
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { useEffect, useState } from 'react';

import { QueryCategories, QueryTransactions } from "../../../wailsjs/go/db/Db";
import { db } from "../../../wailsjs/go/models";
import { formatCurrency, formatDate } from '../../Utils/Formatters';
import { GetDefaultPeriod, TimePeriod } from '../Dashboard/Dashboard';
import TimePeriodSelector from '../Selectors/TimePeriodSelector';

function getLastPeriod(periodStart: Date, periodEnd: Date, periodType: string): TimePeriod {
  switch (periodType) {
    case 'lastWeek':
      periodStart.setDate(periodStart.getDate() - 7);
      periodEnd.setDate(periodEnd.getDate() - 7);
      break;
    case 'lastMonth':
      periodStart.setMonth(periodStart.getMonth() - 1);
      periodStart.setDate(1);
      periodEnd.setDate(0);
      break;
    case 'lastThreeMonths':
      periodStart.setMonth(periodStart.getMonth() - 3);
      periodStart.setDate(1);
      periodEnd = new Date(periodStart);
      periodEnd.setMonth(periodEnd.getMonth() + 3);
      periodEnd.setDate(periodEnd.getDate() - 1);

      break;
    case 'lastSixMonths':
      periodStart.setMonth(periodStart.getMonth() - 6);
      periodStart.setDate(1);
      periodEnd = new Date(periodStart);
      periodEnd.setMonth(periodEnd.getMonth() + 6);
      periodEnd.setDate(periodEnd.getDate() - 1);
      break;
    case 'lastYear':
      periodStart.setFullYear(periodStart.getFullYear() - 1);
      periodEnd.setFullYear(periodEnd.getFullYear() - 1);
      break;
    case 'custom':
      periodStart.setDate(periodStart.getDate() - (periodEnd.getDate() - periodStart.getDate()));
      periodEnd.setDate(periodEnd.getDate() - (periodEnd.getDate() - periodStart.getDate()));
      break;
    default:
      periodStart.setDate(periodStart.getDate() - 7);
      periodEnd.setDate(periodEnd.getDate() - 7);
      break;
  }
  return { startDate: periodStart, endDate: periodEnd, period: periodType };
}

function StatisticsSummary(
  transactions: db.Transaction[],
  timePeriod: TimePeriod
) {
  // table displaying the total income, expenses and savings
  // get total income
  const totalExpense = transactions
    .filter(
      (transaction) =>
        transaction.amount < 0 &&
        new Date(transaction.date) >= timePeriod.startDate &&
        new Date(transaction.date) <= timePeriod.endDate
    )
    .reduce((acc, transaction) => acc + Math.abs(transaction.amount), 0);
  const totalIncome = transactions
    .filter(
      (transaction) =>
        transaction.amount > 0 &&
        new Date(transaction.date) >= timePeriod.startDate &&
        new Date(transaction.date) <= timePeriod.endDate
    )
    .reduce((acc, transaction) => acc + transaction.amount, 0);
  const totalSavings = totalIncome - totalExpense;
  const percentageSavings = (totalSavings / totalIncome) * 100;
  // get same stats for the previous period
  const previousTimePeriod = getLastPeriod(new Date(timePeriod.startDate), new Date(timePeriod.endDate), timePeriod.period);
  const transactionsExpensePrevious = transactions.filter(
    (transaction) =>
      transaction.amount < 0 &&
      new Date(transaction.date) >= previousTimePeriod.startDate &&
      new Date(transaction.date) <= previousTimePeriod.endDate
  );
  const transactionsIncomePrevious = transactions.filter(
    (transaction) =>
      transaction.amount > 0 &&
      new Date(transaction.date) >= previousTimePeriod.startDate &&
      new Date(transaction.date) <= previousTimePeriod.endDate
  );
  const totalExpensePrevious = transactionsExpensePrevious.reduce(
    (acc, transaction) => acc + Math.abs(transaction.amount),
    0
  );
  const totalIncomePrevious = transactionsIncomePrevious.reduce(
    (acc, transaction) => acc + transaction.amount,
    0
  );
  const totalSavingsPrevious = totalIncomePrevious - totalExpensePrevious;
  const percentageSavingsPrevious =
    (totalSavingsPrevious / totalIncomePrevious) * 100;
  // now calculate the change in the stats
  const totalExpenseChange = totalExpense - totalExpensePrevious;
  const totalIncomeChange = totalIncome - totalIncomePrevious;
  const totalSavingsChange = totalSavings - totalSavingsPrevious;
  const percentageSavingsChange = percentageSavings - percentageSavingsPrevious;

  return (
    <div className="statistics-summary-overview">
      <TableContainer component={Paper}>
        <Table stickyHeader aria-label="statistics-summary-table">
          <TableHead>
            <TableRow>
              <TableCell>
                <div className="statistics-table-header">Summary</div>
              </TableCell>
              <TableCell>{`${formatDate(previousTimePeriod.startDate)} - ${formatDate(previousTimePeriod.endDate)}`}</TableCell>
              <TableCell>{`${formatDate(timePeriod.startDate)} - ${formatDate(timePeriod.endDate)}`}</TableCell>
              <TableCell>Change</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell>Income</TableCell>
              <TableCell>{formatCurrency(totalIncomePrevious)}</TableCell>
              <TableCell
                style={{
                  color: totalIncomeChange > 0 ? 'green' : 'red',
                }}
              >
                {formatCurrency(totalIncome)}
              </TableCell>
              <TableCell
                style={{
                  color: totalIncomeChange > 0 ? 'green' : 'red',
                }}
              >
                {formatCurrency(totalIncomeChange)}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Expenses</TableCell>
              <TableCell>{formatCurrency(totalExpensePrevious)}</TableCell>
              <TableCell
                style={{
                  color: totalExpenseChange < 0 ? 'green' : 'red',
                }}
              >
                {formatCurrency(totalExpense)}
              </TableCell>
              <TableCell
                style={{
                  color: totalExpenseChange < 0 ? 'green' : 'red',
                }}
              >
                {formatCurrency(totalExpenseChange)}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Savings</TableCell>
              <TableCell>{formatCurrency(totalSavingsPrevious)}</TableCell>
              <TableCell
                style={{
                  color: totalSavingsChange > 0 ? 'green' : 'red',
                }}
              >
                {formatCurrency(totalSavings)}
              </TableCell>
              <TableCell
                style={{
                  color: totalSavingsChange > 0 ? 'green' : 'red',
                }}
              >
                {formatCurrency(totalSavingsChange)}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Percentage Savings</TableCell>
              <TableCell>{percentageSavingsPrevious.toFixed(2)}%</TableCell>
              <TableCell
                style={{
                  color: percentageSavingsChange > 0 ? 'green' : 'red',
                }}
              >
                {percentageSavings.toFixed(2)}%
              </TableCell>
              <TableCell
                style={{
                  color: percentageSavingsChange > 0 ? 'green' : 'red',
                }}
              >
                {percentageSavingsChange.toFixed(2)}%
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}

// same table as StatisticsSummary but for every category
function StatisticsByCategory(
  transactions: db.Transaction[],
  timePeriod: TimePeriod,
  categories: db.Category[],
  type: string
) {
  // get same stats for the previous period
  const previousTimePeriod = getLastPeriod(new Date(timePeriod.startDate), new Date(timePeriod.endDate), timePeriod.period);
  // define Transaction[]
  let transactionsCurrent: db.Transaction[];
  let transactionsPrevious: db.Transaction[];
  if (type === 'Expense') {
    transactionsCurrent = transactions.filter(
      (transaction) =>
        transaction.amount < 0 &&
        new Date(transaction.date) >= timePeriod.startDate &&
        new Date(transaction.date) <= timePeriod.endDate
    );
    transactionsPrevious = transactions.filter(
      (transaction) =>
        transaction.amount < 0 &&
        new Date(transaction.date) >= previousTimePeriod.startDate &&
        new Date(transaction.date) <= previousTimePeriod.endDate
    );
  } else {
    transactionsCurrent = transactions.filter(
      (transaction) =>
        transaction.amount > 0 &&
        new Date(transaction.date) >= timePeriod.startDate &&
        new Date(transaction.date) <= timePeriod.endDate
    );
    transactionsPrevious = transactions.filter(
      (transaction) =>
        transaction.amount > 0 &&
        new Date(transaction.date) >= previousTimePeriod.startDate &&
        new Date(transaction.date) <= previousTimePeriod.endDate
    );
  }

  return (
    <div className={`statistics-summary-${type}`}>
      <Paper sx={{ overflow: 'hidden' }}>
        <TableContainer sx={{ maxHeight: 'calc(100vh - 414px)' }}>
          <Table stickyHeader aria-label="statistics-summary-table">
            <TableHead>
              <TableRow>
                <TableCell>
                  <div className="statistics-table-header">
                    {type} Categories
                  </div>
                </TableCell>
                <TableCell>{`${formatDate(previousTimePeriod.startDate)} - ${formatDate(previousTimePeriod.endDate)}`}</TableCell>
                <TableCell>{`${formatDate(timePeriod.startDate)} - ${formatDate(timePeriod.endDate)}`}</TableCell>
                <TableCell>Change</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {categories.map((category) => {
                const transactionsCategory = transactionsCurrent.filter(
                  (transaction) => transaction.category === category.name
                );
                const transactionsCategoryPrevious =
                  transactionsPrevious.filter(
                    (transaction) => transaction.category === category.name
                  );
                const totalCategory = transactionsCategory.reduce(
                  (total, transaction) => total + Math.abs(transaction.amount),
                  0
                );
                const totalCategoryPrevious =
                  transactionsCategoryPrevious.reduce(
                    (total, transaction) =>
                      total + Math.abs(transaction.amount),
                    0
                  );
                const totalCategoryChange =
                  totalCategory - totalCategoryPrevious;
                const totalCategoryChangePercentage =
                  (totalCategoryChange / totalCategoryPrevious) * 100;

                return (
                  <TableRow>
                    <TableCell>{category.name}</TableCell>
                    <TableCell>
                      {formatCurrency(totalCategoryPrevious)}
                    </TableCell>
                    <TableCell>{formatCurrency(totalCategory)}</TableCell>
                    <TableCell
                      style={{
                        color:
                          // eslint-disable-next-line no-nested-ternary
                          type === 'Expense'
                            ? totalCategoryChange < 0
                              ? 'green'
                              : 'red'
                            : totalCategoryChange > 0
                              ? 'green'
                              : 'red',
                      }}
                    >
                      {formatCurrency(totalCategoryChange)} (
                      {totalCategoryChangePercentage.toFixed(2)}%)
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </div>
  );
}

function Statistics() {
  const [transactionsAll, setTransactionsAll] = useState<db.Transaction[]>([]);
  const [categoriesIncome, setCategoriesIncome] = useState<db.Category[]>([]);
  const [categoriesExpense, setCategoriesExpense] = useState<db.Category[]>([]);
  const [timePeriod, setTimePeriod] = useState<TimePeriod>({
    startDate: GetDefaultPeriod().startDate,
    endDate: GetDefaultPeriod().endDate,
    period: 'week',
  });
  useEffect(() => {
    // get transactions from db between time period
    QueryTransactions("SELECT * FROM Transactions where category <> '🚫 Ignore'", []).then((resp: db.Transaction[]) => {
      // calc reimbursements
      resp.forEach((transaction) => {
        if (transaction.reimbursedBy) {
          const reimbursedTransaction = resp.find((item) => item.id === transaction.reimbursedBy);
          if (reimbursedTransaction) {
            transaction.amount = Math.min(transaction.amount + reimbursedTransaction.amount, 0);
          }
        }
      });
      // remove reimbursed transaction from list
      resp = resp.filter((transaction) => transaction.category !== '🔁 Reimbursement');
      setTransactionsAll(resp);
    });
    // get categories from db
    QueryCategories("SELECT * FROM CategoriesIncome where name <> '🚫 Ignore'", []).then((resp: db.Category[]) => {
      setCategoriesIncome(resp);
    });
    QueryCategories("SELECT * FROM CategoriesExpense where name <> '🚫 Ignore'", []).then((resp: db.Category[]) => {
      setCategoriesExpense(resp);
    });
  }, [timePeriod]);
  if (timePeriod === undefined || transactionsAll === undefined) {
    return <div>Loading...</div>;
  }

  return (
    <div className="statistics-container">
      <div className="time-period-selector-container-statistics">
        <TimePeriodSelector onTimePeriodChange={setTimePeriod} />
      </div>
      <div className="statistics-summary-container">
        {StatisticsSummary(transactionsAll, timePeriod)}
      </div>
      <div className="statistics-tables-container">
        <div className="statistics-category-expense-container">
          {StatisticsByCategory(
            transactionsAll,
            timePeriod,
            categoriesExpense,
            'Expense'
          )}
        </div>
        <div className="statistics-category-income-container">
          {StatisticsByCategory(
            transactionsAll,
            timePeriod,
            categoriesIncome,
            'Income'
          )}
        </div>
      </div>
    </div>
  );
}

export default Statistics;
