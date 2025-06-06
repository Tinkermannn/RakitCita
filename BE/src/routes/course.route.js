const express = require('express');
const router = express.Router();
const courseController = require('../controllers/course.controller');
const authenticateJWT = require('../Middleware/Auth');
const authorize = require('../Middleware/authorize');
const { upload, handleUploadError } = require('../Middleware/upload');

// Public routes
router.get('/', courseController.getAllCourses);
router.get('/:course_id', courseController.getCourseById);

// Authenticated user routes
router.post(
    '/:course_id/enroll', 
    authenticateJWT, 
    courseController.enrollInCourse
);
router.get(
    '/enrolled/me', 
    authenticateJWT, 
    courseController.getEnrolledCoursesByUser
);
router.patch( 
    '/:course_id/progress',
    authenticateJWT,
    courseController.updateCourseProgress
);

// Mentor/Admin routes for course management
router.post(
    '/', 
    authenticateJWT, 
    authorize(['admin', 'mentor']), 
    upload.single('thumbnail'), 
    handleUploadError,
    courseController.createCourse
);
router.put(
    '/:course_id', 
    authenticateJWT, 
    authorize(['admin', 'mentor']), 
    upload.single('thumbnail'),
    handleUploadError,
    courseController.updateCourse
);
router.delete(
    '/:course_id', 
    authenticateJWT, 
    authorize(['admin', 'mentor']), 
    courseController.deleteCourse
);

// Get courses by instructor (self for mentor, or any for admin)
router.get('/instructor/me', authenticateJWT, authorize(['mentor', 'admin']), courseController.getCoursesByInstructor);
router.get('/instructor/:instructor_id', authenticateJWT, authorize(['admin']), courseController.getCoursesByInstructor);


module.exports = router;