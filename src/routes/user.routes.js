import {Router} from 'express';
import { loginUser, registerUser, logOutUser,refreshAccessToken, changePassword, getCurrentUser, updateAccount } from '../controllers/user.controllers.js';
import {upload} from '../middlewares/multer.middleware.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = Router();

router.route("/register").post(
    upload.fields([
        {
            name: 'avatar',
            maxCount: 1
        },
        {
            name: 'coverImage',
            maxCount: 1
        }
    ]),
    registerUser);
router.route("/login").post(
    loginUser
);
//secured route
router.route("/logout").post(verifyJWT, logOutUser);
router.route("/refresh-token").post(refreshAccessToken);
router.route("/change-password").post(verifyJWT, changePassword);
router.route("/get-current-user").get(verifyJWT, getCurrentUser);
router.route("/update-account").put(verifyJWT, updateAccount);

export default router;