import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware";
import { getNumberofSubscribers, subscribeToggle } from "../controllers/subscription.controllers";

const router = Router();
router.use(verifyJWT);

router.route('/:channelId').post(subscribeToggle);
router.route('/:channelId').get(getNumberofSubscribers);

export default router;
