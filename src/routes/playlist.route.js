import { Router } from 'express';
import { verifyJWT } from '../middlewares/auth.middleware';
import { getPlaylistById, getPlaylistById, getAllPlaylists, getPlaylistByUserId, addVideoToPlaylist, removeVideoFromPlaylist, deletePlaylist, createPlaylist } from '../controllers/playlist.controllers';

const router = Router();

router.use(verifyJWT);

router.route('/:playlistId').get(getPlaylistById);
router.route('/').get(getAllPlaylists);
router.route('/:userId').get(getPlaylistByUserId);
router.route('/:videoId').put(addVideoToPlaylist);
router.route('/:videoId').delete(removeVideoFromPlaylist);
router.route('/:playlistId').delete(deletePlaylist);
router.route('/').post(createPlaylist);

export default router;