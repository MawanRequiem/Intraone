const express = require('express');
const admin = require('firebase-admin');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();
const path = require('path');
const db = require('./config/firebaseConfig');

const pelangganRoutes = require('./routes/pelangganRoutes');
const transaksiRoutes = require('./routes/transaksiRoutes');
const tempRoutes = require('./routes/tempTransaksiRoutes');

app.use(express.static(path.join(__dirname, '..')));
app.use(express.static(path.join(__dirname, '..', 'view')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'view', 'index.html'));
});

// Allow CORS (supaya frontend bisa call API)
app.use(cors());
app.use(bodyParser.json());


app.use('/api/pelanggan', pelangganRoutes);
app.use('/api/transaksi', transaksiRoutes);
app.use('/api/tempTransaksi', tempRoutes);

// Simple GET: Fetch data
app.get('/api/jawa', async (req, res) => {
  const ref = db.ref();
  ref.once('value', (snapshot) => {
    res.json(snapshot.val());
  });
});

// Simple POST: Add new item
app.post('/api/jawa', async (req, res) => {
  const ref = db.ref('items');
  const newItem = req.body;
  await ref.push(newItem);
  res.json({ message: "Item added successfully!" });
});

// Listen
const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

app.get('/api/now', (req, res) => {
  res.json({ now: new Date().toISOString() });
});