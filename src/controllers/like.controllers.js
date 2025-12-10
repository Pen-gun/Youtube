import ApiResponse from "../utils/ApiResponse";
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import { Like} from "../models/like.model.js";

const likeVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const video = await Like.findOne({ video: videoId, likedBy: req.user._id });
});
const unlikeVideo = asyncHandler(async (req, res) => {});
const fetchVideoLikes = asyncHandler(async (req, res) => {});
const likeComment = asyncHandler(async (req, res) => {});
const unlikeComment = asyncHandler(async (req, res) => {});
const fetchCommentLikes = asyncHandler(async (req, res) => {});
const likeTweet = asyncHandler(async (req, res) => {});
const unlikeTweet = asyncHandler(async (req, res) => {});
const fetchTweetLikes = asyncHandler(async (req, res) => {});
export {
    fetchVideoLikes,
    fetchCommentLikes,
    fetchTweetLikes,
    likeVideo,
    unlikeVideo,
    likeComment,
    unlikeComment,
    likeTweet,
    unlikeTweet
};