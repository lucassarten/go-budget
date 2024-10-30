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

import { GetCategoriesByType, GetTransactions } from '../../../wailsjs/go/db/Db';
import { ent } from "../../../wailsjs/go/models";
import { formatCurrency, formatDate } from '../../Utils/Formatters';
import { PeriodValue, TimePeriod } from '../../Utils/Types';
import { GetDefaultPeriod } from '../Dashboard/Dashboard';
import TimePeriodSelector from '../Selectors/TimePeriodSelector';

function getLastPeriod(periodStart: Date, periodEnd: Date, period: PeriodValue): TimePeriod {
  switch (period) {
    case PeriodValue.LastWeek:
      periodStart.setDate(periodStart.getDate() - 7);
      periodEnd.setDate(periodEnd.getDate() - 7);
      break;
    case PeriodValue.LastMonth:
      periodStart.setMonth(periodStart.getMonth() - 1);
      periodStart.setDate(1);
      periodEnd.setDate(0);
      break;
    case PeriodValue.LastThreeMonths:
      periodStart.setMonth(periodStart.getMonth() - 3);
      periodStart.setDate(1);
      periodEnd = new Date(periodStart);
      periodEnd.setMonth(periodEnd.getMonth() + 3);
      periodEnd.setDate(periodEnd.getDate() - 1);

      break;
    case PeriodValue.LastSixMonths:
      periodStart.setMonth(periodStart.getMonth() - 6);
      periodStart.setDate(1);
      periodEnd = new Date(periodStart);
      periodEnd.setMonth(periodEnd.getMonth() + 6);
      periodEnd.setDate(periodEnd.getDate() - 1);
      break;
    case PeriodValue.LastYear:
      periodStart.setFullYear(periodStart.getFullYear() - 1);
      periodEnd.setFullYear(periodEnd.getFullYear() - 1);
      break;
    case PeriodValue.Custom:
      periodStart.setDate(periodStart.getDate() - (periodEnd.getDate() - periodStart.getDate()));
      periodEnd.setDate(periodEnd.getDate() - (periodEnd.getDate() - periodStart.getDate()));
      break;
    default:
      periodStart.setDate(periodStart.getDate() - 7);
      periodEnd.setDate(periodEnd.getDate() - 7);
      break;
  }
  return { startDate: periodStart, endDate: periodEnd, period: period };
}

function StatisticsSummary(
  transactions: ent.Transaction[],
  timePeriod: TimePeriod
) {
  // table displaying the total income, expenses and savings
  // get total income
  const totalExpense = transactions
    .filter(
      (transaction) =>
        Number(transaction.amount) < 0 &&
        new Date(Number(transaction.time)) >= timePeriod.startDate &&
        new Date(Number(transaction.time)) <= timePeriod.endDate
    )
    .reduce((acc, transaction) => acc + Math.abs(Number(transaction.amount)), 0);
  const totalIncome = transactions
    .filter(
      (transaction) =>
        Number(transaction.amount) > 0 &&
        new Date(Number(transaction.time)) >= timePeriod.startDate &&
        new Date(Number(transaction.time)) <= timePeriod.endDate
    )
    .reduce((acc, transaction) => acc + Number(transaction.amount), 0);
  const totalSavings = totalIncome - totalExpense;
  const percentageSavings = (totalSavings / totalIncome) * 100;
  // get same stats for the previous period
  const previousTimePeriod = getLastPeriod(new Date(timePeriod.startDate), new Date(timePeriod.endDate), timePeriod.period);
  const transactionsExpensePrevious = transactions.filter(
    (transaction) =>
      Number(transaction.amount) < 0 &&
      new Date(Number(transaction.time)) >= previousTimePeriod.startDate &&
      new Date(Number(transaction.time)) <= previousTimePeriod.endDate
  );
  const transactionsIncomePrevious = transactions.filter(
    (transaction) =>
      Number(transaction.amount) > 0 &&
      new Date(Number(transaction.time)) >= previousTimePeriod.startDate &&
      new Date(Number(transaction.time)) <= previousTimePeriod.endDate
  );
  const totalExpensePrevious = transactionsExpensePrevious.reduce(
    (acc, transaction) => acc + Math.abs(Number(transaction.amount)),
    0
  );
  const totalIncomePrevious = transactionsIncomePrevious.reduce(
    (acc, transaction) => acc + Number(transaction.amount),
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
  transactions: ent.Transaction[],
  timePeriod: TimePeriod,
  categories: ent.Category[],
  type: string
) {
  // get same stats for the previous period
  const previousTimePeriod = getLastPeriod(new Date(timePeriod.startDate), new Date(timePeriod.endDate), timePeriod.period);
  // define Transaction[]
  let transactionsCurrent: ent.Transaction[];
  let transactionsPrevious: ent.Transaction[];
  if (type === 'Expense') {
    transactionsCurrent = transactions.filter(
      (transaction) =>
        Number(transaction.amount) < 0 &&
        new Date(Number(transaction.time)) >= timePeriod.startDate &&
        new Date(Number(transaction.time)) <= timePeriod.endDate
    );
    transactionsPrevious = transactions.filter(
      (transaction) =>
        Number(transaction.amount) < 0 &&
        new Date(Number(transaction.time)) >= previousTimePeriod.startDate &&
        new Date(Number(transaction.time)) <= previousTimePeriod.endDate
    );
  } else {
    transactionsCurrent = transactions.filter(
      (transaction) =>
        Number(transaction.amount) > 0 &&
        new Date(Number(transaction.time)) >= timePeriod.startDate &&
        new Date(Number(transaction.time)) <= timePeriod.endDate
    );
    transactionsPrevious = transactions.filter(
      (transaction) =>
        Number(transaction.amount) > 0 &&
        new Date(Number(transaction.time)) >= previousTimePeriod.startDate &&
        new Date(Number(transaction.time)) <= previousTimePeriod.endDate
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
                  (transaction) => transaction.category_id === category.id
                );
                const transactionsCategoryPrevious =
                  transactionsPrevious.filter(
                    (transaction) => transaction.category_id === category.id
                  );
                const totalCategory = transactionsCategory.reduce(
                  (total, transaction) => total + Math.abs(Number(transaction.amount)),
                  0
                );
                const totalCategoryPrevious =
                  transactionsCategoryPrevious.reduce(
                    (total, transaction) =>
                      total + Math.abs(Number(transaction.amount)),
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
  const [transactionsAll, setTransactionsAll] = useState<ent.Transaction[]>([]);
  const [categoriesIncome, setCategoriesIncome] = useState<ent.Category[]>([]);
  const [categoriesExpense, setCategoriesExpense] = useState<ent.Category[]>([]);
  const [timePeriod, setTimePeriod] = useState<TimePeriod>({
    startDate: GetDefaultPeriod().startDate,
    endDate: GetDefaultPeriod().endDate,
    period: PeriodValue.LastWeek,
  });
  const [firstDate, setFirstDate] = useState<number>(0)

  useEffect(() => {
    // get transactions from db between time period
    GetTransactions().then((resp: ent.Transaction[]) => {
      // remove ignored transactions from list
      resp = resp.filter((transaction) => !transaction.ignored);
      // calc reimbursements
      resp.forEach((transaction) => {
        if (transaction.amount && transaction.amount < 0 && transaction.edges.reimbursed_by_transaction) {
          transaction.amount = Math.min(Number(transaction.amount) + Math.abs(Number(transaction.edges.reimbursed_by_transaction.amount)), 0);
        }
      });
      // remove reimbursement transactions
      resp = resp.filter((transaction) => (transaction.amount && transaction.amount < 0) || (transaction.amount && transaction.amount > 0 && !transaction.edges.reimbursed_by_transaction));
      setTransactionsAll(resp);
      setFirstDate(Math.min(...resp.map(t => t.time || firstDate)));
    });
    // get categories from db
    GetCategoriesByType("Income").then((resp: ent.Category[]) => {
      setCategoriesIncome(resp);
    });
    GetCategoriesByType("Expense").then((resp: ent.Category[]) => {
      setCategoriesExpense(resp);
    });
  }, [timePeriod]);
  if (timePeriod === undefined || transactionsAll === undefined) {
    return <div>Loading...</div>;
  }

  return (
    <div className="statistics-container">

      {firstDate === 0 ?
        <></> :
        <div className="time-period-selector-container-statistics">
          <TimePeriodSelector onTimePeriodChange={setTimePeriod} firstDate={firstDate} />
        </div>
      }
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
