import asyncHandler from '../utils/asyncHandler.js';
import apiError from '../utils/ApiError.js'
import { User } from '../models/user.model.js'
import { upLoadOnCloudinary } from '../utils/cloudinary.js';
import ApiResponse from '../utils/ApiResponse.js';
import jwt from 'jsonwebtoken';

const generateRefreshAndAccessToken = async (userid) => {
    try {
        const user = await User.findById(userid);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();
        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };

    } catch (err) {
        throw new apiError(500, "unable to generate tokens!");
    }
};

const registerUser = asyncHandler(async (req, res) => {
    //fetch data from frontend
    //validation of data
    //check if user already exists: username or email
    //chaeck for image upload
    //upload image to cloudinary
    // create opject of user model
    //store the data in database
    //hide password and refresh token
    //check for errors
    //send response
    //  Get-Process -Name node | Stop-Process -Force 
    const { fullName, username, email, password } = req.body
    if (
        [fullName, username, email, password].some((field) =>
            field?.trim() === "")
    ) {
        throw new apiError(400, "all field are required!");
    }
    const existed = await User.findOne({
        $or: [{ username }, { email }]
    })
    if (existed) {
        throw new apiError(409, "already existed user!")
    }
    const avatarLocalPath = req.files?.avatar[0]?.path;
    // const coverImageLocalPath = req.files?.coverImage[0]?.path;
    let coverImageLocalPath = null;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path;
    }

    if (!avatarLocalPath) {
        throw new apiError(400, 'No avatar image found')

    }
    const avatar = await upLoadOnCloudinary(avatarLocalPath);
    const coverImage = await upLoadOnCloudinary(coverImageLocalPath);

    if (!avatar) {
        throw new apiError(500, 'unable to upload avatar image')
    }
    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || '',
        email,
        username: username.toLowerCase(),
        password
    })
    const createdUser = await User.findById(user._id).select('-password -refreshToken');
    if (!createdUser) {
        throw new apiError(500, 'unable to create user')
    }
    return res.status(201).json(
        new ApiResponse(200, createdUser, 'user created successfully')
    )

});

const loginUser = asyncHandler(async (req, res) => {
    //fetch data from frontend
    //validation of data
    //check if user exists
    //compare password
    //generate refresh token and access token
    //send cookies
    const { email, username, password } = req.body;
    if (!email && !username) {
        throw new apiError(400, "username or email missing!");
    }
    const user = await User.findOne({
        $or: [
            {
                email: email,
            },
            {
                username: username,
            }
        ]
    });
    if (!user) {
        throw new apiError(404, "user not found!");
    }

    const isPasswordMathched = await user.isPasswordCorrect(password);
    if (!isPasswordMathched) {
        throw new apiError(401, "invalid credentials!");
    }
    const { refreshToken, accessToken } = await generateRefreshAndAccessToken(user._id);

    const loggedInUser = await User.findById(user._id).select('-password -refreshToken');

    const options = {
        httpOnly: true,
        secure: true,
    };
    res.status(200).cookie('refreshToken', refreshToken, options)
        .cookie('accessToken', accessToken, options)
        .json(
            new ApiResponse(200, { user: loggedInUser, accessToken }, 'user logged in successfully')
        );
});

const logOutUser = asyncHandler(async (req, res) => {
    //fetch refresh token from cookies
    //validate refresh token
    //clear refresh token from db
    //clear cookies
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: null
            }

        },
        {
            new: true
        }
    )
    const options = {
        httpOnly: true,
        secure: true,
    }
    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(
            new ApiResponse(200, null, "user logged out successfully")
        );

});

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incommingRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken;
    if (!incommingRefreshToken) {
        throw new apiError(401, "refresh token missing!");
    }
    const decodedToken = jwt.verify(incommingRefreshToken, process.env.REFRESH_TOKEN_SECRET)
    const user = await User.findById(decodedToken?.userId);
    if (!user) {
        throw new apiError(404, "user not found!");
    }
    if (incommingRefreshToken !== user?.refreshToken) {
        throw new apiError(401, "invalid refresh token!");
    }
    const options = {
        httpOnly: true,
        secure: true,
    }
    try {
        const { refreshToken, accessToken } = await generateRefreshAndAccessToken(user._id);
        return res
            .status(200)
            .cookie('refreshToken', refreshToken, options)
            .cookie('accessToken', accessToken, options)
            .json(
                new ApiResponse(200, { accessToken: accessToken }, "access token refreshed successfully")
            );
    } catch (error) {
        throw new apiError(500, "unable to refresh access token!");

    }
});

const changePassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword, confirmPassword } = req.body;
    if (newPassword !== confirmPassword) {
        throw new apiError(400, "new password and confirm password do not match");
    }
    if (!oldPassword || !newPassword) {
        throw new apiError(400, "old password and new password are required");
    }
    const user = await User.findById(req.user._id);
    const isPasswordMathched = await user.isPasswordCorrect(oldPassword);
    if (!isPasswordMathched) {
        throw new apiError(401, "old password is incorrect");
    }
    user.password = newPassword;
    await user.save({ validateBeforeSave: false });
    return res.status(200).json(
        new ApiResponse(200, null, "password changed successfully")
    );
});

const getCurrentUser = asyncHandler(async (req, res) => {
    return res.status(200).json(
        new ApiResponse(200, req.user, "current user fetched successfully")
    );
});

const updateAccount = asyncHandler(async (req, res) => {
    const { fullName, username, email } = req.body;

    // Require at least one field
    if (!fullName && !username && !email) {
        throw new apiError(400, "At least one field is required to update!");
    }

    const userId = req.user._id;
    const existed = await User.findOne({
        _id: { $ne: userId },  // exclude current user
        $or: [
            username ? { username } : null,
            email ? { email } : null
        ].filter(Boolean)
    });

    if (existed) {
        throw new apiError(409, "Username or email already in use!");
    }

    // Build update object only with provided fields
    const updateFields = {};
    if (fullName) updateFields.fullName = fullName;
    if (username) updateFields.username = username;
    if (email) updateFields.email = email;

    // Update and return new user
    const updatedUser = await User.findByIdAndUpdate(
        userId,
        { $set: updateFields },
        { new: true, runValidators: true }
    );

    return res.status(200).json(
        new ApiResponse(200, updatedUser, "Account updated successfully")
    );
});

const updateUserAvatar = asyncHandler(async (req, res) => {
    const avatarPath = req.file?.path;
    if (!avatarPath) {
        throw new apiError(400, 'No avatar image found');
    }
    const avatar = await upLoadOnCloudinary(avatarPath);
    if (!avatar) {
        throw new apiError(500, 'unable to upload avatar image');
    }
    const userId = req.user._id;
    const updateUser = await User.findByIdAndUpdate(
        userId,
        { $set: { avatar: avatar.url } },
        { new: true }
    ).select('-password -refreshToken');
    return res.status(200).json(
        new ApiResponse(200, updateUser, 'User avatar updated successfully')
    );
});
const updateUserCoverImage = asyncHandler(async (req, res) => {
    const coverImagePath = req.file?.path;
    if (!coverImagePath) {
        throw new apiError(400, 'No cover image found');
    }
    const coverImage = await upLoadOnCloudinary(coverImagePath);
    if (!coverImage) {
        throw new apiError(500, 'unable to upload cover image');
    }
    const userId = req.user._id;
    const updateUser = await User.findByIdAndUpdate(
        userId,
        { $set: { coverImage: coverImage.url } },
        { new: true }
    ).select('-password -refreshToken');
    return res.status(200).json(
        new ApiResponse(200, updateUser, 'User cover image updated successfully')
    );
});

const getUserChannelProfile = asyncHandler(async (req, res) => {
    const {username} = req.params;
    if(!username.trim()){
        throw new apiError(400, "username is required");
    }
    const channel = await User.aggregate([
        {
            $match: {username: username}
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "numberOfSubscribers"
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribedChannels"
            }
        },
        {
            $addFields: {
                numberOfSubscribers: { $size: "$numberOfSubscribers" },
                subscribedChannels: { $size: "$subscribedChannels" },
                isSubscribed: {
                    $cond: {
                        if: {$in: [req.user?._id, "$subscribedChannels.subscriber"]},
                            then: true,
                            else: false
                    }
                }
            }
        },
        {
            $project: {
                fullName: 1,
                username: 1,
                email: 1,
                avatar: 1,
                coverImage: 1,
                numberOfSubscribers: 1,
                subscribedChannels: 1,
                isSubscribed: 1
            }
                
        }
    ])
    if(!channel.length){
        throw new apiError(404, "channel not found");
    }
    return res.status(200).json(
        new ApiResponse(200, channel[0], "Channel profile retrieved successfully")
    );
});

export { registerUser, loginUser, logOutUser, refreshAccessToken, changePassword, getCurrentUser, updateAccount, updateUserAvatar, updateUserCoverImage, getUserChannelProfile };