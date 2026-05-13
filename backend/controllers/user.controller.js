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

const registerUser = async (req, res, next) => {
    try {
        console.log("Registration process started...");
        const { username, email, password, team_role, location, techStack, experience, preferences, projects, socialLinks } = req.body;
        console.log("Request Body received:", { username, email, hasPassword: !!password });

        if ([username, email, password].some((field) => !field || field.trim() === "")) {
            return res.status(400).json(new ApiResponse(400, null, "Username, email and password are required"));
        }

        const existedUser = await User.findOne({
            $or: [{ username }, { email }]
        });

        if (existedUser) {
            return res.status(409).json(new ApiResponse(409, null, "User with email or username already exists"));
        }

        console.log("Checking for files...");
        const avatarLocalPath = req.files?.avatar?.[0]?.path;
        const coverImageLocalPath = req.files?.coverImage?.[0]?.path;
        console.log("Local paths:", { avatarLocalPath, coverImageLocalPath });

        let avatar;
        if (avatarLocalPath) {
            avatar = await uploadOnCloudinary(avatarLocalPath);
            console.log("Avatar uploaded:", !!avatar);
        }

        let coverImage;
        if (coverImageLocalPath) {
            coverImage = await uploadOnCloudinary(coverImageLocalPath);
            console.log("Cover image uploaded:", !!coverImage);
        }

        const parseArray = (data) => {
            if (!data) return [];
            if (Array.isArray(data)) return data;
            try {
                return JSON.parse(data);
            } catch {
                return typeof data === 'string' ? data.split(',').map(s => s.trim()) : [];
            }
        };

        console.log("Creating user in DB...");
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
            projects: parseArray(projects),
            socialLinks: typeof socialLinks === 'string' ? JSON.parse(socialLinks) : socialLinks
        });

        const createdUser = await User.findById(user._id).select("-password -refreshToken");

        if (!createdUser) {
            return res.status(500).json(new ApiResponse(500, null, "Something went wrong while registering the user"));
        }

        console.log("Registration successful for:", createdUser.username);
        return res.status(201).json(
            new ApiResponse(201, createdUser, "User registered successfully")
        );

    } catch (error) {
        console.error("CRITICAL REGISTRATION ERROR:", error);
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Internal Server Error during registration"
        });
    }
};

const loginUser = async (req, res, next) => {
    try {
        const { email, username, password } = req.body;
        console.log("Login attempt:", { identifier: email || username });

        if (!username && !email) {
            return res.status(400).json(new ApiResponse(400, null, "Username or email is required"));
        }

        const user = await User.findOne({
            $or: [{ username }, { email }]
        });

        if (!user) {
            return res.status(404).json(new ApiResponse(404, null, "User does not exist"));
        }

        const isPasswordValid = await user.isPasswordCorrect(password);

        if (!isPasswordValid) {
            return res.status(401).json(new ApiResponse(401, null, "Invalid user credentials"));
        }

        const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

        const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

        const options = {
            httpOnly: true,
            secure: true
        };

        console.log("Login successful for:", loggedInUser.username);
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
    } catch (error) {
        console.error("LOGIN ERROR:", error);
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Internal Server Error during login"
        });
    }
};

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

const updateAccountDetails = asyncHandler(async(req, res) => {
    const { 
        fullName, 
        bio, 
        location, 
        team_role, 
        techStack, 
        experience, 
        projects, 
        socialLinks 
    } = req.body;

    const parseArray = (data) => {
        if (!data) return [];
        if (Array.isArray(data)) return data;
        try {
            return JSON.parse(data);
        } catch {
            return data.split(',').map(s => s.trim());
        }
    };

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                fullName,
                bio,
                location,
                team_role,
                techStack: parseArray(techStack),
                experience: parseArray(experience),
                projects: parseArray(projects),
                socialLinks: typeof socialLinks === 'string' ? JSON.parse(socialLinks) : socialLinks
            }
        },
        { new: true }
    ).select("-password -refreshToken");

    return res
    .status(200)
    .json(new ApiResponse(200, user, "Account details updated successfully"));
})

export {
    registerUser,
    loginUser,
    logoutUser,
    getCurrentUser,
    getPotentialMatches,
    updateAccountDetails
}
