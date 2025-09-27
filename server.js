const express = require('express');
const app = express();
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const mongoose = require('mongoose');

// Load environment variables
dotenv.config();

// Middleware
app.use(cors());
app.use(express.json()); // For JSON bodies (e.g., login/signup)
app.use(express.urlencoded({ extended: true })); // For form-encoded data

// Serve static files from /uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// MongoDB connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/roomdekho';

mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ Connected to MongoDB');
})
.catch((err) => {
  console.error('❌ MongoDB connection failed:', err);
});

// Routes
const homeownerRoutes = require('./routes/homeOwnerRoutes');
app.use('/api/homeowner', homeownerRoutes);

// Health check
app.get('/', (req, res) => {
  res.send('✅ RoomDekho backend is running');
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT,'localhost', () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
