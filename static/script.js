// Dashboard JavaScript

document.addEventListener('DOMContentLoaded', () => {
    // Only run on dashboard pages that have the bar chart element
    if (document.getElementById('barChart')) {
        fetchDashboardData();
    }
});

function fetchDashboardData() {
    fetch('/api/dashboard_data')
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                console.error('Error fetching data:', data.error);
                return;
            }
            updateDashboardUI(data);
        })
        .catch(error => console.error('Error:', error));
}

function updateDashboardUI(data) {
    // Update display values
    document.getElementById('total-income').textContent = formatCurrency(data.income);
    document.getElementById('total-expense').textContent = formatCurrency(data.expense);
    document.getElementById('total-balance').textContent = formatCurrency(data.balance);

    // Render all charts
    renderCharts(data);
    
    // Update bills section if data exists
    if (data.bills) {
        updateBillsSection(data.bills);
    }

    // Populate recent transactions table
    const tbody = document.getElementById('transactions-body');
    tbody.innerHTML = '';
    if (!data.transactions || data.transactions.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; color: var(--text-muted);">No transactions found</td></tr>';
        return;
    }
    data.transactions.forEach(tx => {
        const dateObj = new Date(tx.date);
        const dateStr = dateObj.toLocaleDateString();
        const amountClass = tx.type === 'income' ? 'income-text' : 'expense-text';
        const sign = tx.type === 'income' ? '+' : '-';
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td style="display: flex; align-items: center; gap: 0.5rem;">
                <div style="width: 8px; height: 8px; border-radius: 50%; background: ${tx.type === 'income' ? 'var(--success)' : 'var(--danger)'}"></div>
                ${tx.description || 'No Description'}
            </td>
            <td><span class="badge ${tx.type === 'income' ? 'badge-income' : 'badge-expense'}">${tx.category}</span></td>
            <td>${dateStr}</td>
            <td class="${amountClass}" style="font-weight: 600;">${sign} ${formatCurrency(tx.amount).replace('$', '')}</td>
        `;
        tbody.appendChild(tr);
    });
}

function updateBillsSection(bills) {
    // Update stats
    const overdueEl = document.getElementById('overdue-bills');
    const dueSoonEl = document.getElementById('due-soon-bills');
    const pendingAmountEl = document.getElementById('pending-amount');
    const billsListEl = document.getElementById('upcoming-bills-list');
    
    if (overdueEl) overdueEl.textContent = bills.overdue_count || 0;
    if (dueSoonEl) dueSoonEl.textContent = bills.due_soon_count || 0;
    if (pendingAmountEl) pendingAmountEl.textContent = formatCurrency(bills.pending_amount || 0);
    
    // Update upcoming bills list
    if (billsListEl) {
        if (bills.upcoming && bills.upcoming.length > 0) {
            billsListEl.innerHTML = bills.upcoming.map(bill => {
                const dueDate = new Date(bill.due_date);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const diffDays = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
                
                let statusColor = '#3498db'; // default blue
                let statusText = '';
                if (diffDays < 0) {
                    statusColor = '#e74c3c';
                    statusText = `<span style="color: #e74c3c; font-size: 0.7rem;">${Math.abs(diffDays)} days overdue</span>`;
                } else if (diffDays === 0) {
                    statusColor = '#f39c12';
                    statusText = `<span style="color: #f39c12; font-size: 0.7rem;">Due today!</span>`;
                } else if (diffDays <= 3) {
                    statusColor = '#f39c12';
                    statusText = `<span style="color: #f39c12; font-size: 0.7rem;">${diffDays} days left</span>`;
                }
                
                return `
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.75rem; margin-bottom: 0.5rem; background: rgba(255,255,255,0.03); border-radius: 8px; border-left: 3px solid ${statusColor};">
                        <div>
                            <div style="font-weight: 500; font-size: 0.9rem;">${bill.name}</div>
                            <div style="font-size: 0.75rem; color: var(--text-muted);">
                                ${bill.category} • ${dueDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                ${statusText}
                            </div>
                        </div>
                        <div style="font-weight: 600; color: ${statusColor};">₹${parseFloat(bill.amount).toFixed(0)}</div>
                    </div>
                `;
            }).join('');
        } else {
            billsListEl.innerHTML = `
                <div style="text-align: center; color: var(--text-muted); padding: 1rem; font-size: 0.9rem;">
                    <i class="fas fa-check-circle" style="font-size: 2rem; opacity: 0.3; display: block; margin-bottom: 0.5rem;"></i>
                    No pending bills
                </div>
            `;
        }
    }
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
}

// Global Chart configuration
Chart.defaults.color = '#94A3B8';
Chart.defaults.font.family = 'Outfit';

function renderCharts(data) {
    // Bar Chart – Income vs Expense vs Pending Bills
    const ctxBar = document.getElementById('barChart').getContext('2d');
    const pendingBills = data.bills ? data.bills.pending_amount : 0;
    new Chart(ctxBar, {
        type: 'bar',
        data: {
            labels: ['Income', 'Expense', 'Pending Bills'],
            datasets: [{
                label: 'Amount (INR)',
                data: [data.income, data.expense, pendingBills],
                backgroundColor: ['rgba(16, 185, 129, 0.7)', 'rgba(239, 68, 68, 0.7)', 'rgba(243, 156, 18, 0.7)'],
                borderColor: ['rgba(16, 185, 129, 1)', 'rgba(239, 68, 68, 1)', 'rgba(243, 156, 18, 1)'],
                borderWidth: 1,
                borderRadius: 8,
                barThickness: 50
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: { beginAtZero: true, grid: { color: 'rgba(255, 255, 255, 0.05)' } },
                x: { grid: { display: false } }
            }
        }
    });

    // Pie Chart – Top Expenses
    const ctxPie = document.getElementById('pieChart').getContext('2d');
    const categories = data.categories || [];
    categories.sort((a, b) => b.total - a.total);
    const pieLabels = categories.map(c => c.category);
    const pieValues = categories.map(c => c.total);
    new Chart(ctxPie, {
        type: 'doughnut',
        data: {
            labels: pieLabels,
            datasets: [{
                data: pieValues,
                backgroundColor: ['#7269E3', '#24A19C', '#FF5A5F', '#F59E0B', '#6366F1', '#EC4899'],
                borderWidth: 0,
                hoverOffset: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '70%',
            plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, padding: 15 } } }
        }
    });

    // Monthly Bar Chart – Income & Expense over time
    if (Array.isArray(data.monthly) && data.monthly.length > 0) {
        const ctxMonthly = document.getElementById('monthlyChart').getContext('2d');
        const months = data.monthly.map(m => m.month).reverse();
        const incomeVals = data.monthly.map(m => parseFloat(m.income)).reverse();
        const expenseVals = data.monthly.map(m => parseFloat(m.expense)).reverse();
        new Chart(ctxMonthly, {
            type: 'bar',
            data: {
                labels: months,
                datasets: [
                    { label: 'Income', data: incomeVals, backgroundColor: 'rgba(16, 185, 129, 0.7)', borderColor: 'rgba(16, 185, 129, 1)', borderWidth: 1 },
                    { label: 'Expense', data: expenseVals, backgroundColor: 'rgba(239, 68, 68, 0.7)', borderColor: 'rgba(239, 68, 68, 1)', borderWidth: 1 }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: { y: { beginAtZero: true, grid: { color: 'rgba(255, 255, 255, 0.05)' } }, x: { grid: { display: false } } },
                plugins: { legend: { position: 'top' } }
            }
        });
    }
}
