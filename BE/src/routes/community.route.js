const express = require('express');
const router = express.Router();
const communityController = require('../controllers/community.controller');
const authenticateJWT = require('../Middleware/auth');
const authorize = require('../Middleware/authorize');
const { upload, handleUploadError } = require('../Middleware/upload');

// Public routes
router.get('/', communityController.getAllCommunities);
router.get('/:community_id', authenticateJWT, communityController.getCommunityById); // Auth to check membership status
router.get('/:community_id/members', communityController.getCommunityMembers);


// Authenticated user routes
router.post(
    '/', 
    authenticateJWT,
    upload.single('bannerImage'), 
    handleUploadError,
    communityController.createCommunity
); 
router.put(
    '/:community_id', 
    authenticateJWT,
    upload.single('bannerImage'),
    handleUploadError,
    communityController.updateCommunity 
); 
router.delete(
    '/:community_id', 
    authenticateJWT,
    communityController.deleteCommunity 
); 

router.post('/:community_id/join', authenticateJWT, communityController.joinCommunity);
router.delete('/:community_id/leave', authenticateJWT, communityController.leaveCommunity); // Changed to DELETE for semantic correctness
router.get('/joined/me', authenticateJWT, communityController.getJoinedCommunitiesByUser);

// Community admin/moderator routes
router.patch(
    '/:community_id/members/:member_user_id/role',
    authenticateJWT,
    // authorize(['admin']), // Community admin authorization is handled in controller/repository
    communityController.updateCommunityMemberRole
);
router.delete(
    '/:community_id/members/:member_user_id',
    authenticateJWT,
    // authorize(['admin']), // Community admin authorization is handled in controller/repository
    communityController.removeCommunityMember
);


module.exports = router;