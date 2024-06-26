const express = require('express');
const app = express();
const db = require('./db');

// Middleware
app.use(express.json({ extended: false }));

// Routes
app.use('/api/users', require('./routes/userRoutes'));
// Add admin routes similarly

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));