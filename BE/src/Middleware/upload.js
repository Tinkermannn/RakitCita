const multer = require('multer');
const path = require('path');
const baseResponse = require('../utils/baseResponse.util');

// For Cloudinary, saving to disk temporarily is often easiest
// as Cloudinary SDK can then take file.path
const storage = multer.diskStorage({}); // Empty config means multer will use OS temp dir

const fileFilter = (req, file, cb) => {
    // Accept images only
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        // Use a custom error object that can be caught in the global error handler
        const err = new Error('Invalid file type. Only JPEG, PNG, GIF, WEBP images are allowed.');
        err.status = 400; // Bad Request
        cb(err, false);
    }
};

const upload = multer({
    storage: storage, 
    fileFilter: fileFilter,
    limits: {
        fileSize: 1024 * 1024 * 5 // 5MB limit
    }
});


// Custom error handler for multer errors
const handleUploadError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return baseResponse(res, false, 413, 'File too large. Maximum 5MB allowed.', null);
        }
        // Handle other multer errors
        return baseResponse(res, false, 400, err.message, null);
    } else if (err) {
        // Handle custom errors from fileFilter or other issues
        return baseResponse(res, false, err.status || 400, err.message, null);
    }
    next();
};


module.exports = {
    upload,
    handleUploadError
};