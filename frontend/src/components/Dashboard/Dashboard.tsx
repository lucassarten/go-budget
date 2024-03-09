/* eslint-disable promise/catch-or-return */
/* eslint-disable promise/always-return */
/* eslint-disable react/destructuring-assignment */
import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  TextField,
} from '@mui/material';
import { Chart, registerables } from 'chart.js';
import annotationPlugin from 'chartjs-plugin-annotation';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { useEffect, useState } from 'react';
import { Bar, Pie } from 'react-chartjs-2';

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

interface TimePeriodSelectorProps {
  // eslint-disable-next-line no-unused-vars
  onTimePeriodChange: (timePeriod: TimePeriod) => void;
}

interface IntervalSelectorProps {
  // eslint-disable-next-line no-unused-vars
  onIntervalChange: (timePeriod: TimePeriod) => void;
  // eslint-disable-next-line no-unused-vars
}

interface CategorySelectorProps {
  // eslint-disable-next-line no-unused-vars
  onCategoryChange: (category: db.Category) => void;
  categories: db.Category[];
}

const validateDate = (value: Date) => {
  try {
    value.toISOString();
    return true;
  } catch (e) {
    return false;
  }
};

function TimePeriodSelector({ onTimePeriodChange }: TimePeriodSelectorProps) {
  const [selectedOption, setSelectedOption] = useState('all');
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
          className="time-period-selector"
          id="timePeriodSelect"
          value={selectedOption}
          label="Time Period"
          onChange={handleOptionChange}
        >
          <MenuItem value="lastWeek">Last Week</MenuItem>
          <MenuItem value="lastMonth">Last Month</MenuItem>
          <MenuItem value="lastThreeMonths">Last 3 Months</MenuItem>
          <MenuItem value="lastSixMonths">Last 6 Months</MenuItem>
          <MenuItem value="lastYear">Last Year</MenuItem>
          <MenuItem value="all">All</MenuItem>
          <MenuItem value="custom">Custom</MenuItem>
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

Chart.register(...registerables, ChartDataLabels, annotationPlugin);

function categoryPieChart(
  type: string,
  categories: db.Category[],
  transactions: db.Transaction[]
) {
  const categoriesPeriod = categories.filter((category) => {
    const categoryTransactions = transactions.filter(
      (transaction) => transaction.category === category.name
    );
    return categoryTransactions.length > 0;
  });
  return (
    <Pie
      data={{
        labels: categoriesPeriod.map((category) => category.name),
        datasets: [
          {
            label: type,
            data: categoriesPeriod.map((category) => {
              const categoryTransactions = transactions.filter(
                (transaction) => transaction.category === category.name
              );
              if (categoryTransactions.length === 0) {
                return 0;
              }
              return categoryTransactions.reduce(
                (acc, transaction) => acc + transaction.amount,
                0
              );
            }),
            backgroundColor: categoriesPeriod.map(
              (category) => category.colour
            ),
          },
        ],
      }}
      options={{
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'left',
          },
          title: {
            display: true,
            text: `${type === 'Income' ? 'Income' : 'Expenses'} by Category`,
            color: 'white',
            position: 'top',
            padding: {
              bottom: 20,
            },
          },
          datalabels: {
            anchor: 'center',
            align: 'center',
            color: 'white',
            clip: false,
            formatter: (value) => {
              if (value < 0) {
                return `-$${Math.round(Math.abs(value))}`;
              }
              return `$${Math.round(value)}`;
            },
            font: {
              weight: 'bold',
              size: 16,
            },
          },
        },
      }}
    />
  );
}

function IncomeEarningSavingsComparison(transactions: db.Transaction[]) {
  const income = transactions
    .filter((transaction) => transaction.amount > 0)
    .reduce((acc, transaction) => acc + transaction.amount, 0);
  const expenses = transactions
    .filter((transaction) => transaction.amount < 0)
    .reduce((acc, transaction) => acc + Math.abs(transaction.amount), 0);
  return (
    <Bar
      data={{
        labels: [''],
        datasets: [
          {
            label: 'Income',
            data: [income],
            backgroundColor: 'green',
            barPercentage: 0.9,
          },
          {
            label: 'Expenses',
            data: [-expenses],
            backgroundColor: 'red',
            barPercentage: 0.9,
          },
          {
            label: 'Savings',
            data: [income - expenses],
            backgroundColor: 'blue',
            barPercentage: 0.9,
          },
        ],
      }}
      options={{
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'left',
          },
          title: {
            display: true,
            text: 'Summary',
            color: 'white',
            position: 'top',
            padding: {
              bottom: 20,
            },
          },
          datalabels: {
            anchor: 'end',
            align: 'top',
            formatter: (value) => {
              if (value < 0) {
                return `-$${Math.round(Math.abs(value))}`;
              }
              return `$${Math.round(value)}`;
            },
            font: {
              weight: 'bold',
            },
          },
        },
        // make no gaps between bars
        indexAxis: 'x',

        scales: {
          x: {
            display: true,
            offset: true,
            grid: {
                color: 'grey',
            },
          },
          y: {
            display: true,
            offset: true,
            grid: {
                color: 'grey',
            },
          },
        },
      }}
    />
  );
}

/**
 * Creates a bar chart graphing the budget vs actual spending for a given category, for the last 10 periods of the currently selected time period
 * @param type
 * @param categories
 * @param transactions
 * @returns
 */
function budgetComparisonBarChart(
  timePeriod: TimePeriod,
  category: db.Category,
  transactions: db.Transaction[],
  type: string
) {
  // split all transactions into periods of time timePeriod long (e.g. 10 periods of 1 month each)
  const timePeriodLength =
    timePeriod.endDate.getTime() - timePeriod.startDate.getTime();
  const periods: db.Transaction[][] = [];
  for (let i = 0; i < 10; i += 1) {
    const periodStart = new Date(
      timePeriod.endDate.getTime() - timePeriodLength * (i + 1)
    );
    const periodEnd = new Date(
      timePeriod.endDate.getTime() - timePeriodLength * i
    );
    const periodTransactions = transactions.filter(
      (transaction) =>
        new Date(transaction.date) >= periodStart &&
        new Date(transaction.date) < periodEnd
    );
    periods.push(periodTransactions);
  }
  // generate labels for the x axis
  const labels = periods.map((period) => {
    const periodStart = new Date(
      timePeriod.endDate.getTime() -
        timePeriodLength * (periods.indexOf(period) + 1)
    );
    const periodEnd = new Date(
      timePeriod.endDate.getTime() - timePeriodLength * periods.indexOf(period)
    );
    return `${
      periodStart.getMonth() + 1
    }/${periodStart.getDate()}/${periodStart.getFullYear()} - ${
      periodEnd.getMonth() + 1
    }/${periodEnd.getDate()}/${periodEnd.getFullYear()}`;
  });
  let budget = 0;
  if (category) {
    // calulate budget over implied time period. Budgets are for the month, so if the time period is a year, the budget is the monthly budget * 12
    budget = category.target * (timePeriodLength / 1000 / 60 / 60 / 24 / 30.5);
  }
  const actuals = periods.map((period) => {
    const periodTransactions = period.filter(
      (transaction) =>
        transaction.category === category.name &&
        (type === 'Income' ? transaction.amount > 0 : transaction.amount < 0)
    );
    return periodTransactions.reduce(
      (acc, transaction) => acc + Math.abs(transaction.amount),
      0
    );
  });
  return (
    <Bar
      data={{
        labels: labels.reverse(),
        datasets: [
          {
            label: 'Actual',
            data: actuals.reverse(),
            backgroundColor: type === 'Income' ? 'green' : 'red',
            barPercentage: 0.9,
          },
        ],
        // draw a line for the budget
      }}
      options={{
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'left',
          },
          title: {
            display: true,
            text: `Implied ${type} Budget of ${formatCurrency(
              budget
            )} vs Actual`,
            color: 'white',
            position: 'top',
            padding: {
              bottom: 20,
            },
          },
          datalabels: {
            anchor: 'end',
            align: 'top',
            formatter: (value) => `$${Math.round(value)}`,
            font: {
              weight: 'bold',
            },
          },
          annotation: {
            annotations: {
              line1: {
                type: 'line',
                scaleID: 'y',
                value: budget,
                borderColor: 'blue',
                borderWidth: 2,
                label: {
                  backgroundColor: 'blue',
                  content: 'Budget',
                },
              },
            },
          },
        },
        // make no gaps between bars
        indexAxis: 'x',

        scales: {
          x: {
            display: true,
            offset: true,
            grid: {
                color: 'grey',
            },
          },
          y: {
            display: true,
            offset: true,
            grid: {
                color: 'grey',
            },
          },
        },
      }}
    />
  );
}

function CategorySelector({
  onCategoryChange,
  categories,
}: CategorySelectorProps) {
  const [selectedOption, setSelectedOption] = useState(categories[0]);
  const handleOptionChange = (event: SelectChangeEvent<db.Category>) => {
    setSelectedOption(event.target.value as db.Category);
    onCategoryChange(event.target.value as db.Category);
  };

  useEffect(() => {
    setSelectedOption(categories[0]);
  }, [categories]);

  return (
    <FormControl>
      <InputLabel id="category-selector-label">Category</InputLabel>
      <Select
        displayEmpty
        labelId="category-selector-label"
        className="category-selector"
        id="CategorySelector"
        label="Category"
        // @ts-ignore
        value={selectedOption}
        onChange={handleOptionChange}
      >
        {categories.map((category) => (
          // @ts-ignore
          <MenuItem key={category.name} value={category}>
            {category.name}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

function IntervalSelector({ onIntervalChange }: IntervalSelectorProps) {
  const [selectedOption, setSelectedOption] = useState('week');

  const handleOptionChange = (event: SelectChangeEvent<string>) => {
    setSelectedOption(event.target.value);
    // print start end dates
    let startDateCalc = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const endDateCalc = new Date();
    switch (event.target.value) {
      case 'day':
        startDateCalc = new Date(Date.now() - 24 * 60 * 60 * 1000);
        onIntervalChange({
          startDate: startDateCalc,
          endDate: endDateCalc,
        });
        break;
      case 'week':
        startDateCalc = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        onIntervalChange({
          startDate: startDateCalc,
          endDate: endDateCalc,
        });
        break;
      case 'month':
        startDateCalc = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        onIntervalChange({
          startDate: startDateCalc,
          endDate: endDateCalc,
        });
        break;
      case 'year':
        startDateCalc = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
        onIntervalChange({
          startDate: startDateCalc,
          endDate: endDateCalc,
        });
        break;
      default:
        onIntervalChange({
          startDate: startDateCalc,
          endDate: endDateCalc,
        });
        break;
    }
  };

  return (
    <FormControl>
      <InputLabel id="intervalSelectLabel">Interval</InputLabel>
      <Select
        labelId="intervalSelectLabel"
        className="interval-selector"
        id="intervalSelect"
        label="Interval"
        value={selectedOption}
        onChange={handleOptionChange}
      >
        <MenuItem value="day">Day</MenuItem>
        <MenuItem value="week">Week</MenuItem>
        <MenuItem value="month">Month</MenuItem>
        <MenuItem value="year">Year</MenuItem>
      </Select>
    </FormControl>
  );
}

function Dashboard() {
  const [transactions, setTransactions] = useState<db.Transaction[]>([]);
  const [transactionsAll, setTransactionsAll] = useState<db.Transaction[]>([]);
  const [categoriesIncome, setCategoriesIncome] = useState<db.Category[]>([]);
  const [categoriesExpense, setCategoriesExpense] = useState<db.Category[]>([]);
  const [timePeriod, setTimePeriod] = useState<TimePeriod>({
    startDate: new Date(0),
    endDate: new Date(),
  });
  const [intervalExpense, setIntervalExpense] = useState<TimePeriod>({
    // default 1 week
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    endDate: new Date(),
  });
  const [intervalIncome, setIntervalIncome] = useState<TimePeriod>({
    // default 1 week
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    endDate: new Date(),
  });
  const [selectedCategoryExpense, setSelectedCategoryExpense] =
    useState<db.Category>();
  const [selectedCategoryIncome, setSelectedCategoryIncome] =
    useState<db.Category>();

  useEffect(() => {
    // get transactions from db between time period
    QueryTransactions(`SELECT * FROM Transactions where category <> '🚫 Ignore'`, []).then((resp: db.Transaction[]) => {
      setTransactionsAll(resp);
      if (resp != null && resp.length > 0) {
        // filter out transactions that are not in the time period
        const filteredTransactions = resp.filter((transaction) => {
          const transactionDate = new Date(transaction.date);
          return (
            transactionDate >= timePeriod.startDate &&
            transactionDate <= timePeriod.endDate
          );
        });
        setTransactions(filteredTransactions);
      }
    });
    // get categories from db
    QueryCategories(`SELECT * FROM CategoriesExpense where name <> '🚫 Ignore'`, []).then((resp: db.Category[]) => {

      if (resp != null && resp.length > 0) {
        setSelectedCategoryExpense(resp[0]);
        setCategoriesExpense(resp);
      }
    });
    QueryCategories(`SELECT * FROM CategoriesIncome where name <> '🚫 Ignore'`, []).then((resp: db.Category[]) => {
      if (resp != null && resp.length > 0) {
        setSelectedCategoryIncome(resp[0]);
        setCategoriesIncome(resp);
      }
    });
  }, [timePeriod]);

  const transactionsExpense = transactions.filter(
    (transaction) => transaction.amount < 0
  );
  const transactionsIncome = transactions.filter(
    (transaction) => transaction.amount > 0
  );
  // wait for use state to be set before returning
  if (
    selectedCategoryIncome === undefined ||
    selectedCategoryExpense === undefined
  ) {
    return <div>Loading...</div>;
  }
  return (
    <div className="dashboard-container">
      <div className="time-period-selector-container">
        <TimePeriodSelector onTimePeriodChange={setTimePeriod} />
      </div>
      <div className="dashboard-graph-container">
        <div className="dashboard-chart-grid">
          <div className="bar-chart-container">
            {IncomeEarningSavingsComparison(transactions)}
          </div>
          <div className="pie-chart-container">
            {categoryPieChart(
              'Expense',
              categoriesExpense,
              transactionsExpense
            )}
          </div>
          <div className="pie-chart-container">
            {categoryPieChart('Income', categoriesIncome, transactionsIncome)}
          </div>
        </div>
        <div className="dashboard-comparison-grid">
          <div className="budget-comparison-container">
            <div className="category-selector-container">
              <CategorySelector
                onCategoryChange={setSelectedCategoryExpense}
                categories={categoriesExpense}
              />
              <IntervalSelector onIntervalChange={setIntervalExpense} />
            </div>
            <div className="comparison-chart-container">
              {budgetComparisonBarChart(
                intervalExpense,
                selectedCategoryExpense,
                transactionsAll,
                'Expense'
              )}
            </div>
          </div>
          <div className="budget-comparison-container">
            <div className="category-selector-container">
              <CategorySelector
                onCategoryChange={setSelectedCategoryIncome}
                categories={categoriesIncome}
              />
              <IntervalSelector onIntervalChange={setIntervalIncome} />
            </div>
            <div className="comparison-chart-container">
              {budgetComparisonBarChart(
                intervalIncome,
                selectedCategoryIncome,
                transactionsAll,
                'Income'
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
