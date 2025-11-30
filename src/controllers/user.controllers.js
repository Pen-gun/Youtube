import asyncHandler from '../utils/asyncHandler.js';
import apiError from '../utils/ApiError.js'
import { User } from '../models/user.model.js'
import { upLoadOnCloudinary } from '../utils/cloudinary.js';
import ApiResponse from '../utils/ApiResponse.js';

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
    console.log('email:', email);
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
    const avatarLocalPath = req.files?.Avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path;
    if (!avatarLocalPath) {
        throw new apiError(400, 'No avatar image found')

    }
    const avatar = await upLoadOnCloudinary(avatarLocalPath);
    const coverImage = await upLoadOnCloudinary(coverImageLocalPath);

    if(!avatar){
        throw new apiError (500, 'unable to upload avatar image')
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

export { registerUser };