const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const mongoose = require('mongoose');

const app = express();

// Load environment variables
dotenv.config();

// ✅ CORS (only allow your Netlify frontend)
// ✅ Allow multiple origins
const allowedOrigins = [
  "https://roomdekhoo.netlify.app", // Production frontend
  "http://localhost:5173"           // Local Vite dev server
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));



// Middleware
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));

// ✅ Serve static files (for uploaded images/videos)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// MongoDB connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/roomdekho';

mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ Connected to MongoDB'))
.catch((err) => console.error('❌ MongoDB connection failed:', err));

// Routes
const homeownerRoutes = require('./routes/homeOwnerRoutes');
app.use('/api/homeowner', homeownerRoutes);

// Health check
app.get('/', (req, res) => {
  res.send('✅ RoomDekho backend is running');
});

// ✅ Vercel fix: do NOT bind to 'localhost'
const PORT = process.env.PORT || 5000;

module.exports = app;
