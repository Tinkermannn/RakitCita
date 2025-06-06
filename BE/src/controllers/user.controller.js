const userRepository = require('../repositories/user.repository');
const baseResponse = require('../utils/baseResponse.util');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cloudinary = require('../utils/cloudinary.config');

exports.registerUser = async (req, res, next) => {
    try {
        const { name, email, password, role, bio, disability_details } = req.body;

        if (!name || !email || !password) {
            return baseResponse(res, false, 400, "Name, email, and password are required", null);
        }
        if (password.length < 6) {
            return baseResponse(res, false, 400, "Password must be at least 6 characters long", null);
        }

        const existingUser = await userRepository.findUserByEmail(email);
        if (existingUser) {
            return baseResponse(res, false, 409, "User with this email already exists", null);
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await userRepository.createUser({
            name,
            email: email.toLowerCase(),
            password: hashedPassword,
            role: role || 'user', 
            bio,
            disability_details
        });

        const { password: _, ...userWithoutPassword } = newUser;
        return baseResponse(res, true, 201, "User registered successfully", userWithoutPassword);
    } catch (error) {
        next(error);
    }
};

exports.loginUser = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return baseResponse(res, false, 400, "Email and password are required", null);
        }

        const user = await userRepository.findUserByEmail(email.toLowerCase());
        if (!user) {
            return baseResponse(res, false, 401, "Invalid credentials", null);
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return baseResponse(res, false, 401, "Invalid credentials", null);
        }

        const token = jwt.sign(
            { user_id: user.user_id, email: user.email, role: user.role },
            process.env.JWT_SECRET_KEY,
            { expiresIn: '24h' } 
        );
        
        const { password: _, ...userWithoutPassword } = user;

        return baseResponse(res, true, 200, "Login successful", { token, user: userWithoutPassword });
    } catch (error) {
        next(error);
    }
};

exports.getUserProfile = async (req, res, next) => {
    try {
        const user = await userRepository.findUserById(req.user.user_id);
        if (!user) {
            return baseResponse(res, false, 404, "User not found", null);
        }
        const { password, ...userWithoutPassword } = user;
        return baseResponse(res, true, 200, "User profile fetched successfully", userWithoutPassword);
    } catch (error) {
        next(error);
    }
};

exports.updateUserProfile = async (req, res, next) => {
    try {
        const { user_id } = req.user; 
        const { name, bio, disability_details } = req.body;

        const updateData = {};
        if (name !== undefined) updateData.name = name;
        if (bio !== undefined) updateData.bio = bio;
        if (disability_details !== undefined) updateData.disability_details = disability_details;

        if (Object.keys(updateData).length === 0) {
            return baseResponse(res, false, 400, "No update data provided", null);
        }
        
        const updatedUser = await userRepository.updateUser(user_id, updateData);
        if (!updatedUser) {
            return baseResponse(res, false, 404, "User not found or no changes made", null);
        }
        const { password, ...userWithoutPassword } = updatedUser;
        return baseResponse(res, true, 200, "User profile updated successfully", userWithoutPassword);
    } catch (error) {
        next(error);
    }
};

exports.updateUserProfilePicture = async (req, res, next) => {
    try {
        const { user_id } = req.user;
        if (!req.file) {
            return baseResponse(res, false, 400, "No image file provided", null);
        }

        const result = await cloudinary.uploader.upload(req.file.path, {
            folder: `platform_pelatihan/profile_pictures/${user_id}`,
            transformation: [{ width: 300, height: 300, crop: "fill" }]
        });

        const updatedUser = await userRepository.updateUserProfilePicture(user_id, result.secure_url);
        if (!updatedUser) {
            return baseResponse(res, false, 404, "User not found", null);
        }
        const { password, ...userWithoutPassword } = updatedUser;
        return baseResponse(res, true, 200, "Profile picture updated successfully", userWithoutPassword);
    } catch (error) {
        console.error("Error updating profile picture:", error);
        if (error.message && error.message.includes('file too large')) {
             return baseResponse(res, false, 413, "File too large. Max 5MB allowed.", null);
        }
        next(error);
    }
};

exports.getAllUsers = async (req, res, next) => {
    try {
        const users = await userRepository.findAllUsers();
        const usersWithoutPasswords = users.map(user => {
            const { password, ...rest } = user;
            return rest;
        });
        return baseResponse(res, true, 200, "All users fetched", usersWithoutPasswords);
    } catch (error) {
        next(error);
    }
};

exports.getUserById = async (req, res, next) => {
    try {
        const user = await userRepository.findUserById(req.params.user_id);
        if (!user) {
            return baseResponse(res, false, 404, "User not found", null);
        }
        const { password, ...userWithoutPassword } = user;
        return baseResponse(res, true, 200, "User fetched successfully", userWithoutPassword);
    } catch (error) {
        next(error);
    }
};