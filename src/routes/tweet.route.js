import { Router } from "express";
import {verifyJWT} from '../middlewares/auth.middleware.js';
import { createTweet, getTweetsByUser, deleteTweet, updateTweet } from "../controllers/tweet.controller.js";

const router = Router();

router.route('/').post(verifyJWT, createTweet);
router.route('/:userId').get(getTweetsByUser);
router.route('/:tweetId').delete(verifyJWT, deleteTweet);
router.route('/:tweetId').put(verifyJWT, updateTweet);

export default router;