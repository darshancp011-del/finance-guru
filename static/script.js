// Dashboard JavaScript

document.addEventListener('DOMContentLoaded', () => {
    // Only run on dashboard pages that have the bar chart element
    if (document.getElementById('barChart')) {
        fetchDashboardData();
    }
});

// Mobile More Menu toggle
function toggleMobileMenu() {
    const menu = document.getElementById('mobileMoreMenu');
    if (menu.style.display === 'none' || menu.style.display === '') {
        menu.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    } else {
        menu.style.display = 'none';
        document.body.style.overflow = '';
    }
}

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

    // Update goals section if data exists
    if (data.goals) {
        updateGoalsSection(data.goals);
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

function updateGoalsSection(goals) {
    const container = document.getElementById('goals-list-container');
    if (!container) return;

    if (goals && goals.length > 0) {
        container.innerHTML = goals.map(goal => {
            return `
                <div style="margin-bottom: 1rem; background: rgba(255,255,255,0.03); padding: 0.75rem; border-radius: 10px;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                        <span style="font-weight: 500;">${goal.name}</span>
                        <span style="font-size: 0.85rem; color: var(--text-muted);">
                            ₹${goal.current_amount.toLocaleString()} / ₹${goal.target_amount.toLocaleString()}
                        </span>
                    </div>
                    <div style="width: 100%; height: 6px; background: rgba(255,255,255,0.1); border-radius: 3px; overflow: hidden;">
                        <div style="width: ${Math.min(goal.percentage, 100)}%; height: 100%; background: var(--success); border-radius: 3px; transition: width 0.5s ease;"></div>
                    </div>
                </div>
            `;
        }).join('');
    } else {
        container.innerHTML = `
            <div style="text-align: center; color: var(--text-muted); padding: 1rem; font-size: 0.9rem;">
                <i class="fas fa-bullseye" style="font-size: 2rem; opacity: 0.3; display: block; margin-bottom: 0.5rem;"></i>
                No active goals
            </div>
        `;
    }
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
    // Monthly Bar Chart – Income & Expense over time (First Chart)
    if (Array.isArray(data.monthly) && data.monthly.length > 0) {
        const ctxMonthly = document.getElementById('barChart').getContext('2d');
        const months = data.monthly.map(m => {
            const [year, month] = m.month.split('-');
            return new Date(year, month - 1).toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });
        }).reverse();
        const incomeVals = data.monthly.map(m => parseFloat(m.income)).reverse();
        const expenseVals = data.monthly.map(m => parseFloat(m.expense)).reverse();

        new Chart(ctxMonthly, {
            type: 'bar',
            data: {
                labels: months,
                datasets: [
                    {
                        label: 'Income',
                        data: incomeVals,
                        backgroundColor: 'rgba(16, 185, 129, 0.8)',
                        borderColor: 'rgba(16, 185, 129, 1)',
                        borderWidth: 0,
                        borderRadius: 6,
                        borderSkipped: false,
                        barThickness: 40,
                    },
                    {
                        label: 'Expense',
                        data: expenseVals,
                        backgroundColor: 'rgba(239, 68, 68, 0.8)',
                        borderColor: 'rgba(239, 68, 68, 1)',
                        borderWidth: 0,
                        borderRadius: 6,
                        borderSkipped: false,
                        barThickness: 40,
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            usePointStyle: true,
                            pointStyle: 'circle',
                            padding: 20,
                            font: { size: 12, weight: '500' }
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(15, 23, 42, 0.9)',
                        titleFont: { size: 14, weight: '600' },
                        bodyFont: { size: 13 },
                        padding: 12,
                        cornerRadius: 8,
                        callbacks: {
                            label: function (context) {
                                return context.dataset.label + ': ₹' + context.raw.toLocaleString('en-IN');
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: { color: 'rgba(255, 255, 255, 0.06)', drawBorder: false },
                        ticks: {
                            callback: function (value) {
                                if (value >= 1000) return '₹' + (value / 1000) + 'k';
                                return '₹' + value;
                            },
                            font: { size: 11 }
                        }
                    },
                    x: {
                        grid: { display: false },
                        ticks: { font: { size: 11 } }
                    }
                },
                barPercentage: 0.9,
                categoryPercentage: 0.5
            }
        });
    }

    // Pie Chart – Income vs Expenses by Category
    const ctxPie = document.getElementById('pieChart').getContext('2d');
    const categories = data.categories || [];
    categories.sort((a, b) => b.total - a.total);
    const topCategories = categories.slice(0, 5);

    // Add Income to the pie chart
    const pieLabels = ['Income', ...topCategories.map(c => c.category)];
    const pieValues = [data.income, ...topCategories.map(c => c.total)];

    const gradientColors = [
        '#10B981', '#EF4444', '#F59E0B', '#3B82F6', '#EC4899', '#8B5CF6', '#06B6D4'
    ];

    new Chart(ctxPie, {
        type: 'doughnut',
        data: {
            labels: pieLabels,
            datasets: [{
                data: pieValues,
                backgroundColor: gradientColors.slice(0, pieLabels.length),
                borderWidth: 0,
                hoverOffset: 8,
                spacing: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '60%',
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        usePointStyle: true,
                        pointStyle: 'circle',
                        padding: 15,
                        font: { size: 11, weight: '500' }
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(15, 23, 42, 0.9)',
                    titleFont: { size: 14, weight: '600' },
                    bodyFont: { size: 13 },
                    padding: 12,
                    cornerRadius: 8,
                    callbacks: {
                        label: function (context) {
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((context.raw / total) * 100).toFixed(1);
                            return context.label + ': ₹' + context.raw.toLocaleString('en-IN') + ' (' + percentage + '%)';
                        }
                    }
                }
            }
        }
    });

    // Monthly Bar Chart – Income, Expense, Savings comparison
    if (Array.isArray(data.monthly) && data.monthly.length > 0) {
        const ctxLine = document.getElementById('monthlyChart').getContext('2d');
        const months = data.monthly.map(m => {
            const [year, month] = m.month.split('-');
            return new Date(year, month - 1).toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });
        }).reverse();
        const incomeVals = data.monthly.map(m => parseFloat(m.income)).reverse();
        const expenseVals = data.monthly.map(m => parseFloat(m.expense)).reverse();
        const savingsVals = incomeVals.map((inc, i) => inc - expenseVals[i]);

        new Chart(ctxLine, {
            type: 'bar',
            data: {
                labels: months,
                datasets: [
                    {
                        label: 'Income',
                        data: incomeVals,
                        backgroundColor: 'rgba(16, 185, 129, 0.85)',
                        borderColor: '#10B981',
                        borderWidth: 0,
                        borderRadius: 6,
                        borderSkipped: false,
                        barThickness: 40
                    },
                    {
                        label: 'Expense',
                        data: expenseVals,
                        backgroundColor: 'rgba(239, 68, 68, 0.85)',
                        borderColor: '#EF4444',
                        borderWidth: 0,
                        borderRadius: 6,
                        borderSkipped: false,
                        barThickness: 40
                    },
                    {
                        label: 'Savings',
                        data: savingsVals,
                        backgroundColor: 'rgba(114, 105, 227, 0.85)',
                        borderColor: '#7269E3',
                        borderWidth: 0,
                        borderRadius: 6,
                        borderSkipped: false,
                        barThickness: 40
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                        align: 'center',
                        labels: {
                            usePointStyle: true,
                            pointStyle: 'circle',
                            padding: 15,
                            font: { size: 11, weight: '500' }
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(15, 23, 42, 0.9)',
                        titleFont: { size: 14, weight: '600' },
                        bodyFont: { size: 13 },
                        padding: 12,
                        cornerRadius: 8,
                        callbacks: {
                            label: function (context) {
                                return context.dataset.label + ': ₹' + context.raw.toLocaleString('en-IN');
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: { color: 'rgba(255, 255, 255, 0.06)', drawBorder: false },
                        ticks: {
                            callback: function (value) {
                                if (value >= 1000) return '₹' + (value / 1000) + 'k';
                                if (value <= -1000) return '-₹' + Math.abs(value / 1000) + 'k';
                                return '₹' + value;
                            },
                            font: { size: 11 }
                        }
                    },
                    x: {
                        grid: { display: false },
                        ticks: { font: { size: 11 } }
                    }
                },
                barPercentage: 0.9,
                categoryPercentage: 0.5
            }
        });
    }
}
