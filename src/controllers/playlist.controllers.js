import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from '../utils/asyncHandler.js';
import { Playlist } from "../models/playlist.model.js";
import { Video } from "../models/video.model.js";

const createPlaylist = asyncHandler(async (req, res) => {
    const { name, description } = req.body;
    if (!name) {
        throw new ApiError(400, 'Playlist name is required');
    }
    const newPlaylist = await Playlist.create({
        name,
        description,
        owner: req.user._id,
        videos: []
    });
    res.status(201).json(new ApiResponse(201, newPlaylist, 'Playlist created successfully'));
});

const getAllPlaylists = asyncHandler(async (req, res) => {
    const playlists = await Playlist.aggregate([
        {
            $limit: 10
        },
        {
            $lookup: {
                from: 'users',
                localField: 'owner',
                foreignField: '_id',
                as: 'ownerDetails',
                pipeline: [
                    {
                        $project: {
                            username: 1,
                            avatar: 1
                        }
                    }
                ]
            }
        },
        {
            $addFields: {
                ownerDetails: {
                    $first: '$ownerDetails'
                }
            }
        }
    ]);   
    res.status(200).json(new ApiResponse(200, playlists, 'Playlists fetched successfully'));
});

const getPlaylistById = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;
    const playlist = await Playlist.findById(playlistId).populate('owner', 'username avatar').populate('videos');
    if (!playlist) {
        throw new ApiError(404, 'Playlist not found');
    }
    res.status(200).json(new ApiResponse(200, playlist, 'Playlist fetched successfully'));
});

const getPlaylistByUserId = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const playlists = await Playlist.find({ owner: userId }).populate('owner', 'username avatar').populate('videos');
    if (playlists.length === 0) {
        throw new ApiError(404, 'No playlists found for this user');
    }
    res.status(200).json(new ApiResponse(200, playlists, 'Playlists fetched successfully'));
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { playlistId } = req.body;
    const playlist = await Playlist.findById(playlistId);
    if (!playlist) {
        throw new ApiError(404, 'Playlist not found');
    }
    //owner check
    if (playlist.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, 'You are not authorized to modify this playlist');
    }
    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(404, 'Video not found');
    }
    if (playlist.videos.includes(videoId)) {
        throw new ApiError(400, 'Video already in playlist');
    }
    playlist.videos.push(videoId);
    await playlist.save();
    res.status(200).json(new ApiResponse(200, playlist, 'Video added to playlist successfully'));
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { playlistId } = req.body;
    const playlist = await Playlist.findById(playlistId);
    if (!playlist) {
        throw new ApiError(404, 'Playlist not found');
    }
    //owner check
    if (playlist.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, 'You are not authorized to modify this playlist');
    }

    const videoIndex = playlist.videos.indexOf(videoId);
    if (videoIndex === -1) {
        throw new ApiError(404, 'Video not found in playlist');
    }
    playlist.videos.splice(videoIndex, 1);
    await playlist.save();
    res.status(200).json(new ApiResponse(200, playlist, 'Video removed from playlist successfully'));
});

const deletePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;
    const playlist = await Playlist.findById(playlistId);
    if (!playlist) {
        throw new ApiError(404, 'Playlist not found');
    }
    if (playlist.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, 'You are not authorized to delete this playlist');
    }
    await Playlist.findByIdAndDelete(playlistId);
    res.status(200).json(new ApiResponse(200, null, 'Playlist deleted successfully'));
});

export {
    createPlaylist,
    getAllPlaylists,
    getPlaylistById,
    getPlaylistByUserId,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist
};