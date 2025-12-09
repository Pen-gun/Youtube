import {Router} from 'express';
import {upload} from '../middlewares/multer.middleware.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { deleteVideo, getAllVideos, getVideoById, publishAVideo, togglePublishVideo, updateVideo } from '../controllers/video.controllers.js';

const router = Router();

router.route("/").get(getAllVideos).post(verifyJWT,
    upload.fields([
        {
            name: 'video',
            maxCount: 1
        },
        {
            name: 'thumbnail',
            maxCount: 1
        }
    ]),
    publishAVideo
);
router.route("/:videoId").get(getVideoById).delete(verifyJWT, deleteVideo).patch(verifyJWT, togglePublishVideo);
router.route("/update-video/:videoId").patch(verifyJWT, 
    upload.single('thumbnail'),
    updateVideo
);
export default router;