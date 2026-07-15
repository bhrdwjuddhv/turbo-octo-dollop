import {Team} from "./team.model.js";
import {JoinRequest} from "./joinRequest.model.js";
import {User} from "../auth/user.model.js";
import {asyncHandler} from "../../utils/asyncHandler.js";
import {ApiResponse} from "../../utils/ApiResponse.js";
import {ApiError} from "../../utils/ApiError.js";
import {uploadOnCloudinary} from "../../utils/cloudinary.js";

// Fields safe to expose for a member/candidate list.
const MEMBER_FIELDS = "username fullName avatar team_role";

const isOwner = (team, userId) =>
    team.leader.toString() === userId?.toString();

const isMember = (team, userId) =>
    team.members.some((m) => m.toString() === userId?.toString());

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

// POST /:teamId/join
// Request + approval flow: creates a PENDING join request instead of adding
// the user to the team directly. The owner accepts/rejects it later.
const requestToJoin = asyncHandler(async (req, res) => {

    const { teamId } = req.params;
    const { note } = req.body;

    const team = await Team.findById(teamId);

    if (!team) {
        throw new ApiError(404, "Team not found");
    }

    if (isOwner(team, req.user?._id)) {
        throw new ApiError(400, "You already own this team");
    }

    if (isMember(team, req.user?._id)) {
        throw new ApiError(400, "You are already a member of this team");
    }

    if (team.status === "closed") {
        throw new ApiError(400, "This team is not accepting new members");
    }

    // No second pending request from the same user for the same team.
    const existing = await JoinRequest.findOne({
        teamId,
        userId: req.user?._id,
        status: "pending"
    });

    if (existing) {
        throw new ApiError(400, "You already have a pending request for this team");
    }

    const request = await JoinRequest.create({
        teamId,
        userId: req.user?._id,
        note: note?.trim() || ""
    });

    return res.status(201).json(
        new ApiResponse(201, request, "Join request sent")
    );
});

// GET /:teamId/dashboard
// Team + populated members for everyone; pending join requests only for the owner.
const getTeamDashboard = asyncHandler(async (req, res) => {

    const { teamId } = req.params;

    const team = await Team.findById(teamId)
        .populate("leader", MEMBER_FIELDS)
        .populate("members", MEMBER_FIELDS);

    if (!team) {
        throw new ApiError(404, "Team not found");
    }

    const owner = isOwner(team, req.user?._id);

    // Only the owner ever sees who has applied.
    const pendingRequests = owner
        ? await JoinRequest.find({ teamId, status: "pending" })
            .populate("userId", MEMBER_FIELDS)
            .sort({ createdAt: -1 })
        : [];

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                team,
                isOwner: owner,
                isMember: owner || isMember(team, req.user?._id),
                pendingRequests
            },
            "Dashboard fetched successfully"
        )
    );
});

// POST /:teamId/requests/:requestId/respond   body: { action: "accept" | "reject" }
// Owner-only. Accepting adds the requester to members.
const respondToJoinRequest = asyncHandler(async (req, res) => {

    const { teamId, requestId } = req.params;
    const { action } = req.body;

    if (!["accept", "reject"].includes(action)) {
        throw new ApiError(400, "action must be 'accept' or 'reject'");
    }

    const team = await Team.findById(teamId);

    if (!team) {
        throw new ApiError(404, "Team not found");
    }

    if (!isOwner(team, req.user?._id)) {
        throw new ApiError(403, "Only the team owner can respond to requests");
    }

    const request = await JoinRequest.findOne({ _id: requestId, teamId });

    if (!request) {
        throw new ApiError(404, "Join request not found");
    }

    if (request.status !== "pending") {
        throw new ApiError(400, "This request has already been answered");
    }

    if (action === "accept") {
        if (!isMember(team, request.userId)) {
            if (team.members.length >= team.maxMembers) {
                throw new ApiError(400, "Team is full");
            }
            team.members.push(request.userId);
            await team.save();
        }
        request.status = "accepted";
    } else {
        request.status = "rejected";
    }

    await request.save();

    return res.status(200).json(
        new ApiResponse(200, request, `Request ${request.status}`)
    );
});

// DELETE /:teamId/members/:userId   Owner-only. Cannot remove the owner.
const removeMember = asyncHandler(async (req, res) => {

    const { teamId, userId } = req.params;

    const team = await Team.findById(teamId);

    if (!team) {
        throw new ApiError(404, "Team not found");
    }

    if (!isOwner(team, req.user?._id)) {
        throw new ApiError(403, "Only the team owner can remove members");
    }

    if (team.leader.toString() === userId) {
        throw new ApiError(400, "The owner cannot be removed");
    }

    team.members = team.members.filter((m) => m.toString() !== userId);
    await team.save();

    return res.status(200).json(
        new ApiResponse(200, {}, "Member removed")
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
    getTeamDashboard,
    deleteTeam,
    updateTeam,
    requestToJoin,
    respondToJoinRequest,
    removeMember,
    leaveTeam,
}