const express = require('express');
const app = express();
const db = require('./db');
const dotenv = require(`dotenv`);

dotenv.config({ path: './.env' });

// Middleware
app.use(express.json({ extended: false }));

// Routes
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));