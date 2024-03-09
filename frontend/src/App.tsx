import { useState } from 'react';
import { Route, MemoryRouter as Router, Routes } from 'react-router-dom';

import './styles/App.css';
// import TransactionsTable from './components/TransactionsTable/TransactionsTable';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import CategoryTable from './components/CategoryTable/CategoryTable';
import Dashboard from './components/Dashboard/Dashboard';
import Statistics from './components/Statistics/Statistics';
import TransactionsTable from './components/TransactionsTable/TransactionsTable';

type Tab = 'dashboard' | 'statistics' | 'income' | 'expenses' | 'budgetTargets';


const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#7657c0',
      dark: 'white',
    },
  },
});

function DashboardView() {
  return <Dashboard />;
}

function StatisticsView() {
  return <Statistics />;
}

function IncomeView() {
  return (
    <div className="transactions-tables-container">
      <div className="transactions-table-Income">
        <TransactionsTable type="Income" />;
      </div>
    </div>
  );
}

function ExpensesView() {
  return (
    <div className="transactions-tables-container">
      <div className="transactions-table-Expense">
        <TransactionsTable type="Expense" />;
      </div>
    </div>
  );
}

function BudgetTargetsView() {
  return (
    <div className="target-tables-container">
      <div className="expense-targets-table">
        <CategoryTable type="Expense"/>
      </div>
      <div className="income-targets-table">
        <CategoryTable type="Income"/>
      </div>
    </div>
  );
}

function MainLayout() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');

  const handleTabClick = (tab: Tab) => {
    setActiveTab(tab);
  };

  return (
    <div>
      <div className="tabs-container">
        <button
          type="button"
          id="tab"
          className={`tab-dashboard ${
            activeTab === 'dashboard' ? 'active' : ''
          }`}
          onClick={() => handleTabClick('dashboard')}
        >
          Dashboard
        </button>
        <button
          type="button"
          id="tab"
          className={`tab-statistics ${
            activeTab === 'statistics' ? 'active' : ''
          }`}
          onClick={() => handleTabClick('statistics')}
        >
          Statistics
        </button>
        <button
          type="button"
          id="tab"
          className={`tab-expenses ${activeTab === 'expenses' ? 'active' : ''}`}
          onClick={() => handleTabClick('expenses')}
        >
          Expenses
        </button>
        <button
          type="button"
          id="tab"
          className={`tab-income ${activeTab === 'income' ? 'active' : ''}`}
          onClick={() => handleTabClick('income')}
        >
          Income
        </button>
        <button
          type="button"
          id="tab"
          className={`tab-budgetTargets ${
            activeTab === 'budgetTargets' ? 'active' : ''
          }`}
          onClick={() => handleTabClick('budgetTargets')}
        >
          Budget Targets
        </button>
      </div>

      {activeTab === 'dashboard' && <DashboardView />}
      {activeTab === 'statistics' && <StatisticsView />}
      {activeTab === 'expenses' && <ExpensesView />}
      {activeTab === 'income' && <IncomeView />}
      {activeTab === 'budgetTargets' && <BudgetTargetsView />}
      </div>
  );
}


const queryClient = new QueryClient()

export default function App() {
  return (
    <ThemeProvider theme={darkTheme}>
    <QueryClientProvider client={queryClient}>
    <Router>
      <Routes>
        <Route path="/" element={<MainLayout />} />
      </Routes>
    </Router>

    </QueryClientProvider>
    </ThemeProvider>
  );
}
