import ApiResponse from "../utils/ApiResponse";
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import { Like } from "../models/like.model.js";

const toogleLike = asyncHandler(async (req, res) => {
    const { itemId, itemType } = req.body;
    if (!itemId || !itemType) {
        throw new ApiError(400, 'Item ID and Item Type are required');
    }
    const validTypes = ['comment', 'video', 'tweet'];
    if (!validTypes.includes(itemType)) {
        throw new ApiError(400, 'Invalid Item Type');
    }
    const filter = {
        likedBy: req.user._id,
        [itemType]: itemId
    }
    const existingLike = await Like.findOne(filter);
    if (existingLike) {
        await Like.findByIdAndDelete(existingLike._id);
        return res.status(200).json(new ApiResponse(200, null, 'Like removed successfully'));
    }
    else {
        const newLike = await Like.create(filter);
        res.status(201).json(new ApiResponse(201, newLike, 'Like added successfully'));
    }
    console.log(existingLike);
});

const fetchLikes = asyncHandler(async (req, res) => {
    const { itemId, itemType } = req.query;
    if (!itemId || !itemType) {
        throw new ApiError(400, 'Item ID and Item Type are required');
    }
    const validTypes = ['comment', 'video', 'tweet'];
    if (!validTypes.includes(itemType)) {
        throw new ApiError(400, 'Invalid Item Type');
    }
    const filter = {
        [itemType]: itemId
    }
    const likes = await Like.find(filter).populate('likedBy', 'username avatar');
    res.status(200).json(new ApiResponse(200, likes, 'Likes fetched successfully'));
});

export {
    toogleLike,
    fetchLikes
};