# School Fee Management System

A comprehensive web-based application for managing school fees, student records, payments, and communication with parents. Built with React, Bootstrap, and modern web technologies.

## 🌟 Features

### 1. **Dashboard**
- Overview of all key metrics
- Total students count with payment status breakdown
- Total collected fees and outstanding balances
- School wallet balance
- Recent payments and students listing
- Payment status visualization (Paid, Partial, Pending)

### 2. **Students Management**
- Add, edit, and delete student records
- Comprehensive student information:
  - Student name and class
  - Parent/guardian details (name, phone, email)
  - Fee structure (total fees, paid amount, balance)
  - Payment status tracking
- Advanced search functionality
- Filter by name, class, or parent information

### 3. **Payments & Transactions**
- Record new payments with multiple payment methods:
  - Cash
  - Mobile Money
  - Bank Transfer
  - Card/POS
- Payment categorization:
  - Tuition Fee
  - Examination Fee
  - Library Fee
  - Transport Fee
  - Other
- Automatic receipt generation
- Print receipts functionality
- Payment reference tracking
- Filter by payment method
- Search by student name or reference number

### 4. **School Wallet**
- Real-time wallet balance tracking
- Transaction history (Credits and Debits)
- Add credit/debit transactions
- Financial summary with:
  - Total credits
  - Total debits
  - Net cash flow
  - Average transaction amount
- Filter transactions by type

### 5. **Communication Center**
- **Direct Messaging**:
  - Send messages to individual parents
  - SMS-style communication
  - Character count tracking
  
- **Template Messages**:
  - Pre-built message templates
  - Mass messaging capabilities
  - Send to all parents or specific groups
  - Target parents with pending/partial payments
  
- **Message Templates**:
  - Create custom message templates
  - Fee reminder templates
  - Payment confirmation templates
  - Customizable with placeholders
  
- **Recipients Management**:
  - View all parent contact information
  - Send targeted messages based on payment status

### 6. **Reports & Analytics**
- **Summary Reports**:
  - Total students and payment statistics
  - Collection rate analysis
  - Outstanding fees summary
  
- **Detailed Reports**:
  - Complete student fee breakdown
  - Parent contact information
  - Payment history
  
- **Payment Methods Analysis**:
  - Breakdown by payment method
  - Transaction listing
  - Method preference insights
  
- **Outstanding Fees Report**:
  - Prioritized list of outstanding fees
  - High/medium priority classification
  - Contact information for follow-up
  
- **Export & Print**:
  - Export reports to CSV format
  - Professional print layout
  - Date range filtering
  - Class-based filtering

## 🚀 Technology Stack

- **Frontend Framework**: React 18
- **UI Library**: React Bootstrap 5
- **Routing**: React Router DOM v6
- **Icons**: React Icons (Font Awesome)
- **Styling**: Custom CSS + Bootstrap
- **State Management**: React Context API
- **Build Tool**: Vite

## 📦 Installation

1. **Clone or navigate to the project directory**:
   ```bash
   cd school-fee-management
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Run the development server**:
   ```bash
   npm run dev
   ```

4. **Open your browser** and navigate to:
   ```
   http://localhost:5173
   ```

## 🔐 Login Credentials

For demo purposes, any username and password combination will work.

**Example**:
- Username: `admin`
- Password: `admin`

## 📁 Project Structure

```
school-fee-management/
├── public/              # Static assets
├── src/
│   ├── assets/         # Images and other assets
│   ├── components/     # Reusable components
│   │   ├── Navbar.jsx
│   │   ├── Sidebar.jsx
│   │   ├── StatCard.jsx
│   │   └── ProtectedRoute.jsx
│   ├── contexts/       # Context providers
│   │   ├── AuthContext.jsx
│   │   └── DataContext.jsx
│   ├── pages/          # Page components
│   │   ├── Dashboard.jsx
│   │   ├── Students.jsx
│   │   ├── Payments.jsx
│   │   ├── Wallet.jsx
│   │   ├── Communication.jsx
│   │   ├── Reports.jsx
│   │   └── Login.jsx
│   ├── utils/          # Utility functions
│   ├── App.jsx         # Main app component
│   ├── App.css         # Global styles
│   ├── index.css       # Reset & base styles
│   └── main.jsx        # Entry point
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

## 🎨 Key Components

### Context Providers

#### AuthContext
- Manages user authentication state
- Login/logout functionality
- Protected route handling

#### DataContext
- Central state management for:
  - Students data
  - Payments/transactions
  - Wallet balance and transactions
  - Messages and templates
- CRUD operations for all entities

### Protected Routes
- Prevents unauthorized access
- Redirects to login page
- Maintains authentication state

## 💡 Usage Guide

### Adding a Student
1. Navigate to **Students** page
2. Click **Add New Student** button
3. Fill in required information:
   - Student name and class
   - Parent details
   - Total fees
4. Click **Add Student**

### Recording a Payment
1. Navigate to **Payments** page
2. Click **Record Payment** button
3. Select the student
4. Enter payment amount
5. Choose payment method and type
6. Select payment date
7. Click **Record Payment**
8. View/print the generated receipt

### Sending Messages
1. Navigate to **Communication** page
2. Choose between:
   - **Direct Message**: Send to a specific parent
   - **Template Message**: Use pre-built templates for mass messaging
3. Fill in the details
4. Click **Send Message**

### Generating Reports
1. Navigate to **Reports** page
2. Select report type
3. Set date range and filters
4. Click **Generate Report**
5. Export to CSV or print as needed

## 🎯 Features Highlights

### Automatic Calculations
- Student balance automatically updated after payments
- Wallet balance synced with transactions
- Payment status automatically determined

### Real-time Updates
- All data updates reflected immediately
- No page refresh required
- Smooth user experience

### Responsive Design
- Mobile-friendly interface
- Works on tablets and desktops
- Adaptive layout for all screen sizes

### Print-Optimized
- Clean receipt layouts
- Professional report printing
- Print-specific styling

## 🔧 Configuration

### Customizing Initial Data
Edit `src/contexts/DataContext.jsx` to modify:
- Sample students
- Initial payments
- Wallet balance
- Message templates

### Styling
- Global styles: `src/App.css`
- Bootstrap theme: Modify Bootstrap variables in `src/index.css`
- Component-specific styles: Inline styles in component files

## 📊 Sample Data

The application comes with pre-populated sample data:
- 5 sample students (matching the Java system data)
- Multiple payment records
- Wallet transactions
- Message templates
- Communication history

## 🚀 Building for Production

```bash
npm run build
```

This creates an optimized production build in the `dist/` folder.

## 🤝 Contributing

This is an educational project based on the Financial Management System Java application. Feel free to:
- Report issues
- Suggest improvements
- Add new features

## 📝 License

This project is open source and available for educational purposes.

## 🙏 Acknowledgments

- Inspired by the Java-based Financial Management System
- Built with React and modern web technologies
- UI powered by React Bootstrap

## 📞 Support

For questions or support, please refer to the documentation or create an issue in the project repository.

---

**Version**: 1.0.0  
**Last Updated**: November 2025  
**Status**: Complete ✅

## 🔄 Comparison with Java System

This React frontend provides equivalent functionality to the Java Swing application:

| Feature | Java System | React System |
|---------|-------------|--------------|
| Student Management | ✅ | ✅ |
| Payment Processing | ✅ | ✅ |
| Receipt Generation | ✅ | ✅ (Enhanced) |
| Wallet/Account | ✅ | ✅ |
| Reports | ✅ | ✅ (More detailed) |
| Communication | ❌ | ✅ (New feature) |
| Web-based | ❌ | ✅ |
| Mobile Responsive | ❌ | ✅ |
| Print Receipts | ✅ | ✅ |
| Export Data | Limited | ✅ CSV Export |

## 🎓 Learning Outcomes

By studying this project, you'll learn:
- React Hooks (useState, useContext, useEffect)
- React Router for navigation
- Context API for state management
- Bootstrap integration in React
- Form handling and validation
- Modal dialogs and user interactions
- Print functionality in web apps
- CSV export implementation
- Responsive design principles
- Component composition patterns

---

**Happy Learning! 🎉**

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
