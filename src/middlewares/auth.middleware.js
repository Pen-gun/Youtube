import asyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";
import apiError from "../utils/ApiError.js";
import { User } from "../models/user.model.js";

export const verifyJWT = asyncHandler(async (req, res, next) => {
    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
        throw new apiError(401, "access token missing!");
    }
    try {
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const user = await User.findById(decodedToken?._id).select('-password -refreshToken');
        if (!user) {
            throw new apiError(404, "user not found!");
        }
        req.user = user;
        next();
    } catch (error) {
        throw new apiError(401, "invalid access token!");
    }
});