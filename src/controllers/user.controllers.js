import asyncHandler from '../utils/asyncHandler.js';
import apiError from '../utils/ApiError.js'
import { User } from '../models/user.model.js'
import { upLoadOnCloudinary } from '../utils/cloudinary.js';
import ApiResponse from '../utils/ApiResponse.js';

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

export { registerUser, loginUser, logOutUser };