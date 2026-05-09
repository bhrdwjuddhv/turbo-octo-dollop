import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const generateAccessAndRefreshTokens = async(userId) =>{
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return {accessToken, refreshToken}

    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating refresh and access token")
    }
}

const registerUser = asyncHandler(async (req, res) => {
    const { username, email, password, team_role, location, techStack, experience, preferences, projects } = req.body;

    if ([username, email, password].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "Username, email and password are required");
    }

    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    });

    if (existedUser) {
        throw new ApiError(409, "User with email or username already exists");
    }

    const avatarLocalPath = req.files?.avatar?.[0]?.path;
    const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

    let avatar;
    if (avatarLocalPath) {
        avatar = await uploadOnCloudinary(avatarLocalPath);
    }

    let coverImage;
    if (coverImageLocalPath) {
        coverImage = await uploadOnCloudinary(coverImageLocalPath);
    }

    // parsing arrays if they were sent as stringified JSON or comma-separated
    const parseArray = (data) => {
        if (!data) return [];
        if (Array.isArray(data)) return data;
        try {
            return JSON.parse(data);
        } catch {
            return data.split(',').map(s => s.trim());
        }
    };

    const user = await User.create({
        username: username.toLowerCase(),
        email,
        password,
        avatar: avatar?.url || "",
        coverImage: coverImage?.url || "",
        team_role,
        location,
        techStack: parseArray(techStack),
        experience: parseArray(experience),
        preferences: parseArray(preferences),
        projects: parseArray(projects)
    });

    const createdUser = await User.findById(user._id).select("-password -refreshToken");

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user");
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered successfully")
    );
});

const loginUser = asyncHandler(async (req, res) => {
    const { email, username, password } = req.body;

    if (!username && !email) {
        throw new ApiError(400, "Username or email is required");
    }

    const user = await User.findOne({
        $or: [{ username }, { email }]
    });

    if (!user) {
        throw new ApiError(404, "User does not exist");
    }

    const isPasswordValid = await user.isPasswordCorrect(password);

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid user credentials");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

    const options = {
        httpOnly: true,
        secure: true
    };

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200, 
                { user: loggedInUser, accessToken, refreshToken },
                "User logged In Successfully"
            )
        );
});

const logoutUser = asyncHandler(async(req, res) => {
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
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out"))
})

const getCurrentUser = asyncHandler(async(req, res) => {
    return res
    .status(200)
    .json(new ApiResponse(200, req.user, "Current user fetched successfully"))
})

const getPotentialMatches = asyncHandler(async (req, res) => {

    const {
        techStack,
        location,
        role,
        experienceLevel,
        availability,
        sortBy,
        page = 1,
        limit = 10
    } = req.query;

    const filter = {};

    // Exclude current user
    filter._id = {
        $ne: req.user?._id
    };

    // Tech stack filter
    if (techStack) {

        const skillsArray =
            techStack.split(",");

        filter.techStack = {
            $in: skillsArray.map(
                skill =>
                    skill.toLowerCase().trim()
            )
        };
    }

    // Location filter
    if (location) {

        filter.location = {
            $regex: location,
            $options: "i"
        };
    }

    // Role filter
    if (role) {

        filter.teamRole = {
            $regex: role,
            $options: "i"
        };
    }

    // Experience filter
    if (experienceLevel) {

        filter.experienceLevel =
            experienceLevel;
    }

    // Availability filter
    if (availability !== undefined) {

        filter.availability =
            availability === "true";
    }

    // Sorting
    let sortOption = {
        createdAt: -1
    };

    if (sortBy === "oldest") {

        sortOption = {
            createdAt: 1
        };
    }

    // Pagination
    const skip =
        (Number(page) - 1) *
        Number(limit);

    const users = await User.find(filter)

        .select(
            "-password -refreshToken"
        )

        .sort(sortOption)

        .skip(skip)

        .limit(Number(limit));

    // Total count
    const totalUsers =
        await User.countDocuments(filter);

    return res.status(200).json(

        new ApiResponse(

            200,

            {
                users,

                pagination: {

                    totalUsers,

                    currentPage:
                        Number(page),

                    totalPages:
                        Math.ceil(
                            totalUsers /
                            Number(limit)
                        ),

                    limit:
                        Number(limit)
                }
            },

            "Users fetched successfully"
        )
    );
});

export {
    registerUser,
    loginUser,
    logoutUser,
    getCurrentUser,
    getPotentialMatches
}
