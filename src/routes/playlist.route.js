import { Router } from 'express';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { getPlaylistById, getAllPlaylists, getPlaylistByUserId, addVideoToPlaylist, removeVideoFromPlaylist, deletePlaylist, createPlaylist } from '../controllers/playlist.controllers.js';

const router = Router();

router.use(verifyJWT);

router.route('/:playlistId').get(getPlaylistById);
router.route('/').get(getAllPlaylists);
router.route('/user/:userId').get(getPlaylistByUserId);
router.route('/:videoId').put(addVideoToPlaylist);
router.route('/:videoId').delete(removeVideoFromPlaylist);
router.route('/d/:playlistId').delete(deletePlaylist);
router.route('/').post(createPlaylist);

export default router;