import React, { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
// import HealthBar from "./components/HealthBar";
import Navbar from "./components/NavBar";
import OverviewPage from "./components/OverviewPage";
import AccountsPage from "./components/AccountsPage";
import TransactionsPage from "./components/TransactionsPage";
import FraudPage from "./components/FraudPage";
import LoginActivityPage from "./components/LoginActivityPage";
import PaymentsPage from "./components/PaymentsPage/PaymentsPage";
import NotificationsPage from "./components/NotificationsPage";
import CardsPage from "./components/CardsPage";
import PricingPage from "./pages/PricingPage";
import StatementsPage from "./pages/StatementsPage";
import "./App.css";
import { getStoredToken, setAuthToken } from "./api";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(Boolean(getStoredToken()));

  const handleLogin = (token) => {
    if (token) {
      setAuthToken(token);
    }
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setAuthToken(null);
    setIsLoggedIn(false);
  };

  const ProtectedRoute = ({ element }) =>
    isLoggedIn ? element : <Navigate to="/" replace />;

  return (
    <Router>
      <div className="app">
        {/* <HealthBar /> */}

        {/* Navbar solo si hay login */}
        <Navbar isLoggedIn={isLoggedIn} onLogout={handleLogout} />

        <main className="app-main">
          <div className="page-inner">
            <Routes>
              <Route
                path="/"
                element={
                  <OverviewPage
                    isLoggedIn={isLoggedIn}
                    onLogin={handleLogin}
                    onLogout={handleLogout}
                  />
                }
              />

              <Route
                path="/accounts"
                element={<ProtectedRoute element={<AccountsPage />} />}
              />
              <Route
                path="/transactions"
                element={<ProtectedRoute element={<TransactionsPage />} />}
              />
              <Route
                path="/fraud"
                element={<ProtectedRoute element={<FraudPage />} />}
              />
              <Route
                path="/login-activity"
                element={<ProtectedRoute element={<LoginActivityPage />} />}
              />
              <Route
                path="/payments"
                element={<ProtectedRoute element={<PaymentsPage />} />}
              />
              <Route
                path="/notifications"
                element={<ProtectedRoute element={<NotificationsPage />} />}
              />
              <Route
                path="/cards"
                element={<ProtectedRoute element={<CardsPage />} />}
              />

              <Route
                path="/statements"
                element={<ProtectedRoute element={<StatementsPage />} />}
              />

              {/* Página de pricing aparte (además del bloque en OverviewPage) */}
              <Route path="/pricing" element={<PricingPage />} />

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </main>
      </div>
    </Router>
  );
}

export default App;
