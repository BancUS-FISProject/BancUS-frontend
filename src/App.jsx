// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import HealthBar from "./components/HealthBar";
import Navbar from "./components/Navbar";
import OverviewPage from "./components/OverviewPage";
import AccountsPage from "./components/AccountsPage";
import TransactionsPage from "./components/TransactionsPage";
import FraudPage from "./components/FraudPage";
import LoginActivityPage from "./components/LoginActivityPage";
import PaymentsPage from "./components/PaymentsPage";
import NotificationsPage from "./components/NotificationsPage";
import CardsPage from "./components/CardsPage";
import HomePage from "./pages/HomePage";
import PricingPage from "./pages/PricingPage";
import "./App.css";

function App() {
  return (
    <Router>
      <div className="app">
        <HealthBar />
        <Navbar />

        <main className="app-main">
          <div className="page-inner">
            <Routes>
              <Route path="/" element={<OverviewPage />} />
              <Route path="/accounts" element={<AccountsPage />} />
              <Route path="/transactions" element={<TransactionsPage />} />
              <Route path="/fraud" element={<FraudPage />} />
              <Route path="/login-activity" element={<LoginActivityPage />} />
              <Route path="/payments" element={<PaymentsPage />} />
              <Route path="/notifications" element={<NotificationsPage />} />
              <Route path="/cards" element={<CardsPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
              <Route path="/pricing" element={<PricingPage/>} />
            </Routes>
          </div>
        </main>
      </div>
    </Router>
  );
}

export default App;
