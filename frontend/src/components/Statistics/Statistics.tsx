/* eslint-disable react/destructuring-assignment */
// the statitics view presents the raw statistics of the budget in tables
import { useEffect, useState } from 'react';
import {
  TextField,
  FormControl,
  InputLabel,
  Select,
  SelectChangeEvent,
  MenuItem,
} from '@mui/material';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

import { QueryCategories, QueryTransactions } from "../../../wailsjs/go/db/Db";
import { db } from "../../../wailsjs/go/models";

interface TimePeriod {
  startDate: Date;
  endDate: Date;
}

const formatCurrency = (value: number) => {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'NZD',
    currencyDisplay: 'symbol',
  });
  return formatter.format(value);
};

const validateDate = (value: Date) => {
  try {
    value.toISOString();
    return true;
  } catch (e) {
    return false;
  }
};

interface TimePeriodSelectorProps {
  // eslint-disable-next-line no-unused-vars
  onTimePeriodChange: (timePeriod: TimePeriod) => void;
}

function TimePeriodSelector({ onTimePeriodChange }: TimePeriodSelectorProps) {
  const [selectedOption, setSelectedOption] = useState('lastMonth');
  const [startDate, setStartDate] = useState<Date>(new Date(0));
  const [endDate, setEndDate] = useState<Date>(new Date());

  const handleOptionChange = (event: SelectChangeEvent<string>) => {
    setSelectedOption(event.target.value);
    // print start end dates
    let startDateCalc = new Date(0);
    const endDateCalc = new Date();
    switch (event.target.value) {
      case 'lastWeek':
        startDateCalc = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        onTimePeriodChange({
          startDate: startDateCalc,
          endDate: endDateCalc,
        });
        break;
      case 'lastMonth':
        startDateCalc = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        onTimePeriodChange({
          startDate: startDateCalc,
          endDate: endDateCalc,
        });
        setStartDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
        break;
      case 'lastThreeMonths':
        startDateCalc = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
        onTimePeriodChange({
          startDate: startDateCalc,
          endDate: endDateCalc,
        });
        break;
      case 'lastSixMonths':
        startDateCalc = new Date(Date.now() - 180 * 24 * 60 * 60 * 1000);
        onTimePeriodChange({
          startDate: startDateCalc,
          endDate: endDateCalc,
        });
        break;
      case 'lastYear':
        startDateCalc = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
        onTimePeriodChange({
          startDate: startDateCalc,
          endDate: endDateCalc,
        });
        break;
      case 'custom':
        // do nothing, wait for user to select custom dates
        break;
      default:
        onTimePeriodChange({
          startDate: startDateCalc,
          endDate: endDateCalc,
        });
        break;
    }
    setStartDate(startDateCalc);
    setEndDate(endDateCalc);
  };

  const handleCustomDatesChange = () => {
    onTimePeriodChange({
      startDate,
      endDate,
    });
  };

  const handleStartDateChange = (date: Date) => {
    setStartDate(date);
  };

  const handleEndDateChange = (date: Date) => {
    setEndDate(date);
  };

  return (
    <>
      <FormControl>
        <InputLabel id="timePeriodSelectLabel">Time Period</InputLabel>
        <Select
          labelId="timePeriodSelectLabel"
          className="time-period-selector-statistics"
          id="timePeriodSelect"
          value={selectedOption}
          label="Time Period"
          onChange={handleOptionChange}
        >
          <MenuItem value="lastWeek">Last Week vs Previous</MenuItem>
          <MenuItem value="lastMonth">Last Month vs Previous</MenuItem>
          <MenuItem value="lastThreeMonths">Last 3 Months vs Previous</MenuItem>
          <MenuItem value="lastSixMonths">Last 6 Months vs Previous</MenuItem>
          <MenuItem value="lastYear">Last Year vs Previous</MenuItem>
          <MenuItem value="custom">Custom vs Previous</MenuItem>
        </Select>
      </FormControl>
      <div className="time-period-custom-container">
        <TextField
          label="Start Date"
          id="startDatePicker"
          onChange={(e) => {
            handleStartDateChange(new Date(e.target.value));
            handleCustomDatesChange();
          }}
          type="date"
          InputLabelProps={{
            shrink: true,
          }}
          disabled={selectedOption !== 'custom'}
          value={
            validateDate(startDate) ? startDate.toISOString().split('T')[0] : ''
          }
        />
        <TextField
          label="End Date"
          id="endDatePicker"
          onChange={(e) => {
            handleEndDateChange(new Date(e.target.value));
            handleCustomDatesChange();
          }}
          type="date"
          InputLabelProps={{
            shrink: true,
          }}
          disabled={selectedOption !== 'custom'}
          value={
            validateDate(endDate) ? endDate.toISOString().split('T')[0] : ''
          }
        />
      </div>
    </>
  );
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
  const timePeriodLength =
    timePeriod.endDate.getTime() - timePeriod.startDate.getTime();
  const previousTimePeriod = {
    startDate: new Date(timePeriod.startDate.getTime() - timePeriodLength),
    endDate: new Date(timePeriod.endDate.getTime() - timePeriodLength),
  };
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
              <TableCell>{`${
                previousTimePeriod.startDate.getMonth() + 1
              }/${previousTimePeriod.startDate.getDate()}/${previousTimePeriod.startDate.getFullYear()} - ${
                previousTimePeriod.endDate.getMonth() + 1
              }/${previousTimePeriod.endDate.getDate()}/${previousTimePeriod.endDate.getFullYear()}`}</TableCell>
              <TableCell>{`${
                timePeriod.startDate.getMonth() + 1
              }/${timePeriod.startDate.getDate()}/${timePeriod.startDate.getFullYear()} - ${
                timePeriod.endDate.getMonth() + 1
              }/${timePeriod.endDate.getDate()}/${timePeriod.endDate.getFullYear()}`}</TableCell>
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
              <TableCell>Expense</TableCell>
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
  const timePeriodLength =
    timePeriod.endDate.getTime() - timePeriod.startDate.getTime();
  const previousTimePeriod = {
    startDate: new Date(timePeriod.startDate.getTime() - timePeriodLength),
    endDate: new Date(timePeriod.endDate.getTime() - timePeriodLength),
  };
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

                <TableCell>{`${
                  previousTimePeriod.startDate.getMonth() + 1
                }/${previousTimePeriod.startDate.getDate()}/${previousTimePeriod.startDate.getFullYear()} - ${
                  previousTimePeriod.endDate.getMonth() + 1
                }/${previousTimePeriod.endDate.getDate()}/${previousTimePeriod.endDate.getFullYear()}`}</TableCell>
                <TableCell>{`${
                  timePeriod.startDate.getMonth() + 1
                }/${timePeriod.startDate.getDate()}/${timePeriod.startDate.getFullYear()} - ${
                  timePeriod.endDate.getMonth() + 1
                }/${timePeriod.endDate.getDate()}/${timePeriod.endDate.getFullYear()}`}</TableCell>
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
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    endDate: new Date(),
  });
  useEffect(() => {
    // get transactions from db between time period
    QueryTransactions("SELECT * FROM Transactions", []).then((response: db.Transaction[]) => {
      setTransactionsAll(response);
    });
    // get categories from db
    QueryCategories("SELECT * FROM CategoriesIncome", []).then((response: db.Category[]) => {
      setCategoriesIncome(response);
    });
    QueryCategories("SELECT * FROM CategoriesExpense", []).then((response: db.Category[]) => {
      setCategoriesExpense(response);
    });
  }, [timePeriod]);
  if (timePeriod === undefined || transactionsAll === undefined) {
    return <div>Loading...</div>;
  }

  return (
    <div className="statistics-container">
      <div className="time-period-selector-container">
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
