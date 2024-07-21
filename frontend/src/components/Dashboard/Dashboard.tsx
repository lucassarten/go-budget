/* eslint-disable promise/catch-or-return */
/* eslint-disable promise/always-return */
/* eslint-disable react/destructuring-assignment */

import { Chart, registerables } from 'chart.js';
import annotationPlugin from 'chartjs-plugin-annotation';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { useEffect, useState } from 'react';
import { Bar, Pie } from 'react-chartjs-2';

import { GetCategories, GetTransactions } from "../../../wailsjs/go/db/Db";
import { ent } from "../../../wailsjs/go/models";

import { formatCurrency, formatDate } from '../../Utils/Formatters';
import CategorySelector from '../Selectors/CategorySelector';
import IntervalSelector from '../Selectors/IntervalSelector';
import TimePeriodSelector from '../Selectors/TimePeriodSelector';

Chart.register(...registerables, ChartDataLabels, annotationPlugin);

function categoryPieChart(
  type: string,
  categories: ent.Category[],
  transactions: ent.Transaction[]
) {
  const categoriesPeriod = categories.filter((category) => {
    const categoryTransactions = transactions.filter(
      (transaction) => transaction.category_id === category.id
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
                (transaction) => transaction.category_id === category.id
              );
              if (categoryTransactions.length === 0) {
                return 0;
              }
              return categoryTransactions.reduce(
                (acc, transaction) => acc + Number(transaction.amount),
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

function IncomeEarningSavingsComparison(transactions: ent.Transaction[]) {
  const income = transactions
    .filter((transaction) => Number(transaction.amount) > 0)
    .reduce((acc, transaction) => acc + Number(transaction.amount), 0);
  const expenses = transactions
    .filter((transaction) => Number(transaction.amount) < 0)
    .reduce((acc, transaction) => acc + Math.abs(Number(transaction.amount)), 0);
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
  category: ent.Category,
  transactions: ent.Transaction[],
  type: string
) {
  // Calculate budget based on the category and time period length
  const budget = calculateBudget(category, timePeriod);
  // Calculate actuals based on the transactions, category, and type
  const actuals = calculateActuals(transactions, Number(category.id), type, timePeriod);
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
function calculateBudget(category: ent.Category, timePeriod: TimePeriod): number {
  if (!category) return 0;
  return Number(category.monthly) * getTimePeriodFactor(timePeriod);
}

function calculateActuals(transactions: ent.Transaction[], categoryID: number, type: string, timePeriod: TimePeriod): number[] {
  return generatePeriods(timePeriod)
    .map(period => calculatePeriodActual(transactions, categoryID, type, period));
}

// Calculate the total expenses or income for a given category and time period
function calculatePeriodActual(transactions: ent.Transaction[], categoryID: number, type: string, period: TimePeriod): number {
  return transactions
    .filter(transaction => isTransactionInPeriod(transaction, period))
    .filter(transaction => isTransactionOfType(transaction, categoryID, type))
    .reduce((acc, transaction) => acc + Math.abs(Number(transaction.amount)), 0);
}

function isTransactionInPeriod(transaction: ent.Transaction, period: TimePeriod): boolean {
  const transactionDate = new Date(Number(transaction.time) * 1000);
  return transactionDate >= period.startDate && transactionDate < period.endDate;
}

function isTransactionOfType(transaction: ent.Transaction, categoryID: number, type: string): boolean {
  return transaction.category_id === categoryID && (type === 'Income' ? Number(transaction.amount) > 0 : Number(transaction.amount) < 0);
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
  const [transactions, setTransactions] = useState<ent.Transaction[]>([]);
  const [transactionsAll, setTransactionsAll] = useState<ent.Transaction[]>([]);
  const [categoriesIncome, setCategoriesIncome] = useState<ent.Category[]>([]);
  const [categoriesExpense, setCategoriesExpense] = useState<ent.Category[]>([]);
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
    useState<ent.Category>();
  const [selectedCategoryIncome, setSelectedCategoryIncome] =
    useState<ent.Category>();

  useEffect(() => {
    // get transactions from db between time period
    GetTransactions().then((resp: ent.Transaction[]) => {
      // calc reimbursements
      resp.forEach((transaction) => {
        if (transaction.reimbursed_by_id) {
          const reimbursedTransaction = resp.find((item) => item.id === transaction.reimbursed_by_id);
          if (reimbursedTransaction) {
            transaction.amount = Math.min(Number(transaction.amount) + Number(reimbursedTransaction.amount), 0);
          }
        }
      });
      // remove reimbursed transaction from list
      resp = resp.filter((transaction) => !transaction.reimbursed_by_id);
      setTransactionsAll(resp);
      if (resp != null && resp.length > 0) {
        // filter out transactions that are not in the time period
        const filteredTransactions = resp.filter((transaction) => {
          const transactionDate = new Date(Number(transaction.time) * 1000);
          return (
            transactionDate >= timePeriod.startDate &&
            transactionDate <= timePeriod.endDate
          );
        });
        setTransactions(filteredTransactions);
      }
    });
    // get categories from db
    GetCategories().then((resp: ent.Category[]) => {
      if (resp != null && resp.length > 0) {
        const expense = resp.filter((c) => c.type === "Expense")
        const income = resp.filter((c) => c.type === "Income")
        setSelectedCategoryExpense(expense[0]);
        setCategoriesExpense(expense);
        setSelectedCategoryIncome(income[0]);
        setCategoriesIncome(income);
      }
    });
  }, [timePeriod]);

  const transactionsExpense = transactions.filter(
    (transaction) => Number(transaction.amount) < 0
  );
  const transactionsIncome = transactions.filter(
    (transaction) => Number(transaction.amount) > 0
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
