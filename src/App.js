// src/App.js
import React from 'react';
import {BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import Home from './pages/Home';
import Shop from './pages/Shop';
import Checkout from './pages/Checkout';
import CustomerInfo from './pages/CustomerInfo';
import Payment from './pages/Payment';
import DeliveryStatus from './pages/DeliveryStatus';
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import NotFoundPage from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import ResetPassword from "./pages/ResetPassword";
import PaymentVerification from "./components/PaymentVerification";

function RegisterAndLogout() {
    return <SignUp />;
}

function App() {
  return (
      <Router>
        <Routes>
            <Route path="/login" element={<Login/>} />
            <Route path="/signup" element={<RegisterAndLogout/>} />
          <Route path="/" element={<Home />} />
          <Route path="/shop/:shopId" element={<Shop />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/customer-info" element={
              <ProtectedRoute>
                  <CustomerInfo />
              </ProtectedRoute>
          } />
          <Route path="/payment" element={
              <ProtectedRoute>
                  <Payment />
              </ProtectedRoute>
          } />
            <Route path="/payment/verify" element={
                <ProtectedRoute>
                    <PaymentVerification />
                </ProtectedRoute>
            } />
            <Route path="/delivery-status" element={
                <ProtectedRoute>
                <DeliveryStatus />
                </ProtectedRoute>
            } />
            <Route path="*" element={<NotFoundPage />} />
            <Route path="/reset-password" element = {<ResetPassword/>} />
        </Routes>
      </Router>
  );
}

export default App;
