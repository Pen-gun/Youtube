import { Router } from "express";
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { toogleLike, fetchLikes } from "../controllers/like.controllers.js";

const router = Router();

router.route('/').post(verifyJWT, toogleLike);
router.route('/').get(fetchLikes);

export default router;