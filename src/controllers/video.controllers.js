import { Video } from "../models/video.model.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js'
import { upLoadOnCloudinary } from '../utils/cloudinary.js';

const ownerCheck = async (videoId, userId) => {
    // Include isPublished so toggle routes can flip the flag correctly
    const video = await Video.findById(videoId).select('owner isPublished');
    if (!video) {
        throw new ApiError(404, 'Video not found');
    }
    if (video.owner.toString() !== userId.toString()) {
        throw new ApiError(403, 'You are not authorized to perform this action');
    }
    return video;
};

const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy = 'createdAt', order = 'desc', userId } = req.query;
    const filter = {};
    if (userId) {
        filter.owner = userId;
    }
    if (query) {
        filter.$or = [
            { title: { $regex: query, $options: 'i' } },
            { description: { $regex: query, $options: 'i' } }
        ];
    }
    const pageNumber = Math.max(1, parseInt(page) || 1);
    const limitNumber = Math.min(100, Math.max(1, parseInt(limit) || 10));
    const videos = await Video.find(filter)
        .sort({ [sortBy]: order === 'desc' ? -1 : 1 })
        .skip((pageNumber - 1) * limitNumber)
        .limit(limitNumber);
    const totalVideos = await Video.countDocuments(filter);

    if (totalVideos === 0) {
        return res.status(200).json(new ApiResponse(200, {videos: []}, 'No videos found'));
    }
    return res.status(200).json(new ApiResponse(200,
        {
            videos,
            pagination: {
                totalVideos,
                page: pageNumber,
                limit: limitNumber,
                totalPages: Math.ceil(totalVideos / limitNumber),
            },

        }, 'Videos fetched successfully'));
});

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body;
    if (!title || !description) {
        throw new ApiError(400, 'Title and description are required');
    }
    const videoLocalPath = req.files?.video[0].path;
    const thumbnailLocalPath = req.files?.thumbnail[0].path;
    if (!thumbnailLocalPath) {
        throw new ApiError(400, 'Thumbnail file is required');
    }
    if (!videoLocalPath) {
        throw new ApiError(400, 'Video file is required');
    }
    const cloudinaryVideoResponse = await upLoadOnCloudinary(videoLocalPath);
    if (!cloudinaryVideoResponse) {
        throw new ApiError(500, 'Failed to upload video to cloudinary');
    }
    console.log(cloudinaryVideoResponse);
    const cloudinaryThumbnailResponse = await upLoadOnCloudinary(thumbnailLocalPath);
    if (!cloudinaryThumbnailResponse) {
        throw new ApiError(500, 'Failed to upload thumbnail to cloudinary');
    }
    console.log(cloudinaryThumbnailResponse);
    const newVideo = new Video({
        title,
        description,
        videoFile: cloudinaryVideoResponse.secure_url,
        thumbnail: cloudinaryThumbnailResponse.secure_url,
        duration: cloudinaryVideoResponse.duration || 0,
        views: 0,
        isPublished: true,
        owner: req.user._id,
    })
    await newVideo.save();
    return res.status(201).json(new ApiResponse(201, newVideo, 'Video published successfully'));
});

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(404, 'Video not found');
    }
    return res.status(200).json(new ApiResponse(200, video, 'Video fetched successfully'));
});

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    await ownerCheck(videoId, req.user._id);
    const { title, description } = req.body;
    const localThumbnailPath = req.file?.path;
    if (!title && !description && !localThumbnailPath) {
        throw new ApiError(400, 'At least one field (title, description, thumbnail) is required to update');
    }
    const updateData = {};
    if (localThumbnailPath) {
        const cloudinaryThumbnailResponse = await upLoadOnCloudinary(localThumbnailPath);
        if (!cloudinaryThumbnailResponse) {
            throw new ApiError(500, 'Failed to upload thumbnail to cloudinary');
        }
        updateData.thumbnailUrl = cloudinaryThumbnailResponse.secure_url;
    }
    if (title) {
        updateData.title = title;
    }
    if (description) {
        updateData.description = description;
    }

    const video = await Video.findByIdAndUpdate(
        videoId,
        { $set: updateData },
        { new: true }
    )
    if (!video) {
        throw new ApiError(404, 'Video not found');
    }
    return res.status(200).json(new ApiResponse(200, video, 'Video updated successfully'));
});

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    await ownerCheck(videoId, req.user._id);
    const video = await Video.findByIdAndDelete(videoId);
    if (!video) {
        throw new ApiError(404, 'Video not found');
    }
    return res.status(200).json(new ApiResponse(200, null, 'Video deleted successfully'));
});

const togglePublishVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const video = await ownerCheck(videoId, req.user._id);
    if (!video) {
        throw new ApiError(404, 'Video not found');
    }
    video.isPublished = !video.isPublished;
    await video.save();
    return res.status(200).json(new ApiResponse(200, video, `Video isPublished: ${video.isPublished ? 'true' : 'false'} successfully`));
});

export { getAllVideos, publishAVideo, getVideoById, updateVideo, deleteVideo, togglePublishVideo };