const cloudinary = require('cloudinary').v2;
require('dotenv').config();

if (!process.env.CLOUDINARY_URL) {
    console.warn("CLOUDINARY_URL is not set. File uploads will likely fail.");
} else {
    try {
        cloudinary.config({
            cloudinary_url: process.env.CLOUDINARY_URL
        });
        console.log("Cloudinary configured successfully.");
    } catch (error) {
        console.error("Error configuring Cloudinary:", error);
    }
}


module.exports = cloudinary;