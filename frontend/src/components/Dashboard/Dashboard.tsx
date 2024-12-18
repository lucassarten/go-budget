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

import { dateToUnix, formatCurrency, formatDate } from '../../Utils/Formatters';
import { IntervalValue, PeriodValue, TimeInterval, TimePeriod, getIntervalFactor } from '../../Utils/Types';
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

function IncomeEarningSavingsComparison(transactionsExpense: ent.Transaction[], transactionsIncome: ent.Transaction[]) {
  const income = transactionsIncome.reduce((acc, transaction) => acc + Number(transaction.amount), 0);
  const expenses = transactionsExpense.reduce((acc, transaction) => acc + Math.abs(Number(transaction.amount)), 0);
  console.log("inc", income)
  console.log("ex", expenses)
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
  timeInterval: TimeInterval,
  category: ent.Category,
  transactions: ent.Transaction[],
  type: string
) {
  // Calculate budget based on the category and time period length
  const budget = calculateBudget(category, timeInterval);
  // Calculate actuals based on the transactions, category, and type
  const actuals = calculateActuals(transactions, Number(category.id), type, timeInterval);
  // Generate labels for the x-axis based on the time periods
  const labels = generateLabels(timeInterval);

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
function calculateBudget(category: ent.Category, timeInterval: TimeInterval): number {
  if (!category) return 0;
  return Number(category.monthly) * getTimeIntervalFactor(timeInterval);
}

function calculateActuals(transactions: ent.Transaction[], categoryID: number, type: string, timeInterval: TimeInterval): number[] {
  return generateIntervals(timeInterval)
    .map(interval => calculatePeriodActual(transactions, categoryID, type, interval));
}

// Calculate the total expenses or income for a given category and time period
function calculatePeriodActual(transactions: ent.Transaction[], categoryID: number, type: string, interval: TimeInterval): number {
  return transactions
    .filter(transaction => isTransactionInInterval(transaction, interval))
    .filter(transaction => isTransactionOfType(transaction, categoryID, type))
    .reduce((acc, transaction) => acc + Math.abs(Number(transaction.amount)), 0);
}

function isTransactionInInterval(transaction: ent.Transaction, interval: TimeInterval): boolean {
  const transactionDate = new Date(Number(transaction.time));
  return transactionDate >= interval.startDate && transactionDate < interval.endDate;
}

function isTransactionOfType(transaction: ent.Transaction, categoryID: number, type: string): boolean {
  return transaction.category_id === categoryID && (type === 'Income' ? Number(transaction.amount) > 0 : Number(transaction.amount) < 0);
}

// Generate labels for x-axis
function generateLabels(timeInterval: TimeInterval): string[] {
  return generateIntervals(timeInterval)
    .map(interval => `${formatDate(interval.startDate)} - ${formatDate(interval.endDate)}`);
}

// Generate periods based on the time period
function generateIntervals(timeInterval: TimeInterval): TimeInterval[] {
  const intervals: TimeInterval[] = [];
  let intervalStart = new Date(timeInterval.startDate.getTime());
  let intervalEnd = new Date(timeInterval.endDate.getTime());

  for (let i = 0; i < 10; i++) {
    intervals.push({
      startDate: new Date(intervalStart),
      endDate: new Date(intervalEnd),
      interval: timeInterval.interval
    });
    moveIntervalBackward(intervalStart, intervalEnd, timeInterval.interval);
  }

  return intervals;
}

function moveIntervalBackward(periodStart: Date, periodEnd: Date, interval: IntervalValue): TimeInterval {
  switch (interval) {
    case IntervalValue.Day:
      periodStart.setDate(periodStart.getDate() - 1);
      periodEnd.setDate(periodEnd.getDate() - 1);
      break;
    case IntervalValue.Week:
      periodStart.setDate(periodStart.getDate() - 7);
      periodEnd.setDate(periodEnd.getDate() - 7);
      break;
    case IntervalValue.Month:
      periodStart.setMonth(periodStart.getMonth() - 1);
      periodStart.setDate(1);
      periodEnd.setDate(0);
      break;
    case IntervalValue.Year:
      periodStart.setFullYear(periodStart.getFullYear() - 1);
      periodEnd.setFullYear(periodEnd.getFullYear() - 1);
      break;
    default:
      periodStart.setDate(periodStart.getDate() - 7);
      periodEnd.setDate(periodEnd.getDate() - 7);
      break;
  }
  return { startDate: periodStart, endDate: periodEnd, interval: interval };
}

function getTimeIntervalFactor(timeInterval: TimeInterval): number {
  const timeIntervalLength = timeInterval.endDate.getTime() - timeInterval.startDate.getTime();
  return timeIntervalLength / (1000 * 60 * 60 * 24 * 30.5); // Assuming a month has 30.5 days
}

function calculateAverageExpenses(transactions: ent.Transaction[], categories: ent.Category[], period: TimePeriod, interval: TimeInterval) {
  let grandTotal = 0;
  const categoryTotals: { [categoryName: string]: number } = categories
    .filter((category) => category.name) // Ensure category.name is defined
    .reduce((acc, category) => {
      const categoryTransactions = transactions.filter(
        (transaction) => transaction.category_id === category.id
      );

      const total = categoryTransactions.reduce(
        (acc, transaction) => acc + Math.abs(Number(transaction.amount)),
        0
      );


      const average = total / getIntervalFactor(period, interval.interval);
      grandTotal += average;
      // Assign the category name as a key with the average as the value
      acc[category.name as string] = average;
      return acc;
    }, {} as { [categoryName: string]: number });
  return {categoryTotals, grandTotal};
}


function Dashboard() {
  const [transactions, setTransactions] = useState<ent.Transaction[]>([]);
  const [transactionsInTimeRange, setTransactionsInTimeRange] = useState<ent.Transaction[]>([]);
  const [categories, setCategories] = useState<ent.Category[]>([]);
  const [categoriesIncome, setCategoriesIncome] = useState<ent.Category[]>([]);
  const [categoriesExpense, setCategoriesExpense] = useState<ent.Category[]>([]);
  // This is the selection of data that the dashboard displays
  const [timeRange, setTimeRange] = useState<TimePeriod>({
    startDate: GetDefaultPeriod().startDate,
    endDate: GetDefaultPeriod().endDate,
    period: GetDefaultPeriod().period,
  });
  // These are buckets to group transactions into
  const [intervalExpense, setIntervalExpense] = useState<TimeInterval>({
    startDate: GetDefaultInterval().startDate,
    endDate: GetDefaultInterval().endDate,
    interval: GetDefaultInterval().interval,
  });
  const [intervalIncome, setIntervalIncome] = useState<TimeInterval>({
    startDate: GetDefaultInterval().startDate,
    endDate: GetDefaultInterval().endDate,
    interval: GetDefaultInterval().interval,
  });
  const [selectedCategoryExpense, setSelectedCategoryExpense] =
    useState<ent.Category>();
  const [selectedCategoryIncome, setSelectedCategoryIncome] =
    useState<ent.Category>();
  const [selectedInterval, setSelectedInterval] = useState<TimeInterval>({
    startDate: GetDefaultInterval().startDate,
    endDate: GetDefaultInterval().endDate,
    interval: GetDefaultInterval().interval,
  });
  const [averageExpenses, setAverageExpenses] = useState<{ [category: string]: number }>({});
  const [grandTotal, setGrandTotal] = useState<number>(0);
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
      setTransactions(resp);
      setFirstDate(Math.min(...resp.map(t => t.time || firstDate)));
    });
    // get categories from db
    GetCategories().then((resp: ent.Category[]) => {
      setCategories(resp);
    });
  }, []);

  // Filter transactions down to those within the time range
  useEffect(() => {
    if (timeRange.startDate && timeRange.endDate) {
      setTransactionsInTimeRange(transactions.filter((transaction) => {
        const transactionDate = new Date(Number(transaction.time));
        return (
          transactionDate >= timeRange.startDate &&
          transactionDate <= timeRange.endDate
        );
      }));
    }
  }, [timeRange, transactions]);

  // Split categories into expense and income categories
  useEffect(() => {
    const income = categories.filter((c) => c.type === "Income")
    const expense = categories.filter((c) => c.type === "Expense")
    setCategoriesIncome(income);
    setCategoriesExpense(expense);

    if (income.length > 0) {
      setSelectedCategoryIncome(income[0]);
    }
    if (expense.length > 0) {
      setSelectedCategoryExpense(expense[0]);
    }
  }, [categories]);

  useEffect(() => {
    // Calculate average expenses when selectedInterval or selectedPeriod changes
    if (categories.length && transactions.length) {
      const { categoryTotals, grandTotal } = calculateAverageExpenses(transactionsExpense, categoriesExpense, timeRange, selectedInterval);
      setAverageExpenses(categoryTotals);
      setGrandTotal(grandTotal);
    }
  }, [selectedInterval, transactionsInTimeRange, categories]);

  // Split transactions into expense and income
  const transactionsExpense = transactionsInTimeRange.filter(
    (transaction) => Number(transaction.amount) < 0
  );
  const transactionsIncome = transactionsInTimeRange.filter(
    (transaction) => Number(transaction.amount) > 0
  );
  // wait for use state to be set before returning
  return (
    <div className="dashboard-container">
      {firstDate === 0 ? 
        <></> :
        <div className="time-period-selector-container">
          <TimePeriodSelector onTimePeriodChange={setTimeRange} firstDate={firstDate} />
        </div>
      }
      <div className="dashboard-graph-container">
        <div className="dashboard-chart-grid">
          <div className="bar-chart-container">
            {IncomeEarningSavingsComparison(transactionsExpense, transactionsIncome)}
          </div>
          <div className="pie-chart-container">
            {categoryPieChart('Expense', categoriesExpense, transactionsExpense)}
          </div>
          <div className="pie-chart-container">
            {categoryPieChart('Income', categoriesIncome, transactionsIncome)}
          </div>
        </div>
        <div className="dashboard-comparison-grid">
          {
            selectedCategoryExpense === undefined ?
              <></> :
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
                    transactions,
                    'Expense'
                  )}
                </div>
              </div>
          }
          {
            selectedCategoryIncome === undefined ?
              <></> :
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
                    transactions,
                    'Income'
                  )}
                </div>
              </div>
          }
        </div>
      </div>
      <div className="full-column-table">
        <div className="time-period-selector-container">
          <div className="average-expenses-label">
            <h4>Average expenses per:</h4>
          </div>
          <IntervalSelector onIntervalChange={setSelectedInterval} />
        </div>
        <table className="average-expense-table">
          <thead>
            <tr>
              <th>Category</th>
              <th>Average Expense <br></br>{(dateToUnix(selectedInterval.endDate) - dateToUnix(selectedInterval.startDate)) > (dateToUnix(timeRange.endDate) - dateToUnix(timeRange.startDate)) ? `(projected)` : ``}</th>
            </tr>
          </thead>
          <tbody>
            {categories
              .sort((a, b) => {
                const expenseA = a.name ? averageExpenses[a.name] || 0 : 0;
                const expenseB = b.name ? averageExpenses[b.name] || 0 : 0;
                return expenseB - expenseA;
              })
              .map((category) => (
                <tr key={category.id}>
                  <td>{category.name}</td>
                  <td>{category.name && formatCurrency(averageExpenses[category.name] || 0)}</td>
                </tr>
              ))}

            <br></br>
            <tr>
              <td><strong>Total</strong></td>
              <td><strong>{formatCurrency(grandTotal)}</strong></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}


export function GetDefaultInterval(): TimeInterval {
  const startDateCalc = new Date();
  startDateCalc.setDate(startDateCalc.getDate() - startDateCalc.getDay() + 1);
  const endDateCalc = new Date(startDateCalc);
  endDateCalc.setDate(endDateCalc.getDate() + 6);
  startDateCalc.setHours(0, 0, 0, 0);
  endDateCalc.setHours(23, 59, 59, 999);
  return {
    startDate: startDateCalc,
    endDate: endDateCalc,
    interval: IntervalValue.Week,
  };
}

export function GetDefaultPeriod(): TimePeriod {
  const startDateCalc = new Date();
  startDateCalc.setMonth(0);
  startDateCalc.setDate(1);
  const endDateCalc = new Date(startDateCalc);
  endDateCalc.setFullYear(endDateCalc.getFullYear() + 1);
  endDateCalc.setDate(endDateCalc.getDate() - 1);
  return {
    startDate: startDateCalc,
    endDate: endDateCalc,
    period: PeriodValue.LastYear,
  };
}

export default Dashboard;
