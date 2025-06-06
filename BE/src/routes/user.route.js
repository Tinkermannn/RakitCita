const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const authenticateJWT = require('../Middleware/auth');
const authorize = require('../Middleware/authorize');
const { upload, handleUploadError } = require('../Middleware/upload');

router.post('/register', userController.registerUser);
router.post('/login', userController.loginUser);

router.get('/profile', authenticateJWT, userController.getUserProfile);
router.put('/profile', authenticateJWT, userController.updateUserProfile);
router.patch( 
    '/profile/picture', 
    authenticateJWT, 
    upload.single('profilePicture'), 
    handleUploadError, // Add multer error handler
    userController.updateUserProfilePicture
);

// Admin-only route to get all users
router.get('/', authenticateJWT, authorize(['admin']), userController.getAllUsers);
// Public route to get a specific user's public profile (or admin can get any)
router.get('/:user_id', userController.getUserById); // No auth needed for public view, or add admin auth for more details


module.exports = router;