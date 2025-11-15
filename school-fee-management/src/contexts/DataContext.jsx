import { createContext, useContext, useState, useEffect } from 'react';
import { studentsAPI, paymentsAPI, feesAPI, walletAPI, smsAPI } from '../utils/api';

const DataContext = createContext();

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

export const DataProvider = ({ children }) => {
  // State
  const [students, setStudents] = useState([]);
  const [payments, setPayments] = useState([]);
  const [feeStructure, setFeeStructure] = useState([]);
  const [walletBalance, setWalletBalance] = useState(0);
  const [smsBalance, setSmsBalance] = useState(0);
  const [walletTransactions, setWalletTransactions] = useState([]);
  const [smsLogs, setSmsLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load initial data
  const loadStudents = async (filters = {}) => {
    try {
      setLoading(true);
      const data = await studentsAPI.getAll(filters);
      setStudents(data);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error loading students:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadPayments = async (filters = {}) => {
    try {
      setLoading(true);
      const data = await paymentsAPI.getAll(filters);
      setPayments(data);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error loading payments:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadFeeStructure = async (filters = {}) => {
    try {
      setLoading(true);
      const data = await feesAPI.getAll(filters);
      setFeeStructure(data);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error loading fee structure:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadWalletData = async () => {
    try {
      setLoading(true);
      const balance = await walletAPI.getBalance();
      setWalletBalance(balance.wallet_balance);
      setSmsBalance(balance.sms_balance);
      
      const transactions = await walletAPI.getTransactions();
      setWalletTransactions(transactions);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error loading wallet data:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadSMSLogs = async () => {
    try {
      const logs = await smsAPI.getLogs();
      setSmsLogs(logs);
    } catch (err) {
      console.error('Error loading SMS logs:', err);
    }
  };

  // Student Functions
  const addStudent = async (studentData) => {
    try {
      setLoading(true);
      const newStudent = await studentsAPI.create(studentData);
      setStudents([...students, newStudent]);
      setError(null);
      return { success: true, data: newStudent };
    } catch (err) {
      setError(err.message);
      console.error('Error adding student:', err);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const updateStudent = async (id, updatedData) => {
    try {
      setLoading(true);
      const updated = await studentsAPI.update(id, updatedData);
      setStudents(students.map(s => s.id === id ? updated : s));
      setError(null);
      return { success: true, data: updated };
    } catch (err) {
      setError(err.message);
      console.error('Error updating student:', err);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const deleteStudent = async (id) => {
    try {
      setLoading(true);
      await studentsAPI.delete(id);
      setStudents(students.filter(s => s.id !== id));
      setError(null);
      return { success: true };
    } catch (err) {
      setError(err.message);
      console.error('Error deleting student:', err);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const getStudentStatistics = async () => {
    try {
      return await studentsAPI.getStatistics();
    } catch (err) {
      console.error('Error loading statistics:', err);
      return { total: 0, paid: 0, partial: 0, unpaid: 0 };
    }
  };

  const getStudentFeeRecords = async (studentId) => {
    try {
      return await studentsAPI.getFeeRecords(studentId);
    } catch (err) {
      console.error('Error loading student fee records:', err);
      return [];
    }
  };

  // Payment Functions
  const addPayment = async (paymentData, sendSMS = false) => {
    try {
      setLoading(true);
      const newPayment = await paymentsAPI.create(paymentData, sendSMS);
      setPayments([...payments, newPayment]);
      
      // Refresh student data to update balances
      await loadStudents();
      
      // Refresh wallet balance
      await loadWalletData();
      
      setError(null);
      return { success: true, data: newPayment };
    } catch (err) {
      setError(err.message);
      console.error('Error adding payment:', err);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const getPaymentReceipt = async (paymentId) => {
    try {
      return await paymentsAPI.getReceipt(paymentId);
    } catch (err) {
      console.error('Error loading receipt:', err);
      throw err;
    }
  };

  const sendPaymentReceipt = async (paymentId) => {
    try {
      await paymentsAPI.sendReceiptSMS(paymentId);
      return { success: true };
    } catch (err) {
      console.error('Error sending receipt:', err);
      return { success: false, error: err.message };
    }
  };

  // Fee Structure Functions
  const addFeeType = async (feeData) => {
    try {
      setLoading(true);
      const newFee = await feesAPI.create(feeData);
      setFeeStructure([...feeStructure, newFee]);
      setError(null);
      return { success: true, data: newFee };
    } catch (err) {
      setError(err.message);
      console.error('Error adding fee type:', err);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const updateFeeType = async (id, updatedData) => {
    try {
      setLoading(true);
      const updated = await feesAPI.update(id, updatedData);
      setFeeStructure(feeStructure.map(f => f.id === id ? updated : f));
      setError(null);
      return { success: true, data: updated };
    } catch (err) {
      setError(err.message);
      console.error('Error updating fee type:', err);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const deleteFeeType = async (id) => {
    try {
      setLoading(true);
      await feesAPI.delete(id);
      setFeeStructure(feeStructure.filter(f => f.id !== id));
      setError(null);
      return { success: true };
    } catch (err) {
      setError(err.message);
      console.error('Error deleting fee type:', err);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const getFeesByYearAndTerm = async (year, term) => {
    try {
      return await feesAPI.getAll({ year, term });
    } catch (err) {
      console.error('Error loading fees:', err);
      return [];
    }
  };

  const getFeeSummary = async (year, term, level = null) => {
    try {
      return await feesAPI.getSummary(year, term, level);
    } catch (err) {
      console.error('Error loading fee summary:', err);
      return { total_fees: 0, fee_types: [] };
    }
  };

  // Wallet Functions
  const topUpWallet = async (amount, method) => {
    try {
      setLoading(true);
      await walletAPI.topUp(amount, method);
      await loadWalletData();
      setError(null);
      return { success: true };
    } catch (err) {
      setError(err.message);
      console.error('Error topping up wallet:', err);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const purchaseSMS = async (units) => {
    try {
      setLoading(true);
      const result = await walletAPI.purchaseSMS(units);
      await loadWalletData();
      setError(null);
      return { success: true, data: result };
    } catch (err) {
      setError(err.message);
      console.error('Error purchasing SMS:', err);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // SMS Functions
  const sendBulkSMS = async (message, paymentStatus = null, studentIds = []) => {
    try {
      setLoading(true);
      const result = await smsAPI.sendBulk(message, paymentStatus, studentIds);
      await loadWalletData(); // Refresh SMS balance
      await loadSMSLogs(); // Refresh logs
      setError(null);
      return { success: true, data: result };
    } catch (err) {
      setError(err.message);
      console.error('Error sending bulk SMS:', err);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const value = {
    // Data
    students,
    payments,
    feeStructure,
    walletBalance,
    smsBalance,
    walletTransactions,
    smsLogs,
    loading,
    error,
    
    // Load functions
    loadStudents,
    loadPayments,
    loadFeeStructure,
    loadWalletData,
    loadSMSLogs,
    
    // Student functions
    addStudent,
    updateStudent,
    deleteStudent,
    getStudentStatistics,
    getStudentFeeRecords,
    
    // Payment functions
    addPayment,
    getPaymentReceipt,
    sendPaymentReceipt,
    
    // Fee structure functions
    addFeeType,
    updateFeeType,
    deleteFeeType,
    getFeesByYearAndTerm,
    getFeeSummary,
    
    // Wallet functions
    topUpWallet,
    purchaseSMS,
    
    // SMS functions
    sendBulkSMS,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};
