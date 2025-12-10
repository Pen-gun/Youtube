import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { getNumberofSubscribers, subscribeToggle } from "../controllers/subscription.controllers.js";

const router = Router();

router.route('/:channelId').post(verifyJWT, subscribeToggle);
router.route('/:channelId').get(getNumberofSubscribers);

export default router;
