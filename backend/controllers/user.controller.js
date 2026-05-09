import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import { User }  from "../models/user.model.js";
import {ApiResponse} from "../utils/ApiResponse.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js";
import jwt from "jsonwebtoken";

const generateAccessAndRefreshTokens = async (userId) => {

    try {

        const user = await User.findById(userId);

        if (!user) {
            throw new ApiError(404, "User not found");
        }

        const accessToken =
            user.generateAccessToken();

        const refreshToken =
            user.generateRefreshToken();

        user.refreshToken = refreshToken;

        await user.save({
            validateBeforeSave: false
        });

        return {
            accessToken,
            refreshToken
        };

    } catch (error) {

        throw new ApiError(
            500,
            error?.message ||
            "Error generating tokens"
        );
    }
};

const registerUser = asyncHandler(async (req, res) => {

    const {
        email,
        username,
        password,
        location,
        team_role,
    } = req.body;

    // Parse arrays safely
    const techStack = JSON.parse(req.body.techStack || "[]");
    const preferences = JSON.parse(req.body.preferences || "[]");
    const experience = JSON.parse(req.body.experience || "[]");
    const projects = JSON.parse(req.body.projects || "[]");

    // Validation
    if (
        [email, username, password].some(
            (field) => !field || field.trim() === ""
        )
    ) {
        throw new ApiError(400, "Required fields are missing");
    }

    // Existing user check
    const existedUser = await User.findOne({
        $or: [
            { email: email.toLowerCase() },
            { username: username.toLowerCase() }
        ]
    });

    if (existedUser) {
        throw new ApiError(
            409,
            "User with email or username already exists"
        );
    }

    // File paths
    const avatarLocalPath = req.files?.avatar?.[0]?.path;
    const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar is required");
    }

    // Upload images
    const avatar = await uploadOnCloudinary(avatarLocalPath);

    const coverImage = coverImageLocalPath
        ? await uploadOnCloudinary(coverImageLocalPath)
        : null;

    if (!avatar?.url) {
        throw new ApiError(400, "Failed to upload avatar");
    }

    // Create user
    const user = await User.create({
        username: username.toLowerCase().trim(),
        email: email.toLowerCase().trim(),
        password,

        avatar: avatar.url,
        coverImage: coverImage?.url || "",

        location,

        teamRole: team_role,

        techStack,

        preferences,

        hackathonExperience: experience,

        projects
    });

    // Remove sensitive fields
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    if (!createdUser) {
        throw new ApiError(
            500,
            "Something went wrong while registering the user"
        );
    }

    return res.status(201).json(
        new ApiResponse(
            201,
            createdUser,
            "User registered successfully"
        )
    );
});

const loginUser = asyncHandler(async (req, res) => {

    const { email, username, password } = req.body;

    if ((!username && !email) || !password) {
        throw new ApiError(
            400,
            "Username/email and password are required"
        );
    }

    const user = await User.findOne({
        $or: [
            { username },
            { email }
        ]
    });

    if (!user) {
        throw new ApiError(404, "User does not exist");
    }

    const isPasswordValid =
        await user.isPasswordCorrect(password);

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid password");
    }

    const {
        accessToken,
        refreshToken
    } = await generateAccessAndRefreshTokens(user._id);

    const loggedInUser = await User
        .findById(user._id)
        .select("-password -refreshToken");

    const options = {
        httpOnly: true,
        secure: true,
        sameSite: "strict"
    };

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedInUser,
                    accessToken,
                    refreshToken
                },
                "User logged in successfully"
            )
        );
});

const logOutUser = asyncHandler(async (req, res) => {

    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1
            }
        },
        {
            new: true
        }
    );

    const options = {
        httpOnly: true,
        secure: true,
        sameSite: "strict"
    };

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(
            new ApiResponse(
                200,
                {},
                "User logged out successfully"
            )
        );
});

const refreshAccessToken = asyncHandler(async (req, res) => {

    const incomingRefreshToken =
        req.cookies?.refreshToken ||
        req.body?.refreshToken;

    if (!incomingRefreshToken) {
        throw new ApiError(
            401,
            "Refresh token is required"
        );
    }

    try {

        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        );

        const user = await User.findById(
            decodedToken?._id
        );

        if (!user) {
            throw new ApiError(
                401,
                "Invalid refresh token"
            );
        }

        if (
            incomingRefreshToken !== user?.refreshToken
        ) {
            throw new ApiError(
                401,
                "Refresh token expired or used"
            );
        }

        const {
            accessToken,
            refreshToken
        } = await generateAccessAndRefreshTokens(
            user._id
        );

        const options = {
            httpOnly: true,
            secure: true,
            sameSite: "strict"
        };

        return res
            .status(200)
            .cookie(
                "accessToken",
                accessToken,
                options
            )
            .cookie(
                "refreshToken",
                refreshToken,
                options
            )
            .json(
                new ApiResponse(
                    200,
                    {
                        accessToken,
                        refreshToken
                    },
                    "Access token refreshed successfully"
                )
            );

    } catch (error) {

        throw new ApiError(
            401,
            error?.message || "Invalid refresh token"
        );
    }
});

const changeCurrentPassword = asyncHandler(async (req, res) => {

    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
        throw new ApiError(
            400,
            "Old password and new password are required"
        );
    }

    const user = await User.findById(req.user?._id);

    if (!user) {
        throw new ApiError(
            404,
            "User not found"
        );
    }

    const isPasswordCorrect =
        await user.isPasswordCorrect(oldPassword);

    if (!isPasswordCorrect) {
        throw new ApiError(
            401,
            "Old password is incorrect"
        );
    }

    // Prevent same password reuse
    if (oldPassword === newPassword) {
        throw new ApiError(
            400,
            "New password cannot be same as old password"
        );
    }

    user.password = newPassword;

    await user.save();

    return res.status(200).json(
        new ApiResponse(
            200,
            {},
            "Password changed successfully"
        )
    );
});

const getCurrentUser = asyncHandler(async (req, res) => {

    return res.status(200).json(
        new ApiResponse(
            200,
            req.user,
            "Current user fetched successfully"
        )
    );
});

const updateAccountDetails = asyncHandler(async (req, res) => {

    const { fullName, email } = req.body;

    if (!fullName || !email) {
        throw new ApiError(
            400,
            "All fields are required"
        );
    }

    const user = await User.findByIdAndUpdate(

        req.user?._id,

        {
            $set: {
                fullName: fullName.trim(),
                email: email.toLowerCase().trim()
            }
        },

        {
            new: true,
            runValidators: true
        }

    ).select("-password -refreshToken");

    return res.status(200).json(
        new ApiResponse(
            200,
            user,
            "Account details updated successfully"
        )
    );
});

const updateUserAvatar = asyncHandler(async (req, res) => {

    const avatarLocalPath = req.file?.path;

    if (!avatarLocalPath) {
        throw new ApiError(
            400,
            "Avatar file is required"
        );
    }

    const avatar = await uploadOnCloudinary(
        avatarLocalPath
    );

    if (!avatar?.url) {
        throw new ApiError(
            500,
            "Error uploading avatar"
        );
    }

    const user = await User.findByIdAndUpdate(

        req.user?._id,

        {
            $set: {
                avatar: avatar.url
            }
        },

        {
            new: true
        }

    ).select("-password -refreshToken");

    return res.status(200).json(
        new ApiResponse(
            200,
            user,
            "Avatar updated successfully"
        )
    );
});

const updateCoverImage = asyncHandler(async (req, res) => {

    const coverImageLocalPath = req.file?.path;

    if (!coverImageLocalPath) {
        throw new ApiError(
            400,
            "Cover image file is required"
        );
    }

    const coverImage = await uploadOnCloudinary(
        coverImageLocalPath
    );

    if (!coverImage?.url) {
        throw new ApiError(
            500,
            "Error uploading cover image"
        );
    }

    const user = await User.findByIdAndUpdate(

        req.user?._id,

        {
            $set: {
                coverImage: coverImage.url
            }
        },

        {
            new: true
        }

    ).select("-password -refreshToken");

    return res.status(200).json(
        new ApiResponse(
            200,
            user,
            "Cover image updated successfully"
        )
    );
});




export {registerUser, loginUser, logOutUser, refreshAccessToken, changeCurrentPassword, getCurrentUser, updateAccountDetails, asyncHandler,
        updateCoverImage, updateUserAvatar
};

