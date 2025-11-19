import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { useState } from "react";

// --- Components ---
function ItemModal({ item, onClose }) {
  if (!item) return null;

  const variations = ["Small", "Medium", "Large"];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-md">
        <h2 className="text-xl font-bold mb-2">{item.name}</h2>
        <p className="mb-4">Price: Rs {item.price}</p>

        <label className="block mb-2 font-semibold">Select Size</label>
        <select className="w-full p-2 border rounded-xl mb-4">
          {variations.map((v) => (
            <option key={v}>{v}</option>
          ))}
        </select>

        <label className="block mb-2 font-semibold">Quantity</label>
        <input type="number" min="1" defaultValue="1" className="w-full p-2 border rounded-xl mb-4" />

        <button className="w-full p-2 bg-black text-white rounded-xl mb-2">Add to Cart</button>
        <button className="w-full p-2 bg-gray-300 rounded-xl" onClick={onClose}>Close</button>
      </div>
    </div>
  );
}

// --- Pages ---
function Home() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Welcome to Our HomeChef Restaurant</h1>
      <p className="text-base">Delicious homemade meals prepared fresh every day.</p>
    </div>
  );
}

function Menu() {
  const categories = ["Breakfast", "Lunch", "Dinner", "Desserts", "Drinks"]; 
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Menu Categories</h1>
      <ul className="grid grid-cols-2 gap-4">
        {categories.map((cat) => (
          <li key={cat}>
            <Link className="block p-4 rounded-2xl shadow hover:shadow-lg" to={`/menu/${cat.toLowerCase()}`}>{cat}</Link>
          </li>
        ))}
      </ul>

      {selectedItem && (
        <ItemModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
        />
      )}
    </div>
  );
}

function CategoryPage({ category }) {
  const [selectedItem, setSelectedItem] = useState(null);({ category }) {
  const items = [
    { name: "Sample Dish 1", price: 500 },
    { name: "Sample Dish 2", price: 750 },
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">{category} Menu</h1>
      <ul className="space-y-3">
        {items.map((item) => (
          <li key={item.name} onClick={() => setSelectedItem(item)} className="p-4 border rounded-xl shadow">
            <p className="font-semibold">{item.name}</p>
            <p>Price: Rs {item.price}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Checkout() {
  const paymentMethods = ["JazzCash", "EasyPaisa", "Bank Transfer", "Cash on Delivery"];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Checkout</h1>
      <p className="mt-2">Review your order and proceed to payment.</p>

      <h2 className="text-xl font-semibold mt-6 mb-2">Select Payment Method</h2>
      <ul className="space-y-3">
        {paymentMethods.map((method) => (
          <li key={method} className="p-4 border rounded-xl shadow bg-white flex items-center justify-between">
            <span>{method}</span>
            <button className="px-4 py-2 bg-black text-white rounded-xl" onClick={() => window.location.href='/order-confirmation'}>
              Pay
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Checkout</h1>
      <p className="mt-2">Review your order and proceed to payment.</p>
    </div>
  );
}

function OnlineOrder() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Order Online</h1>
      <p className="mt-2">Place your online order easily.</p>
    </div>
  );
}

function Signup() {
  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Sign Up</h1>
      <form className="space-y-4">
        <input className="w-full p-2 border rounded-xl" placeholder="Name" />
        <input className="w-full p-2 border rounded-xl" placeholder="Email" />
        <input className="w-full p-2 border rounded-xl" placeholder="Password" type="password" />
        <button className="w-full p-2 bg-black text-white rounded-xl">Create Account</button>
      </form>
    </div>
  );
}

function Login() {
  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Login</h1>
      <form className="space-y-4">
        <input className="w-full p-2 border rounded-xl" placeholder="Email" />
        <input className="w-full p-2 border rounded-xl" placeholder="Password" type="password" />
        <button className="w-full p-2 bg-black text-white rounded-xl">Login</button>
      </form>
    </div>
  );
}

function OrderConfirmation() {
  return (
    <div className="p-6 text-center">
      <h1 className="text-3xl font-bold mb-4">Order Confirmed!</h1>
      <p className="text-base mb-6">Thank you for your order. Your payment has been received.</p>
      <p className="text-sm text-gray-600">You will receive an SMS/Email shortly with your order details.</p>
    </div>
  );
}

// --- Advanced Components & Utilities ---

// Simple in-memory cart & user store (replace with real backend later)
const CartContext = React.createContext();

function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [user, setUser] = useState(null); // {name, email, discountPercent}

  function addToCart(item, variation, qty) {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id && i.variation === variation);
      if (existing) {
        return prev.map((p) => p.id === item.id && p.variation === variation ? { ...p, qty: p.qty + qty } : p);
      }
      return [...prev, { id: item.id, name: item.name, price: item.price, variation, qty }];
    });
  }

  function updateQty(id, variation, qty) {
    setCart((prev) => prev.map((p) => p.id === id && p.variation === variation ? { ...p, qty } : p));
  }

  function removeItem(id, variation) {
    setCart((prev) => prev.filter((p) => !(p.id === id && p.variation === variation)));
  }

  function clearCart() { setCart([]); }

  function loginMock(name, email) {
    // give registered users a discount (example: 10%)
    setUser({ name, email, discountPercent: 10 });
  }

  function logout() { setUser(null); }

  return (
    <CartContext.Provider value={{ cart, addToCart, updateQty, removeItem, clearCart, user, loginMock, logout }}>
      {children}
    </CartContext.Provider>
  );
}

// Cart UI
function CartPage() {
  const ctx = React.useContext(CartContext);
  const subtotal = ctx.cart.reduce((s, i) => s + i.price * i.qty, 0);
  const discount = ctx.user ? (subtotal * (ctx.user.discountPercent/100)) : 0;
  const total = subtotal - discount;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Your Cart</h1>
      {ctx.cart.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <div>
          <ul className="space-y-3 mb-4">
            {ctx.cart.map((it) => (
              <li key={it.id + it.variation} className="p-4 border rounded-xl flex justify-between items-center">
                <div>
                  <div className="font-semibold">{it.name} <span className="text-sm text-gray-500">({it.variation})</span></div>
                  <div className="text-sm">Rs {it.price} x {it.qty}</div>
                </div>
                <div className="flex items-center gap-2">
                  <input type="number" min="1" value={it.qty} onChange={(e) => ctx.updateQty(it.id, it.variation, Number(e.target.value))} className="w-20 p-2 border rounded" />
                  <button onClick={() => ctx.removeItem(it.id, it.variation)} className="px-3 py-1 bg-gray-200 rounded">Remove</button>
                </div>
              </li>
            ))}
          </ul>

          <div className="p-4 border rounded mb-4">
            <div className="flex justify-between"><span>Subtotal</span><strong>Rs {subtotal}</strong></div>
            <div className="flex justify-between"><span>Discount</span><strong>Rs {Math.round(discount)}</strong></div>
            <div className="flex justify-between mt-2 text-lg"><span>Total</span><strong>Rs {Math.round(total)}</strong></div>
          </div>

          <div className="flex gap-3">
            <Link to="/checkout" className="px-4 py-2 bg-black text-white rounded-xl">Proceed to Checkout</Link>
            <button onClick={() => ctx.clearCart()} className="px-4 py-2 bg-gray-200 rounded-xl">Clear Cart</button>
          </div>
        </div>
      )}
    </div>
  );
}

// Item modal updated to call addToCart and include variation + qty selection + OTP simulation placeholder
function ItemModal({ item, onClose }) {
  if (!item) return null;

  const variations = ["Small", "Medium", "Large"];
  const [variation, setVariation] = useState(variations[0]);
  const [qty, setQty] = useState(1);
  const ctx = React.useContext(CartContext);

  function handleAdd() {
    ctx.addToCart({ id: item.name + item.price, name: item.name, price: item.price }, variation, Number(qty));
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-md">
        <h2 className="text-xl font-bold mb-2">{item.name}</h2>
        <p className="mb-4">Price: Rs {item.price}</p>

        <label className="block mb-2 font-semibold">Select Size</label>
        <select value={variation} onChange={(e) => setVariation(e.target.value)} className="w-full p-2 border rounded-xl mb-4">
          {variations.map((v) => (
            <option key={v}>{v}</option>
          ))}
        </select>

        <label className="block mb-2 font-semibold">Quantity</label>
        <input type="number" min="1" value={qty} onChange={(e) => setQty(e.target.value)} className="w-full p-2 border rounded-xl mb-4" />

        <button onClick={handleAdd} className="w-full p-2 bg-black text-white rounded-xl mb-2">Add to Cart</button>
        <button className="w-full p-2 bg-gray-300 rounded-xl" onClick={onClose}>Close</button>
      </div>
    </div>
  );
}

// Checkout: combination flow with redirect, in-app entry, QR placeholder, OTP simulation
function Checkout() {
  const ctx = React.useContext(CartContext);
  const paymentMethods = ["JazzCash", "EasyPaisa", "Bank Transfer", "Cash on Delivery"];
  const [method, setMethod] = useState(paymentMethods[0]);
  const subtotal = ctx.cart.reduce((s, i) => s + i.price * i.qty, 0);
  const discount = ctx.user ? (subtotal * (ctx.user.discountPercent/100)) : 0;
  const total = subtotal - discount;

  const [phone, setPhone] = useState("");
  const [showOtp, setShowOtp] = useState(false);
  const [otp, setOtp] = useState("");
  const [fakeOtp, setFakeOtp] = useState(1234); // simple simulation

  function startPayment() {
    if (method === "JazzCash" || method === "EasyPaisa") {
      // offer both: redirect (simulate) or in-app
      if (phone.length < 9) {
        alert('Enter valid phone number for mobile wallets');
        return;
      }
      // simulate sending OTP
      setShowOtp(true);
      // in real implementation: call JazzCash/EasyPaisa SDKs or server endpoints
    } else if (method === "Bank Transfer") {
      // show bank details and mark as pending
      window.location.href = '/order-confirmation?status=pending&method=bank';
    } else {
      // Cash on Delivery
      window.location.href = '/order-confirmation?status=cod&method=cod';
    }
  }

  function verifyOtp() {
    if (Number(otp) === fakeOtp) {
      // payment success simulation
      // generate a pseudo order id and redirect to receipt
      const orderId = 'ORD' + Date.now();
      // In real flow: create order in backend, call payment gateway, verify signature
      window.location.href = `/receipt?orderId=${orderId}`;
    } else {
      alert('Incorrect OTP. Try 1234 in this demo.');
    }
  }

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold">Checkout</h1>
      <div className="mt-4 p-4 border rounded">
        <div className="flex justify-between"><span>Subtotal</span><span>Rs {subtotal}</span></div>
        <div className="flex justify-between"><span>Discount</span><span>Rs {Math.round(discount)}</span></div>
        <div className="flex justify-between font-semibold mt-2"><span>Total</span><span>Rs {Math.round(total)}</span></div>
      </div>

      <div className="mt-6">
        <label className="block font-semibold mb-2">Payment Method</label>
        <select value={method} onChange={(e) => setMethod(e.target.value)} className="w-full p-2 border rounded mb-4">
          {paymentMethods.map((m) => <option key={m}>{m}</option>)}
        </select>

        {(method === 'JazzCash' || method === 'EasyPaisa') && (
          <div className="mb-4">
            <label className="block mb-2">Mobile Number (used for wallet)</label>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="03XXXXXXXXX" className="w-full p-2 border rounded" />
          </div>
        )}

        {showOtp ? (
          <div>
            <p>Enter OTP (demo: 1234)</p>
            <input value={otp} onChange={(e) => setOtp(e.target.value)} className="w-full p-2 border rounded mb-2" />
            <div className="flex gap-2">
              <button onClick={verifyOtp} className="px-4 py-2 bg-black text-white rounded">Verify OTP</button>
              <button onClick={() => setShowOtp(false)} className="px-4 py-2 bg-gray-200 rounded">Cancel</button>
            </div>
          </div>
        ) : (
          <div className="flex gap-3 mt-4">
            <button onClick={startPayment} className="px-4 py-2 bg-black text-white rounded">Pay Now</button>
            <Link to="/cart" className="px-4 py-2 bg-gray-200 rounded">Back to Cart</Link>
          </div>
        )}

        <div className="mt-6 text-sm text-gray-600">
          <p>Payment Options: You can be redirected to the gateway (simulated), enter wallet details in-app (OTP simulated), or follow bank transfer instructions. This demo does not perform real payments — integrate gateway SDKs/server endpoints for production.</p>
        </div>
      </div>
    </div>
  );
}

// Receipt page with PDF download (browser-based simple text file as demo)
function Receipt() {
  const query = new URLSearchParams(window.location.search);
  const orderId = query.get('orderId') || 'ORD-DEMO-1234';
  const ctx = React.useContext(CartContext);
  const subtotal = ctx.cart.reduce((s, i) => s + i.price * i.qty, 0);
  const discount = ctx.user ? (subtotal * (ctx.user.discountPercent/100)) : 0;
  const total = subtotal - discount;

  function downloadReceipt() {
    const receiptText = `Order: ${orderId}
Name: ${ctx.user?.name || 'Guest'}
Total: Rs ${Math.round(total)}
Items:
${ctx.cart.map(i=> `- ${i.name} (${i.variation}) x${i.qty} = Rs ${i.price*i.qty}`).join('
')}`;
    const blob = new Blob([receiptText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${orderId}-receipt.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Receipt</h1>
      <p className="mb-2">Order ID: <strong>{orderId}</strong></p>
      <div className="p-4 border rounded mb-4">
        <div className="mb-2">Customer: {ctx.user?.name || 'Guest'}</div>
        <div className="mb-2">Items:</div>
        <ul className="list-disc ml-6 mb-2">
          {ctx.cart.map((i) => <li key={i.id + i.variation}>{i.name} ({i.variation}) x{i.qty} — Rs {i.price * i.qty}</li>)}
        </ul>
        <div className="flex justify-between"><span>Subtotal</span><span>Rs {subtotal}</span></div>
        <div className="flex justify-between"><span>Discount</span><span>Rs {Math.round(discount)}</span></div>
        <div className="flex justify-between font-semibold mt-2"><span>Total</span><span>Rs {Math.round(total)}</span></div>
      </div>

      <div className="flex gap-3">
        <button onClick={downloadReceipt} className="px-4 py-2 bg-black text-white rounded">Download Receipt</button>
        <Link to="/" className="px-4 py-2 bg-gray-200 rounded">Back to Home</Link>
      </div>
    </div>
  );
}

// Customer Dashboard
function Dashboard() {
  const ctx = React.useContext(CartContext);
  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Customer Dashboard</h1>
      {ctx.user ? (
        <div>
          <div className="mb-2">Name: {ctx.user.name}</div>
          <div className="mb-2">Email: {ctx.user.email}</div>
          <div className="mb-2">Discount: {ctx.user.discountPercent}%</div>
          <div className="mt-4">
            <h2 className="font-semibold mb-2">Recent Orders (demo)</h2>
            <p className="text-sm text-gray-600">No real orders in demo mode. Integrate backend to fetch order history.</p>
          </div>
        </div>
      ) : (
        <div>
          <p>You are not logged in.</p>
          <Link to="/signup" className="px-4 py-2 bg-black text-white rounded mt-2 inline-block">Sign Up</Link>
        </div>
      )}
    </div>
  );
}

// --- Main App ---
export default function App() {
  const [category, setCategory] = useState(null);

  return (
    <Router>
      <nav className="p-4 shadow flex gap-6 bg-white">
        <Link to="/">Home</Link>
        <Link to="/menu">Menu</Link>
        <Link to="/order-online">Order Online</Link>
        <Link to="/checkout">Checkout</Link>
        <Link to="/signup">Sign Up</Link>
        <Link to="/login">Login</Link>
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/menu" element={<Menu />} />
        <Route
          path="/menu/:category"
          element={<CategoryWrapper />}
        />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/order-online" element={<OnlineOrder />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/order-confirmation" element={<OrderConfirmation />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/receipt" element={<Receipt />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  );
}

function CategoryWrapper() {
  const category = window.location.pathname.split("/").pop();
  const formatted = category.charAt(0).toUpperCase() + category.slice(1);
  return <CategoryPage category={formatted} />;
}


// --- Admin Page ---
function Admin() {
  const ctx = React.useContext(CartContext);

  // demo admin: view orders (in-memory demo only)
  const [orders, setOrders] = useState([]);

  // In production: fetch /api/admin/orders
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
      <p className="mb-4 text-sm text-gray-600">Demo admin page — connect to backend to view real orders.</p>

      <div className="mb-4">
        <h2 className="font-semibold mb-2">Quick Actions</h2>
        <div className="flex gap-2">
          <button className="px-3 py-1 bg-green-600 text-white rounded">Refresh Orders (demo)</button>
          <button className="px-3 py-1 bg-red-600 text-white rounded">Clear Demo Orders</button>
        </div>
      </div>

      <div>
        <h2 className="font-semibold mb-2">Recent Orders (demo)</h2>
        <div className="space-y-3">
          {orders.length === 0 ? (
            <div className="p-4 border rounded text-sm text-gray-600">No orders yet (demo). Connect to the server endpoints to populate real orders.</div>
          ) : orders.map(o => (
            <div key={o.id} className="p-3 border rounded">
              <div className="flex justify-between">
                <div>Order <strong>{o.id}</strong></div>
                <div>{o.status}</div>
              </div>
              <div className="text-sm">Total: Rs {o.total}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// --- Wiring admin route ---
// (this was added to the router earlier)
// <Route path="/admin" element={<Admin />} />

// --- End of frontend additions ---

/* ----------------------------------------------------------
  Server scaffold (Node + Express)
  Files (create a new folder `server/` with these files):

  server/
  ├─ package.json
  ├─ index.js            (main Express app)
  ├─ routes/orders.js    (orders & receipt endpoints)
  ├─ routes/payments.js  (payment callback endpoints)
  └─ utils/pdf.js        (PDF receipt generator using PDFKit)

  Install: npm init -y && npm i express body-parser cors pdfkit uuid
-----------------------------------------------------------*/

// server/index.js
/*
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const ordersRouter = require('./routes/orders');
const paymentsRouter = require('./routes/payments');

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.use('/api/orders', ordersRouter);
app.use('/api/payments', paymentsRouter);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log('Server running on', PORT));
*/

// server/routes/orders.js
/*
const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { generatePdfBuffer } = require('../utils/pdf');

// In-memory store (replace with DB in production)
const ORDERS = {};

// Create order
router.post('/', async (req, res) => {
  const { items, total, customer } = req.body;
  const id = 'ORD-' + Date.now();
  ORDERS[id] = { id, items, total, customer, status: 'pending', createdAt: new Date() };
  res.json({ ok: true, orderId: id });
});

// Get order
router.get('/:id', (req, res) => {
  const order = ORDERS[req.params.id];
  if (!order) return res.status(404).json({ error: 'Not found' });
  res.json(order);
});

// Get PDF receipt
router.get('/:id/pdf', async (req, res) => {
  const order = ORDERS[req.params.id];
  if (!order) return res.status(404).json({ error: 'Not found' });

  const buffer = await generatePdfBuffer(order);
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=${order.id}-receipt.pdf`);
  res.send(buffer);
});

module.exports = router;
*/

// server/routes/payments.js
/*
const express = require('express');
const router = express.Router();

// JazzCash callback (POST)
router.post('/jazzcash/callback', (req, res) => {
  // validate signature/integrity with your merchant secret
  // update order status in DB using order id from payload
  console.log('JazzCash callback received', req.body);
  // respond according to JazzCash requirements
  res.json({ status: 'received' });
});

// EasyPaisa callback (POST)
router.post('/easypaisa/callback', (req, res) => {
  console.log('EasyPaisa callback received', req.body);
  // validate and update order
  res.json({ status: 'received' });
});

module.exports = router;
*/

// server/utils/pdf.js
/*
const PDFDocument = require('pdfkit');

function generatePdfBuffer(order) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 40 });
    const buffers = [];
    doc.on('data', (d) => buffers.push(d));
    doc.on('end', () => resolve(Buffer.concat(buffers)));

    // Header
    doc.fontSize(20).text('Fatima\'s Kitchen', { align: 'center' });
    doc.moveDown();

    doc.fontSize(12).text(`Order ID: ${order.id}`);
    doc.text(`Date: ${order.createdAt}`);
    doc.moveDown();

    doc.text('Items:');
    order.items.forEach(i => {
      doc.text(`${i.name} (${i.variation}) x${i.qty} - Rs ${i.price * i.qty}`);
    });

    doc.moveDown();
    doc.fontSize(14).text(`Total: Rs ${order.total}`, { align: 'right' });

    doc.end();
  });
}

module.exports = { generatePdfBuffer };
*/

/* -----------------------------------------------------------
  JazzCash & EasyPaisa integration notes (implementation outline)

  Sources & documentation:
  - JazzCash Sandbox & API docs (merchant sandbox, hosted checkout, mobile SDK). See JazzCash sandbox docs for API reference and callback requirements. citeturn0search2turn0search11
  - JazzCash Payment Gateway Integration Guide (detailed PDF for merchants). citeturn0search9
  - EasyPaisa merchant integration portal and guides (request merchant access to get API docs). citeturn0search1turn0search17

  Implementation checklist (server-side):
  1. Register as a merchant with JazzCash & EasyPaisa and get sandbox credentials (merchant id, password, integrity salt, return URLs).
  2. Implement server-side endpoint to create a payment request (signed payload) and either:
     - Redirect the customer to the hosted payment page (HTTP POST) or
     - Call the provider's API to create a transaction and show an in-app flow.
  3. Implement callback endpoints (webhooks) that the gateway will call after payment—validate signature using your secret and update order status.
  4. For mobile-wallet style payments (JazzCash wallet / EasyPaisa), you usually need to collect the phone number and initiate a charge or provide instructions; follow each provider's docs for required fields.
  5. Test thoroughly in the sandbox environment before switching to live credentials.

  Examples & community packages exist (unofficial). Use official docs where possible. For JazzCash, the sandbox docs and API references are the canonical source. For EasyPaisa, request merchant integration docs from their business portal. citeturn0search2turn0search11turn0search17
------------------------------------------------------------*/

/* ------------------------------------------------------------
  Frontend: calling server endpoints (example flow)

  1) When user clicks Pay Now:
     - Call POST /api/orders to create order (server returns orderId)
     - Server responds with payment payload or url (if hosted checkout)
     - If hosted checkout: redirect user (window.location = url) or post form
     - If in-app wallet: show phone input -> server triggers wallet charge -> wait for callback
  2) Payment gateway calls /api/payments/{provider}/callback -> server validates and updates order
  3) Server redirects or notifies frontend; frontend polls /api/orders/:id or navigates to /receipt

  Security note: Never place gateway secrets in frontend code. Keep signing keys / credentials on server side only.
------------------------------------------------------------*/

/* ------------------------------------------------------------
  UI polish & production build notes

  - Use Tailwind CSS (already in code). Add breakpoints to make pages responsive (use grid, flex, and max-w classes).
  - Replace placeholder images with real photos. Put images in /public/images and reference with <img src="/images/your.jpg" />.
  - Add a `logo.svg` in /public and import into header.
  - Use font from Google Fonts (e.g., Inter) by adding link in index.html.
  - Accessibility: add aria labels on modals and ensure focus trap for ItemModal.

  Build:
  - Frontend (React CRA or Vite): npm run build
  - Serve with a static server or integrate into Express (serve build folder)

  Example commands:
  - Frontend: npm install && npm run build
  - Server: cd server && npm install && node index.js
  - To serve frontend from Express: app.use(express.static(path.join(__dirname, 'client', 'build')))

  Deploy: use services like Vercel/Netlify for frontend and Railway/Render/Heroku for Express, or host both on a VPS.
------------------------------------------------------------*/
