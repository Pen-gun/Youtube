import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { Subscription } from "../models/subscription.model.js";

import mongoose from "mongoose";

const subscribeToggle = asyncHandler(async (req, res) => {
    const { channelId } = req.params;

    if (!channelId) {
        throw new ApiError(400, "Channel ID is required");
    }

    if (channelId === req.user._id.toString()) {
        throw new ApiError(400, "You cannot subscribe to your own channel");
    }

    const existingSubscription = await Subscription.findOne({
        subscriber: req.user._id,
        channel: channelId
    });

    if (existingSubscription) {
        await existingSubscription.deleteOne();

        return res.status(200).json(
            new ApiResponse(200, null, "Unsubscribed from channel successfully")
        );
    }

    const newSubscription = await Subscription.create({
        subscriber: req.user._id,
        channel: channelId
    });

    return res.status(201).json(
        new ApiResponse(201, newSubscription, "Subscribed to channel successfully")
    );
});

const getNumberofSubscribers = asyncHandler(async (req, res) => {
    const { channelId } = req.params;
    if (!channelId) {
        throw new ApiError(400, 'Channel ID is required');
    }
    const subscriberCount = await Subscription.countDocuments({ channel: channelId });
    res.status(200).json(new ApiResponse(200, { count: subscriberCount }, 'Subscriber count fetched successfully'));
});
export {
    subscribeToggle,
    getNumberofSubscribers
};
