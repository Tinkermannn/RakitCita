const communityRepository = require('../repositories/community.repository');
const baseResponse = require('../utils/baseResponse.util');
const cloudinary = require('../utils/cloudinary.config');

exports.createCommunity = async (req, res, next) => {
    try {
        const { name, description } = req.body;
        const creator_id = req.user.user_id;

        if (!name) {
            return baseResponse(res, false, 400, "Community name is required", null);
        }

        let bannerUrl = null;
        if (req.file) {
            const result = await cloudinary.uploader.upload(req.file.path, {
                folder: `platform_pelatihan/community_banners`,
                transformation: [{ width: 1200, height: 400, crop: "fill" }]
            });
            bannerUrl = result.secure_url;
        }

        const community = await communityRepository.createCommunity({ 
            name, description, creator_id, banner_url: bannerUrl 
        });
        return baseResponse(res, true, 201, "Community created successfully", community);
    } catch (error) {
        if (error.message && error.message.includes("duplicate key value violates unique constraint")) {
            return baseResponse(res, false, 409, "A community with this name already exists.", null);
        }
        next(error);
    }
};

exports.getAllCommunities = async (req, res, next) => {
    try {
        const { search, page = 1, limit = 10 } = req.query;
        const filters = { search };
        const pagination = { page: parseInt(page), limit: parseInt(limit) };
        const result = await communityRepository.findAllCommunities(filters, pagination);
        return baseResponse(res, true, 200, "Communities fetched successfully", result);
    } catch (error) {
        next(error);
    }
};

exports.getCommunityById = async (req, res, next) => {
    try {
        const community = await communityRepository.findCommunityById(req.params.community_id);
        if (community) {
            // Check if current user is a member (optional, can be done on frontend too)
            let isMember = false;
            if (req.user && req.user.user_id) {
                const membership = await communityRepository.findUserMembership(req.user.user_id, req.params.community_id);
                isMember = !!membership;
                community.currentUserRoleInCommunity = membership ? membership.role_in_community : null;
            }
            community.isCurrentUserMember = isMember;
            return baseResponse(res, true, 200, "Community found", community);
        } else {
            return baseResponse(res, false, 404, "Community not found", null);
        }
    } catch (error) {
        next(error);
    }
};

exports.updateCommunity = async (req, res, next) => {
    try {
        const { community_id } = req.params;
        const { name, description } = req.body;
        const user_id = req.user.user_id; 

        const updateData = {};
        if (name !== undefined) updateData.name = name;
        if (description !== undefined) updateData.description = description;

        if (req.file) {
            const result = await cloudinary.uploader.upload(req.file.path, {
                folder: `platform_pelatihan/community_banners`,
                transformation: [{ width: 1200, height: 400, crop: "fill" }]
            });
            updateData.banner_url = result.secure_url;
        }

        if (Object.keys(updateData).length === 0 && !req.file) {
            return baseResponse(res, false, 400, "No update data provided", null);
        }

        const community = await communityRepository.updateCommunity(community_id, user_id, req.user.role, updateData);
        if (community) {
            return baseResponse(res, true, 200, "Community updated successfully", community);
        } else {
            return baseResponse(res, false, 404, "Community not found or not authorized to update", null);
        }
    } catch (error) {
        if (error.message && error.message.includes("duplicate key value violates unique constraint")) {
            return baseResponse(res, false, 409, "A community with this name already exists.", null);
        }
        next(error);
    }
};

exports.deleteCommunity = async (req, res, next) => {
    try {
        const { community_id } = req.params;
        const user_id = req.user.user_id; 

        const community = await communityRepository.deleteCommunity(community_id, user_id, req.user.role);
        if (community) {
            return baseResponse(res, true, 200, "Community deleted successfully", community);
        } else {
            return baseResponse(res, false, 404, "Community not found or not authorized to delete", null);
        }
    } catch (error) {
        next(error);
    }
};

exports.joinCommunity = async (req, res, next) => {
    try {
        const { community_id } = req.params;
        const user_id = req.user.user_id;

        const membership = await communityRepository.joinCommunity(user_id, community_id);
        if (membership.isNew) {
            return baseResponse(res, true, 201, "Successfully joined community", membership.data);
        } else {
            return baseResponse(res, true, 200, "Already a member of this community", membership.data);
        }
    } catch (error) {
         if (error.message && error.message.includes("violates foreign key constraint")) {
             return baseResponse(res, false, 404, "Community not found.", null);
        }
        if (error.message && error.message.includes("duplicate key value violates unique constraint")) { // Should be caught by repo logic
            return baseResponse(res, false, 409, "Already a member of this community.", null);
        }
        next(error);
    }
};

exports.leaveCommunity = async (req, res, next) => {
    try {
        const { community_id } = req.params;
        const user_id = req.user.user_id;

        const result = await communityRepository.leaveCommunity(user_id, community_id);
        if (result) {
            return baseResponse(res, true, 200, "Successfully left community", { community_id: result.community_id });
        } else {
            return baseResponse(res, false, 404, "Not a member of this community or community not found", null);
        }
    } catch (error) {
        next(error);
    }
};

exports.getJoinedCommunitiesByUser = async (req, res, next) => {
    try {
        const user_id = req.user.user_id;
        const { page = 1, limit = 10 } = req.query;
        const pagination = { page: parseInt(page), limit: parseInt(limit) };
        const result = await communityRepository.findJoinedCommunitiesByUserId(user_id, pagination);
        return baseResponse(res, true, 200, "Joined communities fetched successfully", result);
    } catch (error) {
        next(error);
    }
};

exports.getCommunityMembers = async (req, res, next) => {
    try {
        const { community_id } = req.params;
        const { page = 1, limit = 10 } = req.query;
        const pagination = { page: parseInt(page), limit: parseInt(limit) };
        const result = await communityRepository.findCommunityMembers(community_id, pagination);
        return baseResponse(res, true, 200, "Community members fetched successfully", result);
    } catch (error) {
        next(error);
    }
};

exports.updateCommunityMemberRole = async (req, res, next) => {
    try {
        const { community_id, member_user_id } = req.params;
        const { role_in_community } = req.body;
        const requesting_user_id = req.user.user_id;

        if (!role_in_community || !['member', 'moderator', 'admin'].includes(role_in_community)) {
            return baseResponse(res, false, 400, "Invalid role provided. Must be 'member', 'moderator', or 'admin'.", null);
        }

        const updatedMembership = await communityRepository.updateMemberRole(
            community_id, 
            member_user_id, 
            role_in_community, 
            requesting_user_id
        );

        if (updatedMembership) {
            return baseResponse(res, true, 200, "Member role updated successfully", updatedMembership);
        } else {
            return baseResponse(res, false, 403, "Not authorized to update role or member/community not found.", null);
        }
    } catch (error) {
        next(error);
    }
};

exports.removeCommunityMember = async (req, res, next) => {
    try {
        const { community_id, member_user_id } = req.params;
        const requesting_user_id = req.user.user_id;

        const removedMembership = await communityRepository.removeMember(
            community_id,
            member_user_id,
            requesting_user_id
        );
        
        if (removedMembership) {
             return baseResponse(res, true, 200, "Member removed successfully", { community_id, user_id: member_user_id });
        } else {
            return baseResponse(res, false, 403, "Not authorized to remove member or member/community not found.", null);
        }

    } catch (error) {
        next(error);
    }
};