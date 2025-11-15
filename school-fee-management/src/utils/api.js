// API Configuration and Utility Functions
const API_BASE_URL = 'http://localhost:8000';

// Get JWT token from localStorage
const getToken = () => {
  const user = localStorage.getItem('user');
  if (user) {
    const userData = JSON.parse(user);
    return userData.access_token;
  }
  return null;
};

// API request wrapper with authentication
const apiRequest = async (endpoint, options = {}) => {
  const token = getToken();
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const config = {
    ...options,
    headers,
  };
  
  console.log('API Request:', {
    url: `${API_BASE_URL}${endpoint}`,
    method: config.method || 'GET',
    headers: config.headers
  });
  
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    console.log('API Response Status:', response.status);
    
    // Handle non-JSON responses
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return { success: true };
    }
    
    const data = await response.json();
    console.log('API Response Data:', data);
    
    if (!response.ok) {
      throw new Error(data.detail || `HTTP error! status: ${response.status}`);
    }
    
    return data;
  } catch (error) {
    console.error('API Request Error:', error);
    throw error;
  }
};

// Authentication API
export const authAPI = {
  register: async (userData) => {
    return apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },
  
  login: async (username, password) => {
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);
    
    return apiRequest('/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData,
    });
  },
  
  getCurrentUser: async () => {
    return apiRequest('/auth/me');
  },
  
  forgotPassword: async (email) => {
    return apiRequest(`/auth/forgot-password?email=${encodeURIComponent(email)}`, {
      method: 'POST',
    });
  },
  
  resetPassword: async (email, resetCode, newPassword) => {
    return apiRequest(`/auth/reset-password?email=${encodeURIComponent(email)}&reset_code=${encodeURIComponent(resetCode)}&new_password=${encodeURIComponent(newPassword)}`, {
      method: 'POST',
    });
  },
};

// Students API
export const studentsAPI = {
  getAll: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.search) params.append('search', filters.search);
    if (filters.student_class) params.append('student_class', filters.student_class);
    
    const queryString = params.toString();
    return apiRequest(`/students/${queryString ? `?${queryString}` : ''}`);
  },
  
  getById: async (id) => {
    return apiRequest(`/students/${id}`);
  },
  
  create: async (studentData) => {
    return apiRequest('/students/', {
      method: 'POST',
      body: JSON.stringify(studentData),
    });
  },
  
  update: async (id, studentData) => {
    return apiRequest(`/students/${id}`, {
      method: 'PUT',
      body: JSON.stringify(studentData),
    });
  },
  
  delete: async (id) => {
    return apiRequest(`/students/${id}`, {
      method: 'DELETE',
    });
  },
  
  getStatistics: async () => {
    return apiRequest('/students/statistics/summary');
  },
  
  getFeeRecords: async (studentId) => {
    return apiRequest(`/students/${studentId}/fee-records`);
  },
};

// Payments API
export const paymentsAPI = {
  getAll: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.student_id) params.append('student_id', filters.student_id);
    if (filters.start_date) params.append('start_date', filters.start_date);
    if (filters.end_date) params.append('end_date', filters.end_date);
    
    const queryString = params.toString();
    return apiRequest(`/payments/${queryString ? `?${queryString}` : ''}`);
  },
  
  getById: async (id) => {
    return apiRequest(`/payments/${id}`);
  },
  
  create: async (paymentData, sendSMS = false) => {
    return apiRequest(`/payments/?send_sms=${sendSMS}`, {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });
  },
  
  getReceipt: async (id) => {
    return apiRequest(`/payments/${id}/receipt`);
  },
  
  sendReceiptSMS: async (id) => {
    return apiRequest(`/payments/${id}/send-receipt-sms`, {
      method: 'POST',
    });
  },
};

// Fee Structure API
export const feesAPI = {
  getAll: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.academic_year) params.append('academic_year', filters.academic_year);
    if (filters.term) params.append('term', filters.term);
    if (filters.level) params.append('level', filters.level);
    
    const queryString = params.toString();
    return apiRequest(`/fees/${queryString ? `?${queryString}` : ''}`);
  },
  
  create: async (feeData) => {
    return apiRequest('/fees/', {
      method: 'POST',
      body: JSON.stringify(feeData),
    });
  },
  
  update: async (id, feeData) => {
    return apiRequest(`/fees/${id}`, {
      method: 'PUT',
      body: JSON.stringify(feeData),
    });
  },
  
  delete: async (id) => {
    return apiRequest(`/fees/${id}`, {
      method: 'DELETE',
    });
  },
  
  getSummary: async (academicYear, term, level) => {
    const params = new URLSearchParams({ academic_year: academicYear, term });
    if (level) params.append('level', level);
    return apiRequest(`/fees/summary/by-term?${params.toString()}`);
  },
};

// SMS API
export const smsAPI = {
  sendBulk: async (message, paymentStatus = null, studentIds = []) => {
    return apiRequest('/payments/bulk-sms', {
      method: 'POST',
      body: JSON.stringify({
        message,
        payment_status: paymentStatus,
        student_ids: studentIds,
      }),
    });
  },
  
  getLogs: async (limit = 50) => {
    return apiRequest(`/sms/logs?limit=${limit}`);
  },
};

// Wallet API
export const walletAPI = {
  getBalance: async () => {
    return apiRequest('/wallet/balance');
  },
  
  getPricing: async () => {
    // Public endpoint - no auth required
    const response = await fetch(`${API_BASE_URL}/wallet/pricing`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  },
  
  topUp: async (amount, paymentMethod) => {
    return apiRequest('/wallet/topup', {
      method: 'POST',
      body: JSON.stringify({
        amount,
        payment_method: paymentMethod,
      }),
    });
  },
  
  purchaseSMS: async (units) => {
    return apiRequest('/wallet/purchase-sms', {
      method: 'POST',
      body: JSON.stringify({ units }),
    });
  },
  
  getTransactions: async (limit = 50) => {
    return apiRequest(`/wallet/transactions?limit=${limit}`);
  },
};

export default {
  auth: authAPI,
  students: studentsAPI,
  payments: paymentsAPI,
  fees: feesAPI,
  sms: smsAPI,
  wallet: walletAPI,
};
