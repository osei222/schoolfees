# School Fee Management System - User Guide

## Table of Contents
1. [Getting Started](#getting-started)
2. [Dashboard Overview](#dashboard-overview)
3. [Managing Students](#managing-students)
4. [Processing Payments](#processing-payments)
5. [Wallet Management](#wallet-management)
6. [Communication Center](#communication-center)
7. [Reports & Analytics](#reports--analytics)
8. [Tips & Best Practices](#tips--best-practices)

---

## Getting Started

### Logging In
1. Open the application in your web browser
2. Enter any username and password (demo mode)
3. Click **Sign In**
4. You'll be redirected to the Dashboard

### Navigation
- Use the **sidebar menu** on the left to navigate between sections
- Click the **School Fee Management** logo to return to the Dashboard
- Use the **Logout** button in the top-right corner to sign out

---

## Dashboard Overview

The Dashboard provides a quick overview of your school's financial status:

### Key Metrics
- **Total Students**: Shows total number of students and how many are fully paid
- **Total Collected**: Amount collected vs. expected fees
- **Outstanding Balance**: Total outstanding fees with number of students
- **School Wallet**: Current available balance

### Payment Status Section
- **Fully Paid**: Students who have completed all payments (green)
- **Partial Payment**: Students who have made some payments (yellow)
- **Pending Payment**: Students who haven't made any payments (red)

### Recent Activities
- **Recent Payments**: Last 5 payment transactions
- **Students Overview**: Summary of recently added students

---

## Managing Students

### Adding a New Student

1. Navigate to **Students** page from sidebar
2. Click **Add New Student** button (top right)
3. Fill in the following required fields:
   - **Student Name**: Full name of the student
   - **Class**: Grade or class level (e.g., Grade 10A)
   - **Parent/Guardian Name**: Full name of parent
   - **Parent Phone**: Contact number (format: +233 XX XXX XXXX)
   - **Parent Email**: Email address (optional)
   - **Total Fees**: Annual or term fees in GHS
4. Click **Add Student**

### Editing Student Information

1. Locate the student in the students list
2. Click the **Edit** button (blue pencil icon)
3. Modify the necessary information
4. Click **Update Student**

### Deleting a Student

1. Locate the student in the students list
2. Click the **Delete** button (red trash icon)
3. Confirm the deletion when prompted

⚠️ **Warning**: Deleting a student cannot be undone!

### Searching for Students

Use the search bar to find students by:
- Student name
- Class
- Parent name

The results update automatically as you type.

### Understanding Payment Status

- **Paid** (Green Badge): Student has paid all fees
- **Partial** (Yellow Badge): Student has made some payments but balance remains
- **Pending** (Red Badge): No payments received yet

---

## Processing Payments

### Recording a Payment

1. Navigate to **Payments** page
2. Click **Record Payment** button
3. Complete the payment form:

   **Select Student**
   - Choose from dropdown (shows name, class, and current balance)
   
   **Amount (GHS)**
   - Enter the payment amount
   - Must be a positive number
   
   **Payment Method**
   - Cash
   - Mobile Money (MTN, Vodafone, AirtelTigo)
   - Bank Transfer
   - Card/POS
   
   **Payment Type**
   - Tuition Fee
   - Examination Fee
   - Library Fee
   - Transport Fee
   - Other
   
   **Payment Date**
   - Defaults to today's date
   - Can be changed if recording past payments

4. Click **Record Payment**

### Receipt Generation

After recording a payment:
1. A receipt modal automatically appears
2. Review the receipt details:
   - Receipt number (unique reference)
   - Student and parent information
   - Payment amount and method
   - Updated balance information
3. Click **Print Receipt** to print
4. Click **Close** to dismiss

### Viewing Payment History

- View all payments in the payments table
- Search by student name or reference number
- Filter by payment method using the dropdown
- Click **Receipt** button to view any past receipt

### Payment Reference Numbers

Each payment generates a unique reference:
- Format: `[Method Code][Timestamp]`
- Example: `MM2025101501` (Mobile Money, Oct 15, 2025)
- Used for tracking and reconciliation

---

## Wallet Management

The School Wallet tracks all money coming in and going out of the school.

### Understanding Wallet Balance

- **Current Balance**: Total available funds
- **Total Credits**: All money received
- **Total Debits**: All money spent

### Adding Transactions

1. Navigate to **Wallet** page
2. Click **Add Transaction** button
3. Select transaction type:
   - **Credit (Money In)**: For income
   - **Debit (Money Out)**: For expenses

4. Enter amount in GHS
5. Write a clear description
6. Select date
7. Click **Add Transaction**

### Transaction Examples

**Credits (Money In)**:
- Fee payments from students
- Government grants
- Donations
- Fundraising proceeds

**Debits (Money Out)**:
- Staff salaries
- Utility bills
- School supplies
- Maintenance costs
- Transportation expenses

### Filtering Transactions

Use the filter dropdown to view:
- All Transactions
- Credits Only
- Debits Only

### Financial Summary

At the bottom of the page, view:
- **Net Cash Flow**: Total credits minus total debits
- **Total Transactions**: Number of transactions
- **Average Transaction**: Average amount per transaction

---

## Communication Center

### Sending Direct Messages

1. Navigate to **Communication** page
2. Click **Send Message** button
3. Select **Direct Message** tab
4. Choose a student from dropdown (auto-fills parent info)
5. Or manually enter:
   - Recipient name
   - Phone number
6. Enter subject
7. Type your message
8. Click **Send Message**

### Using Message Templates

1. Click **Send Message** button
2. Select **Template Message** tab
3. Choose a template from dropdown
4. Preview the template content
5. Select recipients:
   - **All Parents**: Send to everyone
   - **Parents with Pending/Partial Payments**: Target those with balances
   - **Select Specific Recipients**: Choose individual parents
6. Click **Send Template Message**

### Creating Message Templates

1. Click **New Template** button
2. Fill in template details:
   - **Template Name**: Descriptive name (e.g., "Monthly Reminder")
   - **Template Code**: Unique code (e.g., "monthly_reminder")
   - **Subject**: Message subject line
   - **Message Content**: Template body

3. Use placeholders in your message:
   - `{student_name}` - Student's name
   - `{class}` - Student's class
   - `{amount}` - Payment amount
   - `{balance}` - Outstanding balance
   - `{reference}` - Payment reference number

4. Click **Save Template**

### Template Examples

**Fee Reminder Template**:
```
Dear Parent,

This is a friendly reminder that school fees for {student_name} in {class} are due. 

Outstanding balance: GHS {balance}

Please make payment at your earliest convenience.

Thank you,
School Administration
```

**Payment Confirmation Template**:
```
Dear Parent,

We confirm receipt of GHS {amount} for {student_name}.

Reference: {reference}
Remaining balance: GHS {balance}

Thank you for your payment.

School Administration
```

### Viewing Message History

The **Message History** tab shows:
- All sent messages
- Message type (Direct or Template)
- Recipient information
- Send date and status

### Managing Recipients

The **Recipients** tab provides:
- Complete list of all parents
- Contact information
- Student payment status
- Quick send message button

---

## Reports & Analytics

### Generating Reports

1. Navigate to **Reports** page
2. Select report type from dropdown:
   - **Summary Report**: Overview statistics
   - **Detailed Report**: Complete student breakdown
   - **Payment Methods**: Analysis by payment method
   - **Outstanding Fees**: Unpaid fee listing

3. Apply filters:
   - **Start Date**: Beginning of date range
   - **End Date**: End of date range
   - **Class Filter**: Specific class or all

4. Click **Generate Report**

### Report Types Explained

#### Summary Report
- Total students and payment breakdown
- Financial statistics
- Collection rate percentage
- Payment method breakdown
- Payment type analysis

#### Detailed Report
- Complete student listing
- Fee details for each student
- Parent contact information
- Payment status
- Totals at bottom

#### Payment Methods Report
- Transaction listing by date
- Payment reference numbers
- Amount by payment method
- Useful for reconciliation

#### Outstanding Fees Report
- Students with unpaid balances
- Sorted by highest balance first
- Priority indicators (High/Medium)
- Parent contact for follow-up
- Total outstanding at bottom

### Exporting Reports

1. Generate your desired report
2. Click **Export CSV** button
3. File downloads to your computer
4. Open in Excel, Google Sheets, or similar

**CSV Filename Format**: `school-fees-report-YYYY-MM-DD.csv`

### Printing Reports

1. Generate your desired report
2. Click **Print** button
3. Review print preview
4. Adjust printer settings if needed
5. Click Print

**Print Tips**:
- Reports are optimized for A4 paper
- Use landscape orientation for wide tables
- Adjust margins for better fit

### Understanding Statistics

**Collection Rate**:
- Formula: (Total Collected ÷ Total Expected) × 100
- Example: GHS 17,500 ÷ GHS 26,500 = 66%
- Higher is better

**Payment Distribution**:
- Shows which payment methods are most popular
- Helps plan for cash vs. digital collection
- Percentage of total shown

---

## Tips & Best Practices

### Student Management
- ✅ Always verify parent phone numbers are correct
- ✅ Use consistent class naming (e.g., Grade 10A, not Gr10a)
- ✅ Add email addresses when available for better communication
- ✅ Update student information when parents change contact details

### Payment Processing
- ✅ Record payments as soon as they're received
- ✅ Always generate and save receipts
- ✅ Double-check payment amounts before recording
- ✅ Use the correct payment method for accurate reporting
- ✅ Add notes in the payment type for special cases

### Wallet Management
- ✅ Record all transactions, not just fee payments
- ✅ Write clear, descriptive transaction notes
- ✅ Regularly reconcile with bank statements
- ✅ Separate different types of expenses in descriptions
- ✅ Review financial summary monthly

### Communication
- ✅ Create templates for common messages
- ✅ Keep messages professional and friendly
- ✅ Send payment reminders before due dates, not after
- ✅ Confirm large payments with a thank you message
- ✅ Use template messages for efficiency

### Reporting
- ✅ Generate monthly reports for record keeping
- ✅ Export reports before end of term/year
- ✅ Review outstanding fees report weekly
- ✅ Share summary reports with school administration
- ✅ Use date filters for term-specific reports

### Security
- ✅ Always log out when finished
- ✅ Don't share login credentials
- ✅ Keep student information confidential
- ✅ Back up reports regularly
- ✅ Verify recipient details before sending messages

### Data Quality
- ✅ Use standard date format for consistency
- ✅ Enter amounts without currency symbols (system adds GHS)
- ✅ Use complete names, not nicknames
- ✅ Review data entry for typos before saving
- ✅ Keep parent contact information up to date

---

## Frequently Asked Questions (FAQ)

**Q: Can I edit or delete a payment?**  
A: Currently, payments cannot be edited or deleted once recorded. Ensure accuracy before submitting. For corrections, contact system administrator.

**Q: What happens if a student pays more than their balance?**  
A: The system will accept any payment amount. Consider creating an overpayment note or applying to next term's fees.

**Q: Can I import existing student data?**  
A: Currently, students must be added individually through the interface. Bulk import feature may be added in future updates.

**Q: How do I handle refunds?**  
A: Record refunds as debit transactions in the Wallet with a clear description including student name and reason.

**Q: Can I customize receipt design?**  
A: The receipt template is standardized. For custom designs, modifications require code changes.

**Q: Is the data saved permanently?**  
A: Currently, data is stored in browser memory and resets on page refresh. For permanent storage, backend integration is needed.

**Q: Can multiple users access the system simultaneously?**  
A: Yes, but each has separate data in their browser. For shared data, server-side storage is required.

**Q: How do I backup my data?**  
A: Export reports regularly to CSV. For complete data backup, backend integration is recommended.

**Q: Can I send actual SMS/emails?**  
A: The current version simulates message sending. For actual SMS/email, integration with messaging services is required.

**Q: What browsers are supported?**  
A: All modern browsers: Chrome, Firefox, Safari, Edge (latest versions).

---

## Troubleshooting

### Issue: Page won't load
- **Solution**: Clear browser cache and refresh
- Check internet connection
- Try a different browser

### Issue: Can't record payment
- **Solution**: Ensure all required fields are filled
- Check that amount is a valid number
- Verify student is selected from dropdown

### Issue: Receipt won't print
- **Solution**: Check printer connection
- Ensure pop-ups are not blocked
- Try "Save as PDF" option instead

### Issue: Data disappeared
- **Solution**: Data is currently stored in browser
- Don't clear browser data
- Export reports regularly for backup

### Issue: Search not working
- **Solution**: Type at least 2 characters
- Check spelling
- Try partial name search

---

## Support & Contact

For technical support or questions:
- Review this user guide
- Check the README.md for technical details
- Contact system administrator
- Report issues through appropriate channels

---

**Document Version**: 1.0  
**Last Updated**: November 2025  
**System Version**: 1.0.0

---

**End of User Guide**

Thank you for using the School Fee Management System! 🎓
