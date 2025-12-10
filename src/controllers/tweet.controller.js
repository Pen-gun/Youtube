import ApiResponse from "../utils/ApiResponse";
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import { Tweet } from "../models/tweet.model.js";

const createTweet = asyncHandler(async (req, res) => {
    const {content} = req.body;
    if (!content) {
        throw new ApiError(400, 'Content is required to create a tweet');
    }
    const newTweet = await Tweet.create({
        owner: req.user._id,
        content: content
    });
    res.status(201).json(new ApiResponse(201,newTweet, 'Tweet created successfully'));
});
const getTweetsByUser = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const tweets = await Tweet.find({ owner: userId }).populate('owner', 'username avatar').sort({ createdAt: -1 });
    return res.status(200).json(new ApiResponse(200,tweets, 'Tweets fetched successfully'));
});
const deleteTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;
    const tweet = await Tweet.findById(tweetId);
    if (!tweet) {
        throw new ApiError(404, 'Tweet not found');
    }
    if (tweet.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, 'You are not authorized to delete this tweet');
    }
    await Tweet.findByIdAndDelete(tweetId);
    res.status(200).json(new ApiResponse(200, null, 'Tweet deleted successfully'));
});
const updateTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;
    const { content } = req.body;
    if (content === '' || !content) {
        throw new ApiError(400, 'Content cannot be empty');
    }
    const tweet = await Tweet.findById(tweetId);
    if (!tweet) {
        throw new ApiError(404, 'Tweet not found');
    }
    if (tweet.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, 'You are not authorized to update this tweet');
    }
    tweet.content = content;
    const updatedTweet = await tweet.save();
    res.status(200).json(new ApiResponse(200, updatedTweet, 'Tweet updated successfully')
    )
});

export {
    createTweet,
    getTweetsByUser,
    deleteTweet,
    updateTweet
};