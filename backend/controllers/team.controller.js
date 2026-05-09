import {Team} from "../models/team.model.js";
import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiResponse} from "../utils/ApiResponse.js";
import {ApiError} from "../utils/ApiError.js";

const createTeam = asyncHandler(async (req, res) => {

    const {
        name,
        description,
        requiredSkills,
        maxMembers,
        hackathonName,
        projectIdea
    } = req.body;

    if (!name) {
        throw new ApiError(
            400,
            "Team name is required"
        );
    }

    const parsedSkills =
        typeof requiredSkills === "string"
            ? JSON.parse(requiredSkills)
            : requiredSkills || [];

    const teamAvatarLocalPath =
        req.files?.teamAvatar?.[0]?.path;

    const bannerImageLocalPath =
        req.files?.bannerImage?.[0]?.path;

    let teamAvatar = "";
    let bannerImage = "";

    if (teamAvatarLocalPath) {

        const uploadedAvatar =
            await uploadOnCloudinary(
                teamAvatarLocalPath
            );

        teamAvatar = uploadedAvatar?.url || "";
    }

    if (bannerImageLocalPath) {

        const uploadedBanner =
            await uploadOnCloudinary(
                bannerImageLocalPath
            );

        bannerImage = uploadedBanner?.url || "";
    }

    const team = await Team.create({

        name: name.trim(),

        description,

        leader: req.user?._id,

        members: [req.user?._id],

        requiredSkills: parsedSkills,

        maxMembers,

        hackathonName,

        projectIdea,

        teamAvatar,

        bannerImage

    });

    return res.status(201).json(
        new ApiResponse(
            201,
            team,
            "Team created successfully"
        )
    );
});

const discoverTeams = asyncHandler(async (req, res) => {

    const {
        skill,
        status,
        hackathonName
    } = req.query;

    const filter = {};

    if (skill) {
        filter.requiredSkills = skill.toLowerCase();
    }

    if (status) {
        filter.status = status;
    }

    if (hackathonName) {
        filter.hackathonName = {
            $regex: hackathonName,
            $options: "i"
        };
    }

    const teams = await Team.find(filter)

        .populate(
            "leader",
            "username avatar"
        )

        .populate(
            "members",
            "username avatar"
        )

        .sort({ createdAt: -1 });

    return res.status(200).json(
        new ApiResponse(
            200,
            teams,
            "Teams fetched successfully"
        )
    );
});

const getTeamById = asyncHandler(async (req, res) => {

    const { teamId } = req.params;

    const team = await Team.findById(teamId)

        .populate(
            "leader",
            "username avatar techStack"
        )

        .populate(
            "members",
            "username avatar techStack"
        );

    if (!team) {
        throw new ApiError(
            404,
            "Team not found"
        );
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            team,
            "Team fetched successfully"
        )
    );
});

const updateTeam = asyncHandler(async (req, res) => {

    const { teamId } = req.params;

    const team = await Team.findById(teamId);

    if (!team) {
        throw new ApiError(
            404,
            "Team not found"
        );
    }

    if (
        team.leader.toString() !==
        req.user?._id.toString()
    ) {
        throw new ApiError(
            403,
            "Only team leader can update"
        );
    }

    const updates = { ...req.body };

    if (updates.requiredSkills) {
        updates.requiredSkills =
            typeof updates.requiredSkills === "string"
                ? JSON.parse(updates.requiredSkills)
                : updates.requiredSkills;
    }

    const teamAvatarLocalPath =
        req.files?.teamAvatar?.[0]?.path;

    const bannerImageLocalPath =
        req.files?.bannerImage?.[0]?.path;

    if (teamAvatarLocalPath) {

        const uploadedAvatar =
            await uploadOnCloudinary(
                teamAvatarLocalPath
            );

        updates.teamAvatar =
            uploadedAvatar?.url;
    }

    if (bannerImageLocalPath) {

        const uploadedBanner =
            await uploadOnCloudinary(
                bannerImageLocalPath
            );

        updates.bannerImage =
            uploadedBanner?.url;
    }

    const updatedTeam =
        await Team.findByIdAndUpdate(

            teamId,

            {
                $set: updates
            },

            {
                new: true,
                runValidators: true
            }

        );

    return res.status(200).json(
        new ApiResponse(
            200,
            updatedTeam,
            "Team updated successfully"
        )
    );
});

const deleteTeam = asyncHandler(async (req, res) => {

    const { teamId } = req.params;

    const { password } = req.body;

    if (!password) {
        throw new ApiError(
            400,
            "Password is required"
        );
    }

    const team = await Team.findById(teamId);

    if (!team) {
        throw new ApiError(
            404,
            "Team not found"
        );
    }

    if (
        team.leader.toString() !==
        req.user?._id.toString()
    ) {
        throw new ApiError(
            403,
            "Only team leader can delete the team"
        );
    }

    const user = await User.findById(
        req.user?._id
    );

    if (!user) {
        throw new ApiError(
            404,
            "User not found"
        );
    }

    const isPasswordCorrect =
        await user.isPasswordCorrect(password);

    if (!isPasswordCorrect) {
        throw new ApiError(
            401,
            "Invalid password"
        );
    }

    await Team.findByIdAndDelete(teamId);

    return res.status(200).json(
        new ApiResponse(
            200,
            {},
            "Team deleted successfully"
        )
    );
});

const joinTeam = asyncHandler(async (req, res) => {

    const { teamId } = req.params;

    const team = await Team.findById(teamId);

    if (!team) {
        throw new ApiError(
            404,
            "Team not found"
        );
    }

    if (team.status === "closed") {
        throw new ApiError(
            400,
            "Team is closed"
        );
    }

    if (
        team.members.some(
            member =>
                member.toString() ===
                req.user?._id.toString()
        )
    ) {
        throw new ApiError(
            400,
            "Already a member"
        );
    }

    if (
        team.members.length >=
        team.maxMembers
    ) {
        throw new ApiError(
            400,
            "Team is full"
        );
    }

    const updatedTeam =
        await Team.findByIdAndUpdate(

            teamId,

            {
                $addToSet: {
                    members: req.user?._id
                }
            },

            {
                new: true
            }

        );

    return res.status(200).json(
        new ApiResponse(
            200,
            updatedTeam,
            "Joined team successfully"
        )
    );
});

const leaveTeam = asyncHandler(async (req, res) => {

    const { teamId } = req.params;

    const team = await Team.findById(teamId);

    if (!team) {
        throw new ApiError(
            404,
            "Team not found"
        );
    }

    if (
        team.leader.toString() ===
        req.user?._id.toString()
    ) {
        throw new ApiError(
            400,
            "Leader cannot leave team"
        );
    }

    team.members = team.members.filter(

        member =>

            member.toString() !==
            req.user?._id.toString()
    );

    await team.save();

    return res.status(200).json(
        new ApiResponse(
            200,
            {},
            "Left team successfully"
        )
    );
});

export {
    createTeam,
    discoverTeams,
    getTeamById,
    deleteTeam,
    updateTeam,
    joinTeam,
    leaveTeam,
}