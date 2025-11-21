export const printReceipt = (sale: any) => {
    const receiptContent = `
        <html>
            <head>
                <title>Receipt</title>
                <style>
                    body { font-family: 'Courier New', Courier, monospace; width: 300px; margin: 0 auto; }
                    .header { text-align: center; margin-bottom: 20px; }
                    .item { display: flex; justify-content: space-between; margin-bottom: 5px; }
                    .total { border-top: 1px dashed black; margin-top: 10px; padding-top: 10px; font-weight: bold; }
                    .footer { text-align: center; margin-top: 20px; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h2>POS System</h2>
                    <p>Store #1</p>
                    <p>Date: ${new Date().toLocaleString()}</p>
                    <p>Sale ID: ${sale.id || 'Offline'}</p>
                </div>
                <div class="items">
                    ${sale.items.map((item: any) => `
                        <div class="item">
                            <span>${item.quantity}x ${item.name || 'Product ' + item.productId}</span>
                            <span>$${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                    `).join('')}
                </div>
                <div class="total">
                    <div class="item">
                        <span>Total</span>
                        <span>$${sale.items.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0).toFixed(2)}</span>
                    </div>
                    <div class="item">
                        <span>Payment Method</span>
                        <span>${sale.paymentMethod}</span>
                    </div>
                    ${sale.paymentDetails?.tendered !== undefined ? `
                    <div class="item">
                        <span>Amount Paid</span>
                        <span>$${Number(sale.paymentDetails.tendered).toFixed(2)}</span>
                    </div>
                    <div class="item">
                        <span>Change</span>
                        <span>$${Number(sale.paymentDetails.change).toFixed(2)}</span>
                    </div>
                    ` : ''}
                </div>
                <div class="footer">
                    <p>Thank you for your business!</p>
                </div>
                <script>
                    window.onload = function() { window.print(); window.close(); }
                </script>
            </body>
        </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
        printWindow.document.write(receiptContent);
        printWindow.document.close();
    }
};
