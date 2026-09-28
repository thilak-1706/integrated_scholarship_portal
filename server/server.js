const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Route Handlers
const authRoutes = require('./routes/authRoutes');
const studentRoutes = require('./routes/studentRoutes');
const instituteRoutes = require('./routes/instituteRoutes');
const departmentRoutes = require('./routes/departmentRoutes');
const adminPortalRoutes = require('./routes/adminPortalRoutes');
const seedRoutes = require('./routes/seedRoutes');

// Load environment variables
dotenv.config();

// Connect to Database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    message: 'National Scholarship System API is running smoothly',
    timestamp: new Date()
  });
});

// Mount Routes for All 4 Portals + Auth & Seeding
app.use('/api/auth', authRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/institute', instituteRoutes);
app.use('/api/department', departmentRoutes);
app.use('/api/admin', adminPortalRoutes);
app.use('/api/seed', seedRoutes);

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('Unhandled API Error:', err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(` National Scholarship API Server running on port ${PORT}`);
  console.log(` API Endpoints mounted:`);
  console.log(`   - Auth & Profile:       /api/auth`);
  console.log(`   - Student Portal:       /api/student`);
  console.log(`   - Institute Portal:     /api/institute`);
  console.log(`   - Department Portal:    /api/department`);
  console.log(`   - Admin Portal:         /api/admin`);
  console.log(`   - Seed Demo Data:       /api/seed`);
  console.log(`====================================================`);
});

module.exports = app;
