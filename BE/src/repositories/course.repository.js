const db = require('../database/pg.database');

exports.createCourse = async (courseData) => {
    const { title, description, instructor_id, category, level, thumbnail_url } = courseData;
    const res = await db.query(
        `INSERT INTO courses (title, description, instructor_id, category, level, thumbnail_url)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [title, description, instructor_id, category, level, thumbnail_url]
    );
    return res.rows[0];
};

exports.findAllCourses = async (filters = {}, pagination = { page: 1, limit: 10 }) => {
    let queryText = `
        SELECT c.*, u.name as instructor_name, u.profile_picture_url as instructor_profile_picture 
        FROM courses c
        LEFT JOIN users u ON c.instructor_id = u.user_id
    `;
    const queryParams = [];
    const conditions = [];
    let paramIndex = 1;

    if (filters.category) {
        conditions.push(`c.category ILIKE $${paramIndex++}`);
        queryParams.push(`%${filters.category}%`);
    }
    if (filters.level) {
        conditions.push(`c.level = $${paramIndex++}`);
        queryParams.push(filters.level);
    }
    if (filters.search) {
        conditions.push(`(c.title ILIKE $${paramIndex++} OR c.description ILIKE $${paramIndex})`); // same param index for OR
        queryParams.push(`%${filters.search}%`);
    }

    if (conditions.length > 0) {
        queryText += ' WHERE ' + conditions.join(' AND ');
    }
    queryText += ' ORDER BY c.created_at DESC';

    const totalCountQuery = `SELECT COUNT(*) FROM (${queryText.replace('SELECT c.*, u.name as instructor_name, u.profile_picture_url as instructor_profile_picture', 'SELECT 1')}) AS courses_count`;
    const totalResult = await db.query(totalCountQuery, queryParams);
    const totalItems = parseInt(totalResult.rows[0].count);

    const offset = (pagination.page - 1) * pagination.limit;
    queryText += ` LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
    queryParams.push(pagination.limit);
    queryParams.push(offset);
    
    const res = await db.query(queryText, queryParams);
    return {
        data: res.rows,
        page: pagination.page,
        limit: pagination.limit,
        totalPages: Math.ceil(totalItems / pagination.limit),
        totalItems: totalItems
    };
};

exports.findCourseById = async (course_id) => {
    const res = await db.query(
        `SELECT c.*, u.name as instructor_name, u.profile_picture_url as instructor_profile_picture, u.bio as instructor_bio 
         FROM courses c
         LEFT JOIN users u ON c.instructor_id = u.user_id
         WHERE c.course_id = $1`,
        [course_id]
    );
    return res.rows[0];
};

exports.updateCourse = async (course_id, user_id, user_role, updateData) => {
    const course = await this.findCourseById(course_id);
    if (!course) return null;

    if (course.instructor_id !== user_id && user_role !== 'admin') {
        return null; // Not authorized
    }

    const fields = [];
    const values = [];
    let paramIndex = 1;

    Object.entries(updateData).forEach(([key, value]) => {
         const validFields = ['title', 'description', 'category', 'level', 'thumbnail_url'];
         if(validFields.includes(key)){
            fields.push(`${key} = $${paramIndex++}`);
            values.push(value);
         }
    });
    
    if (fields.length === 0) return course;

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(course_id);

    const queryText = `
        UPDATE courses
        SET ${fields.join(', ')}
        WHERE course_id = $${paramIndex}
        RETURNING *
    `;
    const result = await db.query(queryText, values);
    return result.rows[0];
};

exports.deleteCourse = async (course_id, user_id, user_role) => {
    const course = await this.findCourseById(course_id);
    if (!course) return null;

    if (course.instructor_id !== user_id && user_role !== 'admin') {
        return null; // Not authorized
    }
    const res = await db.query(
        `DELETE FROM courses WHERE course_id = $1 RETURNING *`,
        [course_id]
    );
    return res.rows[0];
};

exports.enrollUserInCourse = async (user_id, course_id) => {
    let enrollment = await db.query(
        `SELECT * FROM user_courses WHERE user_id = $1 AND course_id = $2`,
        [user_id, course_id]
    );

    if (enrollment.rows[0]) {
        return { data: enrollment.rows[0], isNew: false };
    }

    const res = await db.query(
        `INSERT INTO user_courses (user_id, course_id) VALUES ($1, $2) RETURNING *`,
        [user_id, course_id]
    );
    return { data: res.rows[0], isNew: true };
};

exports.findEnrolledCoursesByUserId = async (user_id, pagination = { page: 1, limit: 10 }) => {
    const baseQuery = `
         FROM courses c
         JOIN user_courses uc ON c.course_id = uc.course_id
         LEFT JOIN users u_instructor ON c.instructor_id = u_instructor.user_id
         WHERE uc.user_id = $1
    `;
    const totalCountQuery = `SELECT COUNT(*) ${baseQuery}`;
    const totalResult = await db.query(totalCountQuery, [user_id]);
    const totalItems = parseInt(totalResult.rows[0].count);

    const offset = (pagination.page - 1) * pagination.limit;
    const dataQuery = `
        SELECT c.*, uc.enrolled_at, uc.progress, uc.completed_at, 
               u_instructor.name as instructor_name, u_instructor.profile_picture_url as instructor_profile_picture
        ${baseQuery}
        ORDER BY uc.enrolled_at DESC
        LIMIT $2 OFFSET $3
    `;
    
    const res = await db.query(dataQuery, [user_id, pagination.limit, offset]);
    return {
        data: res.rows,
        page: pagination.page,
        limit: pagination.limit,
        totalPages: Math.ceil(totalItems / pagination.limit),
        totalItems: totalItems
    };
};

exports.updateUserCourseProgress = async (user_id, course_id, progress, completed_at) => {
    const updateFields = [];
    const values = [];
    let paramIndex = 1;

    if (progress !== undefined) {
        updateFields.push(`progress = $${paramIndex++}`);
        values.push(progress);
    }
    // Only update completed_at if progress is 100 or explicitly provided
    if (progress === 100 && completed_at === undefined) {
        updateFields.push(`completed_at = CURRENT_TIMESTAMP`);
    } else if (completed_at !== undefined) {
        updateFields.push(`completed_at = $${paramIndex++}`);
        values.push(completed_at); // Allows setting to null if needed
    }


    if (updateFields.length === 0) { 
        const currentEnrollment = await db.query(
            `SELECT * FROM user_courses WHERE user_id = $1 AND course_id = $2`,
            [user_id, course_id]
        );
        return currentEnrollment.rows[0];
    }
    
    values.push(user_id);
    values.push(course_id);

    const queryText = `
        UPDATE user_courses
        SET ${updateFields.join(', ')}
        WHERE user_id = $${paramIndex++} AND course_id = $${paramIndex}
        RETURNING *
    `;

    const res = await db.query(queryText, values);
    return res.rows[0];
};

exports.findCoursesByInstructorId = async (instructor_id, pagination = { page: 1, limit: 10 }) => {
    const baseQuery = `FROM courses c WHERE c.instructor_id = $1`;
    const totalCountQuery = `SELECT COUNT(*) ${baseQuery}`;
    const totalResult = await db.query(totalCountQuery, [instructor_id]);
    const totalItems = parseInt(totalResult.rows[0].count);

    const offset = (pagination.page - 1) * pagination.limit;
    const dataQuery = `
        SELECT c.* 
        ${baseQuery}
        ORDER BY c.created_at DESC
        LIMIT $2 OFFSET $3
    `;
    
    const res = await db.query(dataQuery, [instructor_id, pagination.limit, offset]);
    return {
        data: res.rows,
        page: pagination.page,
        limit: pagination.limit,
        totalPages: Math.ceil(totalItems / pagination.limit),
        totalItems: totalItems
    };
};