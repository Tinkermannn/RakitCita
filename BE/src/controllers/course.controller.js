const courseRepository = require('../repositories/course.repository');
const baseResponse = require('../utils/baseResponse.util');
const cloudinary = require('../utils/cloudinary.config');

exports.createCourse = async (req, res, next) => {
    try {
        const { title, description, category, level } = req.body;
        const instructor_id = req.user.user_id; 

        if (!title || !description) {
            return baseResponse(res, false, 400, "Title and description are required", null);
        }
        
        let thumbnailUrl = null;
        if (req.file) {
            const result = await cloudinary.uploader.upload(req.file.path, {
                folder: `platform_pelatihan/course_thumbnails`,
                transformation: [{ width: 600, height: 400, crop: "limit" }]
            });
            thumbnailUrl = result.secure_url;
        }

        const course = await courseRepository.createCourse({ 
            title, description, instructor_id, category, level, thumbnail_url: thumbnailUrl 
        });
        return baseResponse(res, true, 201, "Course created successfully", course);
    } catch (error) {
        next(error);
    }
};

exports.getAllCourses = async (req, res, next) => {
    try {
        const { category, level, search, page = 1, limit = 10 } = req.query;
        const filters = { category, level, search };
        const pagination = { page: parseInt(page), limit: parseInt(limit) };
        
        const result = await courseRepository.findAllCourses(filters, pagination);
        return baseResponse(res, true, 200, "Courses fetched successfully", result);
    } catch (error) {
        next(error);
    }
};

exports.getCourseById = async (req, res, next) => {
    try {
        const course = await courseRepository.findCourseById(req.params.course_id);
        if (course) {
            return baseResponse(res, true, 200, "Course found", course);
        } else {
            return baseResponse(res, false, 404, "Course not found", null);
        }
    } catch (error) {
        next(error);
    }
};

exports.updateCourse = async (req, res, next) => {
    try {
        const { course_id } = req.params;
        const { title, description, category, level } = req.body;
        const instructor_id = req.user.user_id; 

        const updateData = {};
        if (title !== undefined) updateData.title = title;
        if (description !== undefined) updateData.description = description;
        if (category !== undefined) updateData.category = category;
        if (level !== undefined) updateData.level = level;

        if (req.file) {
            const result = await cloudinary.uploader.upload(req.file.path, {
                folder: `platform_pelatihan/course_thumbnails`,
                transformation: [{ width: 600, height: 400, crop: "limit" }]
            });
            updateData.thumbnail_url = result.secure_url;
        }
        
        if (Object.keys(updateData).length === 0 && !req.file) {
            return baseResponse(res, false, 400, "No update data provided", null);
        }

        const course = await courseRepository.updateCourse(course_id, instructor_id, req.user.role, updateData);
        if (course) {
            return baseResponse(res, true, 200, "Course updated successfully", course);
        } else {
            return baseResponse(res, false, 404, "Course not found or not authorized to update", null);
        }
    } catch (error) {
        next(error);
    }
};

exports.deleteCourse = async (req, res, next) => {
    try {
        const { course_id } = req.params;
        const user_id = req.user.user_id;
        
        const course = await courseRepository.deleteCourse(course_id, user_id, req.user.role);
        if (course) {
            return baseResponse(res, true, 200, "Course deleted successfully", course);
        } else {
            return baseResponse(res, false, 404, "Course not found or not authorized to delete", null);
        }
    } catch (error) {
        next(error);
    }
};

exports.enrollInCourse = async (req, res, next) => {
    try {
        const { course_id } = req.params;
        const user_id = req.user.user_id;

        const enrollment = await courseRepository.enrollUserInCourse(user_id, course_id);
        if (enrollment.isNew) {
            return baseResponse(res, true, 201, "Successfully enrolled in course", enrollment.data);
        } else {
            return baseResponse(res, true, 200, "Already enrolled in this course", enrollment.data);
        }
    } catch (error) {
        if (error.message && error.message.includes("violates foreign key constraint")) {
             return baseResponse(res, false, 404, "Course not found.", null);
        }
        if (error.message && error.message.includes("duplicate key value violates unique constraint")) { // Should be caught by repo logic
            return baseResponse(res, false, 409, "Already enrolled in this course.", null);
        }
        next(error);
    }
};

exports.getEnrolledCoursesByUser = async (req, res, next) => {
    try {
        const user_id = req.user.user_id; 
        const { page = 1, limit = 10 } = req.query;
        const pagination = { page: parseInt(page), limit: parseInt(limit) };
        const result = await courseRepository.findEnrolledCoursesByUserId(user_id, pagination);
        return baseResponse(res, true, 200, "Enrolled courses fetched successfully", result);
    } catch (error) {
        next(error);
    }
};

exports.updateCourseProgress = async (req, res, next) => {
    try {
        const { course_id } = req.params;
        const user_id = req.user.user_id;
        const { progress } = req.body; 

        if (progress === undefined) {
             return baseResponse(res, false, 400, "Progress value is required.", null);
        }
        if (typeof progress !== 'number' || progress < 0 || progress > 100) {
            return baseResponse(res, false, 400, "Progress must be a number between 0 and 100.", null);
        }
        
        const completed_at = progress === 100 ? new Date() : null;

        const enrollment = await courseRepository.updateUserCourseProgress(user_id, course_id, progress, completed_at);
        if (enrollment) {
            return baseResponse(res, true, 200, "Course progress updated successfully", enrollment);
        } else {
            return baseResponse(res, false, 404, "Enrollment not found or update failed.", null);
        }
    } catch (error) {
        next(error);
    }
};

exports.getCoursesByInstructor = async (req, res, next) => {
    try {
        const instructor_id = req.params.instructor_id || req.user.user_id; // Allow fetching for self or specific instructor by admin
        // Add authorization if req.params.instructor_id is used by non-admin
        if(req.params.instructor_id && req.user.user_id !== req.params.instructor_id && req.user.role !== 'admin'){
            return baseResponse(res, false, 403, "Forbidden. You can only view your own created courses.", null);
        }

        const { page = 1, limit = 10 } = req.query;
        const pagination = { page: parseInt(page), limit: parseInt(limit) };
        
        const result = await courseRepository.findCoursesByInstructorId(instructor_id, pagination);
        return baseResponse(res, true, 200, "Courses by instructor fetched successfully", result);
    } catch (error) {
        next(error);
    }
};