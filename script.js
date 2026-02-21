document.addEventListener('DOMContentLoaded', () => {
    const addInvoiceForm = document.getElementById('addInvoiceForm');
    const invoiceTableBody = document.getElementById('invoiceTableBody');
    const totalReceivableElement = document.getElementById('totalReceivable');
    const totalCollectedElement = document.getElementById('totalCollected');
    const totalOverdueElement = document.getElementById('totalOverdue');
    const filterStatusElement = document.getElementById('filterStatus');
    const filterDateElement = document.getElementById('filterDate');
    const applyFiltersButton = document.getElementById('applyFilters');
    const clearFiltersButton = document.getElementById('clearFilters');

    let invoices = JSON.parse(localStorage.getItem('invoices')) || [];

    // Helper function to save invoices to localStorage
    const saveInvoices = () => {
        localStorage.setItem('invoices', JSON.stringify(invoices));
    };

    // Helper function to render invoices to the table
    const renderInvoices = (filteredInvoices = invoices) => {
        invoiceTableBody.innerHTML = ''; // Clear existing rows
        
        const now = new Date();

        filteredInvoices.forEach(invoice => {
            // Determine if an invoice is overdue
            const dueDate = new Date(invoice.dueDate);
            let displayStatus = invoice.status;
            if (invoice.status === 'Bekliyor' && dueDate < now) {
                displayStatus = 'Gecikti';
            }

            const row = invoiceTableBody.insertRow();
            row.innerHTML = `
                <td data-label="Müşteri Adı">${invoice.customerName}</td>
                <td data-label="Tutar">${invoice.amount.toFixed(2)} TL</td>
                <td data-label="Son Ödeme Tarihi">${invoice.dueDate}</td>
                <td data-label="Durum"><span class="status-badge status-${displayStatus}">${displayStatus}</span></td>
                <td class="actions" data-label="İşlemler">
                    ${displayStatus === 'Bekliyor' ? `<button class="mark-paid" data-id="${invoice.id}">Ödendi Olarak İşaretle</button>` : ''}
                    ${displayStatus === 'Bekliyor' ? `<button class="mark-overdue" data-id="${invoice.id}">Gecikti Olarak İşaretle</button>` : ''}
                    <button class="delete" data-id="${invoice.id}">Sil</button>
                </td>
            `;
        });
    };

    // Helper function to calculate and update summary cards
    const updateSummaryCards = () => {
        let totalReceivable = 0;
        let totalCollected = 0;
        let totalOverdue = 0;
        const now = new Date();

        invoices.forEach(invoice => {
            totalReceivable += invoice.amount;
            if (invoice.status === 'Ödendi') {
                totalCollected += invoice.amount;
            } else {
                const dueDate = new Date(invoice.dueDate);
                if (dueDate < now) {
                    totalOverdue += invoice.amount;
                }
            }
        });

        totalReceivableElement.textContent = `${totalReceivable.toFixed(2)} TL`;
        totalCollectedElement.textContent = `${totalCollected.toFixed(2)} TL`;
        totalOverdueElement.textContent = `${totalOverdue.toFixed(2)} TL`;
    };

    // Add new invoice
    addInvoiceForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const customerName = document.getElementById('customerName').value;
        const amount = parseFloat(document.getElementById('amount').value);
        const dueDate = document.getElementById('dueDate').value;
        const status = document.getElementById('status').value;

        const newInvoice = {
            id: Date.now(), // Simple unique ID
            customerName,
            amount,
            dueDate,
            status
        };

        invoices.push(newInvoice);
        saveInvoices();
        renderInvoices();
        updateSummaryCards();
        addInvoiceForm.reset(); // Clear form fields
    });

    // Handle actions (mark paid, mark overdue, delete)
    invoiceTableBody.addEventListener('click', (e) => {
        const target = e.target;
        if (target.tagName === 'BUTTON') {
            const invoiceId = parseInt(target.dataset.id);
            
            if (target.classList.contains('mark-paid')) {
                const invoiceIndex = invoices.findIndex(inv => inv.id === invoiceId);
                if (invoiceIndex !== -1) {
                    invoices[invoiceIndex].status = 'Ödendi';
                    saveInvoices();
                    renderInvoices();
                    updateSummaryCards();
                }
            } else if (target.classList.contains('mark-overdue')) {
                // For simplicity, we'll directly set to 'Gecikti'.
                // In a real app, 'Gecikti' is derived from 'Bekliyor' + past due date.
                // Here we allow manual override for demonstration.
                const invoiceIndex = invoices.findIndex(inv => inv.id === invoiceId);
                if (invoiceIndex !== -1) {
                    invoices[invoiceIndex].status = 'Gecikti'; // Manual override for demo
                    saveInvoices();
                    renderInvoices();
                    updateSummaryCards();
                }
            } else if (target.classList.contains('delete')) {
                invoices = invoices.filter(inv => inv.id !== invoiceId);
                saveInvoices();
                renderInvoices();
                updateSummaryCards();
            }
        }
    });

    // Filter invoices
    applyFiltersButton.addEventListener('click', () => {
        const filterStatus = filterStatusElement.value;
        const filterDate = filterDateElement.value;

        let filtered = invoices;

        if (filterStatus !== 'Tümü') {
            filtered = filtered.filter(invoice => {
                const now = new Date();
                const dueDate = new Date(invoice.dueDate);
                let currentStatus = invoice.status;
                if (invoice.status === 'Bekliyor' && dueDate < now) {
                    currentStatus = 'Gecikti';
                }
                return currentStatus === filterStatus;
            });
        }

        if (filterDate) {
            filtered = filtered.filter(invoice => invoice.dueDate === filterDate);
        }

        renderInvoices(filtered);
    });

    // Clear filters
    clearFiltersButton.addEventListener('click', () => {
        filterStatusElement.value = 'Tümü';
        filterDateElement.value = '';
        renderInvoices();
    });

    // Initial render and summary update
    renderInvoices();
    updateSummaryCards();
});
