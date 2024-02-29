import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import { useState } from 'react';

import './styles/App.css';
// import TransactionsTable from './components/TransactionsTable/TransactionsTable';
import Dashboard from './components/Dashboard/Dashboard';
import CategoryExpenseTable from './components/CategoryTable/CategoryExpenseTable';
// import CategoryIncomeTable from './components/CategoryTable/CategoryIncomeTable';
import Statistics from './components/Statistics/Statistics';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

type Tab = 'dashboard' | 'statistics' | 'income' | 'expenses' | 'budgetTargets';

function DashboardView() {
  return <Dashboard />;
}

function StatisticsView() {
  return <Statistics />;
}

// function IncomeView() {
//   return <TransactionsTable type="Income" />;
// }

// function ExpensesView() {
//   return <TransactionsTable type="Expense" />;
// }

function BudgetTargetsView() {
  return (
    <div className="target-tables-container">
      <div className="expense-targets-table">
        <CategoryExpenseTable />
      </div>
      <div className="income-targets-table">
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
      {/* {activeTab === 'expenses' && <ExpensesView />}
      {activeTab === 'income' && <IncomeView />} */}
      {activeTab === 'budgetTargets' && <BudgetTargetsView />}
    </div>
  );
}


const queryClient = new QueryClient()

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
    <Router>
      <Routes>
        <Route path="/" element={<MainLayout />} />
      </Routes>
    </Router>

    </QueryClientProvider>
  );
}