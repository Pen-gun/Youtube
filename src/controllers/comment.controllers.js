import ApiResponse from "../utils/ApiResponse";
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import { Comment } from "../models/comment.model.js";

const createComment = asyncHandler(async (req, res) => {
    const {comment} = req.body;
    const {videoId} = req.params;
    if (!videoId || !comment) {
        throw new ApiError(400, 'Video ID and comment are required');
    }
    const newComment = await Comment.create({
        video: videoId,
        content: comment,
        owner: req.user._id
    });
    res.status(201).json(new ApiResponse(201,newComment, 'Comment created successfully'));
});
const getCommentsByVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const comments = await Comment.find({ video: videoId }).populate('owner', 'username avatar').sort({ createdAt: -1 });
    if (comments.length === 0) {
        throw new ApiError(404, 'No comments found for this video');
    }
    res.status(200).json(new ApiResponse(200,comments, 'Comments fetched successfully'));
});

const deleteComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const comment = await Comment.findById(commentId);
    if (!comment) {
        throw new ApiError(404, 'Comment not found');
    }
    if (comment.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, 'You are not authorized to delete this comment');
    }
    await Comment.findByIdAndDelete(commentId);
    return res.status(200).json(new ApiResponse(200, null, 'Comment deleted successfully'));
});

const updateComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const { content } = req.body;
    if (content === '' || !content) {
        throw new ApiError(400, 'Content cannot be empty');
    }
    const comment = await Comment.findById(commentId);
    if (!comment) {
        throw new ApiError(404, 'Comment not found');
    }
    if (comment.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, 'You are not authorized to update this comment');
    }
    comment.content = content;
    await comment.save();
    res.status(200).json(new ApiResponse(200, comment, 'Comment updated successfully'));
});

export {
    createComment,
    getCommentsByVideo,
    deleteComment,
    updateComment
};