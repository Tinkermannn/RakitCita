const db = require('../database/pg.database');

exports.createCommunity = async (communityData) => {
    const { name, description, creator_id, banner_url } = communityData;
    const client = await db.pool.connect();
    try {
        await client.query('BEGIN');
        const communityRes = await client.query(
            `INSERT INTO communities (name, description, creator_id, banner_url)
             VALUES ($1, $2, $3, $4) RETURNING *`,
            [name, description, creator_id, banner_url]
        );
        const community = communityRes.rows[0];
        
        if (community) {
            await client.query(
                `INSERT INTO user_communities (user_id, community_id, role_in_community)
                 VALUES ($1, $2, $3)`,
                [creator_id, community.community_id, 'admin']
            );
        }
        await client.query('COMMIT');
        return community;
    } catch (e) {
        await client.query('ROLLBACK');
        throw e;
    } finally {
        client.release();
    }
};

exports.findAllCommunities = async (filters = {}, pagination = { page: 1, limit: 10 }) => {
    let baseQueryText = `
        FROM communities c
        LEFT JOIN users u ON c.creator_id = u.user_id
    `;
    const queryParams = [];
    const conditions = [];
    let paramIndex = 1;
    
    if (filters.search) {
        conditions.push(`(c.name ILIKE $${paramIndex} OR c.description ILIKE $${paramIndex})`);
        queryParams.push(`%${filters.search}%`);
        paramIndex++;
    }

    if (conditions.length > 0) {
        baseQueryText += ' WHERE ' + conditions.join(' AND ');
    }

    const totalCountQuery = `SELECT COUNT(c.community_id) AS total_items ${baseQueryText}`;
    const totalResult = await db.query(totalCountQuery, queryParams);
    const totalItems = parseInt(totalResult.rows[0].total_items);
    
    const offset = (pagination.page - 1) * pagination.limit;
    const dataQuery = `
        SELECT c.*, u.name as creator_name, u.profile_picture_url as creator_profile_picture,
               (SELECT COUNT(*) FROM user_communities uc WHERE uc.community_id = c.community_id) as member_count
        ${baseQueryText}
        ORDER BY c.created_at DESC
        LIMIT $${paramIndex++} OFFSET $${paramIndex++}
    `;
    queryParams.push(pagination.limit, offset);
    
    const res = await db.query(dataQuery, queryParams);
    return {
        data: res.rows,
        page: pagination.page,
        limit: pagination.limit,
        totalPages: Math.ceil(totalItems / pagination.limit),
        totalItems: totalItems
    };
};

exports.findCommunityById = async (community_id) => {
    const res = await db.query(
        `SELECT c.*, u.name as creator_name, u.profile_picture_url as creator_profile_picture,
               (SELECT COUNT(*) FROM user_communities uc WHERE uc.community_id = c.community_id) as member_count
         FROM communities c
         LEFT JOIN users u ON c.creator_id = u.user_id
         WHERE c.community_id = $1`,
        [community_id]
    );
    return res.rows[0];
};

exports.findUserMembership = async (user_id, community_id) => {
    const res = await db.query(
        `SELECT * FROM user_communities WHERE user_id = $1 AND community_id = $2`,
        [user_id, community_id]
    );
    return res.rows[0];
};

exports.updateCommunity = async (community_id, user_id, user_role, updateData) => {
    const community = await this.findCommunityById(community_id);
    if (!community) return null;

    const membership = await this.findUserMembership(user_id, community_id);
    const isCreator = community.creator_id === user_id;
    const isCommunityAdmin = membership && membership.role_in_community === 'admin';
    const isPlatformAdmin = user_role === 'admin';


    if (!isCreator && !isCommunityAdmin && !isPlatformAdmin) {
        return null; // Not authorized
    }

    const fields = [];
    const values = [];
    let paramIndex = 1;

    Object.entries(updateData).forEach(([key, value]) => {
         const validFields = ['name', 'description', 'banner_url'];
         if(validFields.includes(key)){
            fields.push(`${key} = $${paramIndex++}`);
            values.push(value);
         }
    });

    if (fields.length === 0) return community;

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(community_id);

    const queryText = `
        UPDATE communities
        SET ${fields.join(', ')}
        WHERE community_id = $${paramIndex}
        RETURNING *
    `;
    const res = await db.query(queryText, values);
    return res.rows[0];
};

exports.deleteCommunity = async (community_id, user_id, user_role) => {
    const community = await this.findCommunityById(community_id);
    if (!community) return null;

    if (community.creator_id !== user_id && user_role !== 'admin') {
        return null; // Not authorized
    }
    const res = await db.query(
        `DELETE FROM communities WHERE community_id = $1 RETURNING *`,
        [community_id]
    );
    return res.rows[0];
};

exports.joinCommunity = async (user_id, community_id) => {
    let membership = await this.findUserMembership(user_id, community_id);

    if (membership) {
        return { data: membership, isNew: false };
    }

    const res = await db.query(
        `INSERT INTO user_communities (user_id, community_id, role_in_community) VALUES ($1, $2, 'member') RETURNING *`,
        [user_id, community_id]
    );
    return { data: res.rows[0], isNew: true };
};

exports.leaveCommunity = async (user_id, community_id) => {
    // Prevent creator/admin from leaving if they are the only admin.
    const membership = await this.findUserMembership(user_id, community_id);
    if (membership && membership.role_in_community === 'admin') {
        const adminCountRes = await db.query(
            `SELECT COUNT(*) FROM user_communities WHERE community_id = $1 AND role_in_community = 'admin'`,
            [community_id]
        );
        if (parseInt(adminCountRes.rows[0].count) <= 1) {
            throw new Error("Cannot leave community. You are the only admin. Please assign another admin first.");
        }
    }

    const res = await db.query(
        `DELETE FROM user_communities WHERE user_id = $1 AND community_id = $2 RETURNING *`,
        [user_id, community_id]
    );
    return res.rows[0];
};

exports.findJoinedCommunitiesByUserId = async (user_id, pagination = { page: 1, limit: 10 }) => {
    const baseQuery = `
         FROM communities c
         JOIN user_communities ucm ON c.community_id = ucm.community_id
         LEFT JOIN users u_creator ON c.creator_id = u_creator.user_id
         WHERE ucm.user_id = $1
    `;
    const totalCountQuery = `SELECT COUNT(c.community_id) ${baseQuery}`;
    const totalResult = await db.query(totalCountQuery, [user_id]);
    const totalItems = parseInt(totalResult.rows[0].count);

    const offset = (pagination.page - 1) * pagination.limit;
    const dataQuery = `
        SELECT c.*, ucm.joined_at, ucm.role_in_community,
               u_creator.name as creator_name,
               (SELECT COUNT(*) FROM user_communities uc_count WHERE uc_count.community_id = c.community_id) as member_count
        ${baseQuery}
        ORDER BY ucm.joined_at DESC
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

exports.findCommunityMembers = async (community_id, pagination = { page: 1, limit: 10 }) => {
    const baseQuery = `
         FROM users u
         JOIN user_communities uc ON u.user_id = uc.user_id
         WHERE uc.community_id = $1
    `;
    const totalCountQuery = `SELECT COUNT(u.user_id) ${baseQuery}`;
    const totalResult = await db.query(totalCountQuery, [community_id]);
    const totalItems = parseInt(totalResult.rows[0].count);

    const offset = (pagination.page - 1) * pagination.limit;
    const dataQuery = `
        SELECT u.user_id, u.name, u.email, u.profile_picture_url, uc.joined_at, uc.role_in_community
        ${baseQuery}
        ORDER BY CASE uc.role_in_community 
                    WHEN 'admin' THEN 1 
                    WHEN 'moderator' THEN 2 
                    ELSE 3 
                 END, u.name
        LIMIT $2 OFFSET $3
    `;

    const res = await db.query(dataQuery, [community_id, pagination.limit, offset]);
    return {
        data: res.rows,
        page: pagination.page,
        limit: pagination.limit,
        totalPages: Math.ceil(totalItems / pagination.limit),
        totalItems: totalItems
    };
};

exports.updateMemberRole = async (community_id, member_user_id, new_role, requesting_user_id) => {
    // Check if requesting user is an admin of the community
    const requesterMembership = await this.findUserMembership(requesting_user_id, community_id);
    if (!requesterMembership || requesterMembership.role_in_community !== 'admin') {
        return null; // Not authorized
    }

    // Prevent demoting self if only admin
    if (requesting_user_id === member_user_id && new_role !== 'admin') {
         const adminCountRes = await db.query(
            `SELECT COUNT(*) FROM user_communities WHERE community_id = $1 AND role_in_community = 'admin'`,
            [community_id]
        );
        if (parseInt(adminCountRes.rows[0].count) <= 1) {
            throw new Error("Cannot demote self. You are the only admin.");
        }
    }


    const res = await db.query(
        `UPDATE user_communities
         SET role_in_community = $1
         WHERE community_id = $2 AND user_id = $3
         RETURNING *`,
        [new_role, community_id, member_user_id]
    );
    return res.rows[0];
};

exports.removeMember = async (community_id, member_user_id, requesting_user_id) => {
    const requesterMembership = await this.findUserMembership(requesting_user_id, community_id);
    const memberToRemoveMembership = await this.findUserMembership(member_user_id, community_id);

    if (!memberToRemoveMembership) return null; // Member not found

    // Platform admin can remove anyone.
    // Community admin can remove members or moderators, but not other admins unless they are the creator removing someone.
    // Or, allow community admin to remove other admins if they are not the creator.
    const community = await this.findCommunityById(community_id);

    const canRemove = 
        (requesterMembership && requesterMembership.role_in_community === 'admin' && memberToRemoveMembership.role_in_community !== 'admin') || // Community admin removes member/mod
        (requesterMembership && requesterMembership.role_in_community === 'admin' && memberToRemoveMembership.role_in_community === 'admin' && requesting_user_id !== member_user_id) || // Community admin removes another admin (not self)
        (community && community.creator_id === requesting_user_id && memberToRemoveMembership.user_id !== requesting_user_id) || // Creator removes anyone but self
        (await db.query(`SELECT role FROM users WHERE user_id = $1`, [requesting_user_id])).rows[0]?.role === 'admin'; // Platform admin

    if (!canRemove) {
        return null; // Not authorized
    }
    
    // Check if trying to remove the last admin
    if (memberToRemoveMembership.role_in_community === 'admin') {
        const adminCountRes = await db.query(
            `SELECT COUNT(*) FROM user_communities WHERE community_id = $1 AND role_in_community = 'admin'`,
            [community_id]
        );
        if (parseInt(adminCountRes.rows[0].count) <= 1) {
            throw new Error("Cannot remove the last admin from the community.");
        }
    }


    const res = await db.query(
        `DELETE FROM user_communities WHERE community_id = $1 AND user_id = $2 RETURNING *`,
        [community_id, member_user_id]
    );
    return res.rows[0];
};