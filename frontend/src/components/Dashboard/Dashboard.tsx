/* eslint-disable promise/catch-or-return */
/* eslint-disable promise/always-return */
/* eslint-disable react/destructuring-assignment */

import { Chart, registerables } from 'chart.js';
import annotationPlugin from 'chartjs-plugin-annotation';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { useEffect, useState } from 'react';
import { Bar, Pie } from 'react-chartjs-2';

import { QueryCategories, QueryTransactions } from "../../../wailsjs/go/db/Db";
import { db } from "../../../wailsjs/go/models";

import CategorySelector from '../Selectors/CategorySelector';
import IntervalSelector from '../Selectors/IntervalSelector';
import TimePeriodSelector from '../Selectors/TimePeriodSelector';
import { formatCurrency, formatDate } from '../../Utils/Formatters';

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
  // Calculate budget based on the category and time period length
  const budget = calculateBudget(category, timePeriod);
  // Calculate actuals based on the transactions, category, and type
  const actuals = calculateActuals(transactions, category.name, type, timePeriod);
  // Generate labels for the x-axis based on the time periods
  const labels = generateLabels(timePeriod);

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
            text: `Implied ${type} Budget of ${formatCurrency(budget)} vs Actual`,
            color: 'white',
            position: 'top',
            padding: {
              bottom: 20,
            },
          },
          datalabels: {
            anchor: 'end',
            align: 'top',
            formatter: (value: number) => `$${Math.round(value)}`,
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
  )
}

// Calculate implied budget
function calculateBudget(category: db.Category, timePeriod: TimePeriod): number {
  if (!category) return 0;
  return category.monthly * getTimePeriodFactor(timePeriod);
}

function calculateActuals(transactions: db.Transaction[], categoryName: string, type: string, timePeriod: TimePeriod): number[] {
  return generatePeriods(timePeriod)
    .map(period => calculatePeriodActual(transactions, categoryName, type, period));
}

// Calculate the total expenses or income for a given category and time period
function calculatePeriodActual(transactions: db.Transaction[], categoryName: string, type: string, period: TimePeriod): number {
  return transactions
    .filter(transaction => isTransactionInPeriod(transaction, period))
    .filter(transaction => isTransactionOfType(transaction, categoryName, type))
    .reduce((acc, transaction) => acc + Math.abs(transaction.amount), 0);
}

function isTransactionInPeriod(transaction: db.Transaction, period: TimePeriod): boolean {
  const transactionDate = new Date(transaction.date);
  return transactionDate >= period.startDate && transactionDate < period.endDate;
}

function isTransactionOfType(transaction: db.Transaction, categoryName: string, type: string): boolean {
  return transaction.category === categoryName && (type === 'Income' ? transaction.amount > 0 : transaction.amount < 0);
}

// Generate labels for x-axis
function generateLabels(timePeriod: TimePeriod): string[] {
  return generatePeriods(timePeriod)
    .map(period => `${formatDate(period.startDate)} - ${formatDate(period.endDate)}`);
}

// Generate periods based on the time period
function generatePeriods(timePeriod: TimePeriod): TimePeriod[] {
  const periods: TimePeriod[] = [];
  let periodStart = new Date(timePeriod.startDate.getTime());
  let periodEnd = new Date(timePeriod.endDate.getTime());

  for (let i = 0; i < 10; i++) {
    periods.push({
      startDate: new Date(periodStart),
      endDate: new Date(periodEnd),
      period: timePeriod.period
    });
    movePeriodBackward(periodStart, periodEnd, timePeriod.period);
  }

  return periods;
}

function movePeriodBackward(periodStart: Date, periodEnd: Date, periodType: string): TimePeriod {
  switch (periodType) {
    case 'day':
      periodStart.setDate(periodStart.getDate() - 1);
      periodEnd.setDate(periodEnd.getDate() - 1);
      break;
    case 'week':
      periodStart.setDate(periodStart.getDate() - 7);
      periodEnd.setDate(periodEnd.getDate() - 7);
      break;
    case 'month':
      periodStart.setMonth(periodStart.getMonth() - 1);
      periodStart.setDate(1);
      periodEnd.setDate(0);
      break;
    case 'year':
      periodStart.setFullYear(periodStart.getFullYear() - 1);
      periodEnd.setFullYear(periodEnd.getFullYear() - 1);
      break;
    default:
      periodStart.setDate(periodStart.getDate() - 7);
      periodEnd.setDate(periodEnd.getDate() - 7);
      break;
  }
  return { startDate: periodStart, endDate: periodEnd, period: periodType };
}

function getTimePeriodFactor(timePeriod: TimePeriod): number {
  const timePeriodLength = timePeriod.endDate.getTime() - timePeriod.startDate.getTime();
  return timePeriodLength / (1000 * 60 * 60 * 24 * 30.5); // Assuming a month has 30.5 days
}

function Dashboard() {
  const [transactions, setTransactions] = useState<db.Transaction[]>([]);
  const [transactionsAll, setTransactionsAll] = useState<db.Transaction[]>([]);
  const [categoriesIncome, setCategoriesIncome] = useState<db.Category[]>([]);
  const [categoriesExpense, setCategoriesExpense] = useState<db.Category[]>([]);
  const [timePeriod, setTimePeriod] = useState<TimePeriod>({
    startDate: new Date(0),
    endDate: new Date(),
    period: 'week',
  });
  const [intervalExpense, setIntervalExpense] = useState<TimePeriod>({
    // default 1 week
    startDate: GetDefaultPeriod().startDate,
    endDate: GetDefaultPeriod().endDate,
    period: 'week',
  });
  const [intervalIncome, setIntervalIncome] = useState<TimePeriod>({
    // default 1 week
    startDate: GetDefaultPeriod().startDate,
    endDate: GetDefaultPeriod().endDate,
    period: 'week',
  });
  const [selectedCategoryExpense, setSelectedCategoryExpense] =
    useState<db.Category>();
  const [selectedCategoryIncome, setSelectedCategoryIncome] =
    useState<db.Category>();

  useEffect(() => {
    // get transactions from db between time period
    QueryTransactions(`SELECT * FROM Transactions where category <> '🚫 Ignore'`, []).then((resp: db.Transaction[]) => {
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

export interface TimePeriod {
  startDate: Date;
  endDate: Date;
  period: string;
}

export function GetDefaultPeriod(): TimePeriod {
  const startDateCalc = new Date();
  startDateCalc.setDate(startDateCalc.getDate() - startDateCalc.getDay() + 1);
  const endDateCalc = new Date(startDateCalc);
  endDateCalc.setDate(endDateCalc.getDate() + 6);
  startDateCalc.setHours(0, 0, 0, 0);
  endDateCalc.setHours(23, 59, 59, 999);
  return {
    startDate: startDateCalc,
    endDate: endDateCalc,
    period: 'week',
  };
}

export default Dashboard;
