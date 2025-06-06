const db = require('../database/pg.database');

exports.createUser = async (userData) => {
    const { name, email, password, role, bio, disability_details } = userData;
    const res = await db.query(
        `INSERT INTO users (name, email, password, role, bio, disability_details)
         VALUES ($1, $2, $3, $4, $5, $6) 
         RETURNING user_id, name, email, role, profile_picture_url, bio, disability_details, created_at, updated_at`,
        [name, email, password, role, bio, disability_details]
    );
    return res.rows[0];
};

exports.findUserByEmail = async (email) => {
    const res = await db.query(
        `SELECT * FROM users WHERE email = $1`,
        [email]
    );
    return res.rows[0];
};

exports.findUserById = async (user_id) => {
    const res = await db.query(
        `SELECT user_id, name, email, role, profile_picture_url, bio, disability_details, created_at, updated_at 
         FROM users WHERE user_id = $1`, 
        [user_id]
    );
    return res.rows[0];
};

exports.updateUser = async (user_id, updateData) => {
    const fields = [];
    const values = [];
    let paramIndex = 1;

    Object.entries(updateData).forEach(([key, value]) => {
        if (value !== undefined) { // Ensure value is actually provided
             const validFields = ['name', 'bio', 'disability_details', 'profile_picture_url']; // Add other updatable fields here
             if(validFields.includes(key)){
                fields.push(`${key} = $${paramIndex++}`);
                values.push(value);
             }
        }
    });

    if (fields.length === 0) {
        return this.findUserById(user_id);
    }
    
    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(user_id); 

    const queryText = `
        UPDATE users
        SET ${fields.join(', ')}
        WHERE user_id = $${paramIndex}
        RETURNING user_id, name, email, role, profile_picture_url, bio, disability_details, created_at, updated_at
    `;
    
    const res = await db.query(queryText, values);
    return res.rows[0];
};

exports.updateUserProfilePicture = async (user_id, profile_picture_url) => {
    const res = await db.query(
        `UPDATE users
         SET profile_picture_url = $1, updated_at = CURRENT_TIMESTAMP
         WHERE user_id = $2
         RETURNING user_id, name, email, role, profile_picture_url, bio, disability_details, created_at, updated_at`,
        [profile_picture_url, user_id]
    );
    return res.rows[0];
};

exports.findAllUsers = async () => {
    const res = await db.query(
        `SELECT user_id, name, email, role, profile_picture_url, bio, disability_details, created_at, updated_at 
         FROM users ORDER BY created_at DESC`
    );
    return res.rows;
};