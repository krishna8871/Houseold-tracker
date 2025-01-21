// Categories for income and expense
const categories = {
    income: [
        'Salary',
        'Business Income',
        'Freelance',
        'Investments',
        'Rental Income',
        'Dividends',
        'Interest',
        'Commission',
        'Bonus',
        'Gifts',
        'Tax Refund',
        'Pension',
        'Social Security',
        'Side Projects',
        'Consulting',
        'Online Sales',
        'Royalties',
        'Other Income'
    ],
    expense: [
        'Housing & Rent',
        'Utilities',
        'Groceries',
        'Transportation',
        'Healthcare',
        'Insurance',
        'Dining Out',
        'Shopping',
        'Entertainment',
        'Education',
        'Personal Care',
        'Fitness & Sports',
        'Travel',
        'Home Maintenance',
        'Vehicle Maintenance',
        'Electronics',
        'Clothing',
        'Gifts & Donations',
        'Subscriptions',
        'Internet & Phone',
        'Pet Expenses',
        'Hobbies',
        'Debt Payment',
        'Taxes',
        'Emergency Fund',
        'Savings',
        'Investments',
        'Other Expenses'
    ]
};

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
    loadTransactions();
    updateSummary();
    populateFilters();
    setupModal();
});

// Initialize the application
function initializeApp() {
    // Set today's date as default
    document.getElementById('date').valueAsDate = new Date();
    
    // Setup type change handler
    const typeSelect = document.getElementById('type');
    typeSelect.addEventListener('change', updateCategories);
    
    // Setup filter change handlers
    document.getElementById('monthFilter').addEventListener('change', filterTransactions);
    document.getElementById('yearFilter').addEventListener('change', filterTransactions);
}

// Update categories based on selected type
function updateCategories() {
    const type = document.getElementById('type').value;
    const categorySelect = document.getElementById('category');
    categorySelect.innerHTML = '<option value="">Select Category</option>';
    
    if (type) {
        categories[type].forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            categorySelect.appendChild(option);
        });
    }
}

// Handle form submission
function handleFormSubmit(e) {
    e.preventDefault();
    
    const type = document.getElementById('type').value;
    const category = document.getElementById('category').value;
    const amount = parseFloat(document.getElementById('amount').value);
    const date = document.getElementById('date').value;
    const description = document.getElementById('description').value;
    
    const transaction = {
        id: Date.now(),
        type,
        category,
        amount,
        date,
        description
    };
    
    // Save transaction
    const transactions = getTransactions();
    transactions.push(transaction);
    localStorage.setItem('transactions', JSON.stringify(transactions));
    
    // Update UI
    loadTransactions();
    updateSummary();
    populateFilters();
    
    // Reset form
    e.target.reset();
    document.getElementById('date').valueAsDate = new Date();
}

// Get transactions from localStorage
function getTransactions() {
    return JSON.parse(localStorage.getItem('transactions') || '[]');
}

// Load and display transactions
function loadTransactions() {
    const transactions = getTransactions();
    const transactionList = document.getElementById('transactionList');
    transactionList.innerHTML = '';
    
    const monthFilter = document.getElementById('monthFilter').value;
    const yearFilter = document.getElementById('yearFilter').value;
    
    const filteredTransactions = transactions.filter(transaction => {
        const date = new Date(transaction.date);
        const month = (date.getMonth() + 1).toString();
        const year = date.getFullYear().toString();
        
        return (!monthFilter || month === monthFilter) && 
               (!yearFilter || year === yearFilter);
    });
    
    filteredTransactions.sort((a, b) => new Date(b.date) - new Date(a.date))
        .forEach(transaction => {
            const div = document.createElement('div');
            div.className = 'transaction-item';
            
            div.innerHTML = `
                <div class="details">
                    <div class="category">${transaction.category}</div>
                    <div class="description">${transaction.description || ''}</div>
                    <div class="date">${formatDate(transaction.date)}</div>
                </div>
                <div class="amount ${transaction.type}">
                    ${transaction.type === 'income' ? '+' : '-'}₹${transaction.amount.toFixed(2)}
                </div>
                <button class="delete-btn" onclick="deleteTransaction(${transaction.id})">
                    <span class="delete-icon">×</span>
                </button>
            `;
            
            transactionList.appendChild(div);
        });
}

// Update summary (total income, expenses, and balance)
function updateSummary() {
    const transactions = getTransactions();
    
    const totals = transactions.reduce((acc, transaction) => {
        if (transaction.type === 'income') {
            acc.income += transaction.amount;
        } else {
            acc.expense += transaction.amount;
        }
        return acc;
    }, { income: 0, expense: 0 });
    
    const balance = totals.income - totals.expense;
    
    document.getElementById('totalIncome').textContent = `₹${totals.income.toFixed(2)}`;
    document.getElementById('totalExpense').textContent = `₹${totals.expense.toFixed(2)}`;
    
    const balanceElement = document.getElementById('balance');
    balanceElement.textContent = `₹${balance.toFixed(2)}`;
    balanceElement.style.color = balance >= 0 ? '#2ecc71' : '#e74c3c';
}

// Populate filter dropdowns
function populateFilters() {
    const transactions = getTransactions();
    const months = new Set();
    const years = new Set();
    
    transactions.forEach(transaction => {
        const date = new Date(transaction.date);
        months.add(date.getMonth() + 1);
        years.add(date.getFullYear());
    });
    
    // Populate month filter
    const monthFilter = document.getElementById('monthFilter');
    monthFilter.innerHTML = '<option value="">All Months</option>';
    Array.from(months).sort((a, b) => a - b).forEach(month => {
        const option = document.createElement('option');
        option.value = month.toString();
        option.textContent = new Date(2000, month - 1, 1).toLocaleString('default', { month: 'long' });
        monthFilter.appendChild(option);
    });
    
    // Populate year filter
    const yearFilter = document.getElementById('yearFilter');
    yearFilter.innerHTML = '<option value="">All Years</option>';
    Array.from(years).sort((a, b) => b - a).forEach(year => {
        const option = document.createElement('option');
        option.value = year.toString();
        option.textContent = year;
        yearFilter.appendChild(option);
    });
}

// Filter transactions
function filterTransactions() {
    loadTransactions();
}

// Delete a transaction
function deleteTransaction(id) {
    if (confirm('Are you sure you want to delete this transaction?')) {
        const transactions = getTransactions();
        const updatedTransactions = transactions.filter(t => t.id !== id);
        localStorage.setItem('transactions', JSON.stringify(updatedTransactions));
        loadTransactions();
        updateSummary();
    }
}

// Setup modal functionality
function setupModal() {
    const modal = document.getElementById('transactionModal');
    const fab = document.getElementById('addTransactionBtn');
    const closeBtn = document.querySelector('.close-modal');

    // Open modal
    fab.addEventListener('click', () => {
        modal.classList.add('show');
        document.getElementById('date').valueAsDate = new Date();
    });

    // Close modal when clicking the close button
    closeBtn.addEventListener('click', () => {
        modal.classList.remove('show');
    });

    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('show');
        }
    });

    // Handle form submission
    document.getElementById('transactionForm').addEventListener('submit', (e) => {
        e.preventDefault();
        handleFormSubmit(e);
        modal.classList.remove('show');
    });
}

// Format date for display
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}
