import { Router } from "express";
import {verifyJWT} from '../middlewares/auth.middleware.js';
import { createComment, getCommentsByVideo, deleteComment, updateComment } from "../controllers/comment.controllers.js";

const router = Router();

router.post('/:videoId', verifyJWT, createComment);
router.get('/:videoId', getCommentsByVideo);
router.delete('/:commentId', verifyJWT, deleteComment);
router.patch('/:commentId', verifyJWT, updateComment);

export default router;