const express = require("express");
require("dotenv").config();
const app = express();
const PORT = process.env.PORT || 3000;

const cors = require('cors');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const xss = require('xss-clean');

// General rate limiter
app.use(rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, 
    message: {
        success: false,
        message: "Too many requests from this IP, please try again after 15 minutes.",
        payload: null
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
}));

app.use(cors({
    origin: ['https://os.netlabdte.com', 'http://localhost:5173', 'https://tutam-9-sbd-fe.vercel.app', 'http://192.168.1.73:5173', 'http://localhost:3000'], // Sesuaikan dengan origin frontend Anda
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
  
app.use(helmet());
app.use(express.json()); 
app.use(express.urlencoded({ extended: true}));
app.use(xss());  

// Routers
const userRouter = require('./src/routes/user.route');
const courseRouter = require('./src/routes/course.route');
const communityRouter = require('./src/routes/community.route');
const recommendationRouter = require('./src/routes/recommendation.route');

app.use('/api/v1/users', userRouter);
app.use('/api/v1/courses', courseRouter);
app.use('/api/v1/communities', communityRouter);
app.use('/api/v1/recommendations', recommendationRouter); // <--- BARU


// Basic health check route
app.get('/api/v1/health', (req, res) => {
    res.status(200).json({ success: true, message: 'API is healthy and running!' });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error("Global Error Handler Catch:", err.stack);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || "Internal server error",
        payload: null
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on ${PORT}`);
});