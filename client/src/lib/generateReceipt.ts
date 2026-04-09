interface OrderItem {
  id?: string;
  name: string;
  quantity: number;
  price?: number;
}

interface OrderData {
  id: string;
  name: string;
  phone?: string;
  table?: string;
  items: OrderItem[];
  total: number;
  createdAt?: string;
  status?: string;
}

export function generateOrderReceipt(order: OrderData, restaurantName = "Cafe") {
  const now = order.createdAt
    ? new Date(order.createdAt).toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : new Date().toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });

  const itemsHtml = order.items
    .map((item) => {
      const lineTotal = item.price ? item.price * item.quantity : null;
      return `
        <tr>
          <td style="padding:8px 4px; border-bottom:1px solid #f0e8da; color:#2d2417;">${item.name}</td>
          <td style="padding:8px 4px; border-bottom:1px solid #f0e8da; text-align:center; color:#2d2417;">${item.quantity}</td>
          <td style="padding:8px 4px; border-bottom:1px solid #f0e8da; text-align:right; color:#2d2417;">
            ${item.price != null ? `₹${item.price.toFixed(2)}` : "—"}
          </td>
          <td style="padding:8px 4px; border-bottom:1px solid #f0e8da; text-align:right; font-weight:600; color:#2d2417;">
            ${lineTotal != null ? `₹${lineTotal.toFixed(2)}` : "—"}
          </td>
        </tr>
      `;
    })
    .join("");

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Receipt – Order #${order.id.slice(-6).toUpperCase()}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Helvetica Neue', Arial, sans-serif;
      background: #fff;
      color: #2d2417;
      padding: 40px;
      max-width: 480px;
      margin: 0 auto;
    }
    .header {
      text-align: center;
      margin-bottom: 28px;
      padding-bottom: 20px;
      border-bottom: 2px solid #c5a55a;
    }
    .brand {
      font-size: 28px;
      font-style: italic;
      font-weight: 800;
      color: #c5a55a;
      letter-spacing: -0.5px;
      margin-bottom: 4px;
    }
    .tagline {
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 3px;
      color: #8a7353;
    }
    .receipt-title {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 3px;
      margin-top: 12px;
      color: #8a7353;
    }
    .section {
      margin-bottom: 20px;
    }
    .section-label {
      font-size: 9px;
      text-transform: uppercase;
      letter-spacing: 2.5px;
      color: #c5a55a;
      font-weight: 700;
      margin-bottom: 8px;
      padding-bottom: 4px;
      border-bottom: 1px solid #f0e8da;
    }
    .info-row {
      display: flex;
      justify-content: space-between;
      font-size: 13px;
      padding: 3px 0;
    }
    .info-label { color: #8a7353; }
    .info-value { font-weight: 600; color: #2d2417; }
    .order-id {
      display: inline-block;
      background: #fdf6ec;
      border: 1px solid #f0e8da;
      border-radius: 6px;
      padding: 2px 8px;
      font-family: monospace;
      font-size: 13px;
      font-weight: 700;
      color: #c5a55a;
      letter-spacing: 1px;
    }
    table { width: 100%; border-collapse: collapse; font-size: 13px; }
    thead tr th {
      font-size: 9px;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      color: #8a7353;
      padding: 6px 4px;
      border-bottom: 2px solid #c5a55a;
      font-weight: 700;
    }
    thead tr th:nth-child(2),
    thead tr th:nth-child(3),
    thead tr th:nth-child(4) { text-align: right; }
    thead tr th:nth-child(2) { text-align: center; }
    .total-section {
      margin-top: 16px;
      padding-top: 14px;
      border-top: 2px solid #c5a55a;
    }
    .total-row {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
    }
    .total-label {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 2px;
      color: #8a7353;
      font-weight: 700;
    }
    .total-amount {
      font-size: 24px;
      font-weight: 800;
      color: #c5a55a;
      font-style: italic;
    }
    .footer {
      margin-top: 32px;
      text-align: center;
      font-size: 10px;
      color: #b8a07a;
      padding-top: 16px;
      border-top: 1px dashed #f0e8da;
    }
    .status-badge {
      display: inline-block;
      padding: 2px 10px;
      border-radius: 20px;
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 1px;
      font-weight: 700;
      background: #fdf6ec;
      color: #c5a55a;
      border: 1px solid #f0e8da;
    }
    @media print {
      body { padding: 20px; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="brand">${restaurantName}</div>
    <div class="tagline">Fine Dining Experience</div>
    <div class="receipt-title">Order Receipt</div>
  </div>

  <!-- Order Identification -->
  <div class="section">
    <div class="section-label">Order Reference</div>
    <div class="info-row">
      <span class="info-label">Order ID</span>
      <span class="order-id">#${order.id.slice(-6).toUpperCase()}</span>
    </div>
    <div class="info-row">
      <span class="info-label">Date & Time</span>
      <span class="info-value">${now}</span>
    </div>
    <div class="info-row">
      <span class="info-label">Status</span>
      <span class="status-badge">${order.status || "Received"}</span>
    </div>
  </div>

  <!-- Table Info -->
  <div class="section">
    <div class="section-label">Table Details</div>
    <div class="info-row">
      <span class="info-label">Table Number</span>
      <span class="info-value">${order.table || "—"}</span>
    </div>
  </div>

  <!-- Customer Info -->
  <div class="section">
    <div class="section-label">Guest Details</div>
    <div class="info-row">
      <span class="info-label">Name</span>
      <span class="info-value">${order.name || "Guest"}</span>
    </div>
    ${order.phone ? `
    <div class="info-row">
      <span class="info-label">Contact</span>
      <span class="info-value">${order.phone}</span>
    </div>` : ""}
  </div>

  <!-- Order Items -->
  <div class="section">
    <div class="section-label">Order Details</div>
    <table>
      <thead>
        <tr>
          <th style="text-align:left;">Item</th>
          <th>Qty</th>
          <th style="text-align:right;">Unit</th>
          <th style="text-align:right;">Amount</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml}
      </tbody>
    </table>
  </div>

  <!-- Billing Total -->
  <div class="total-section">
    <div class="total-row">
      <span class="total-label">Total Amount</span>
      <span class="total-amount">₹${order.total.toFixed(2)}</span>
    </div>
  </div>

  <!-- Footer -->
  <div class="footer">
    <p>Thank you for dining with us.</p>
    <p style="margin-top:6px;">We hope to see you again soon!</p>
    <p style="margin-top:12px; font-size:9px; letter-spacing:1px; text-transform:uppercase;">
      This is a computer generated receipt · No signature required
    </p>
  </div>

  <script>
    window.onload = () => { window.print(); };
  </script>
</body>
</html>
  `;

  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const win = window.open(url, "_blank");
  if (win) {
    win.onafterprint = () => URL.revokeObjectURL(url);
  }
}
