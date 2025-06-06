const express = require('express');
const router = express.Router();
const recommendationController = require('../controllers/recommendation.controller');
const authenticateJWT = require('../Middleware/auth'); // Pastikan user terautentikasi

// Endpoint untuk mendapatkan rekomendasi AI
// Membutuhkan user untuk login agar bisa mengakses bio dan disability_details mereka
router.post('/', authenticateJWT, recommendationController.getAIRecommendations);

module.exports = router;