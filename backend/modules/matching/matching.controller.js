import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { ApiError } from "../../utils/ApiError.js";
import { User } from "../auth/user.model.js";
import { Team } from "../team/team.model.js";
import {
    rankUsersForUser,
    rankTeamsForUser,
    rankUsersForTeam,
    explainUserForUser,
    explainUserForTeam,
} from "../../services/matching.service.js";

const PUBLIC_USER_FIELDS =
    "username fullName avatar coverImage bio location techStack experience preferences team_role experienceLevel availability workingHours socialLinks";

// GET /api/v1/matching/users
// Ranked teammate suggestions for the logged-in user.
const getMatchedUsers = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10 } = req.query;

    const currentUser = await User.findById(req.user?._id);
    if (!currentUser) {
        throw new ApiError(404, "Current user not found");
    }

    const candidates = await User.find({ _id: { $ne: currentUser._id } }).select(
        PUBLIC_USER_FIELDS
    );

    const ranked = rankUsersForUser(currentUser, candidates);

    const skip = (Number(page) - 1) * Number(limit);
    const paged = ranked.slice(skip, skip + Number(limit));

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                matches: paged.map(({ user, score, breakdown }) => ({
                    user,
                    matchScore: score,
                    matchBreakdown: breakdown,
                    matchExplanation: explainUserForUser(breakdown),
                })),
                pagination: {
                    totalMatches: ranked.length,
                    currentPage: Number(page),
                    totalPages: Math.ceil(ranked.length / Number(limit)),
                    limit: Number(limit),
                },
            },
            "Matched users fetched successfully"
        )
    );
});

// GET /api/v1/matching/teams
// Ranked "teams you should join" suggestions for the logged-in user.
const getMatchedTeams = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10 } = req.query;

    const currentUser = await User.findById(req.user?._id);
    if (!currentUser) {
        throw new ApiError(404, "Current user not found");
    }

    const openTeams = await Team.find({
        status: "open",
        members: { $ne: currentUser._id },
        $expr: { $lt: [{ $size: "$members" }, "$maxMembers"] },
    }).populate("members", "team_role location techStack experienceLevel availability workingHours _id");

    const teamsWithMembers = openTeams.map((team) => ({
        team,
        memberDocs: team.members,
    }));

    const ranked = rankTeamsForUser(currentUser, teamsWithMembers);

    const skip = (Number(page) - 1) * Number(limit);
    const paged = ranked.slice(skip, skip + Number(limit));

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                matches: paged.map(({ team, score, breakdown }) => ({
                    team,
                    matchScore: score,
                    matchBreakdown: breakdown,
                    matchExplanation: explainUserForTeam(breakdown),
                })),
                pagination: {
                    totalMatches: ranked.length,
                    currentPage: Number(page),
                    totalPages: Math.ceil(ranked.length / Number(limit)),
                    limit: Number(limit),
                },
            },
            "Matched teams fetched successfully"
        )
    );
});

// GET /api/v1/matching/teams/:teamId/candidates
// Ranked "who should we invite" suggestions - leader only.
const getMatchedCandidatesForTeam = asyncHandler(async (req, res) => {
    const { teamId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const team = await Team.findById(teamId).populate(
        "members",
        "team_role location techStack experienceLevel availability workingHours _id"
    );

    if (!team) {
        throw new ApiError(404, "Team not found");
    }

    if (team.leader.toString() !== req.user?._id.toString()) {
        throw new ApiError(403, "Only the team leader can view invite suggestions");
    }

    const memberIds = team.members.map((m) => m._id.toString());

    const candidates = await User.find({
        _id: { $nin: [...memberIds, team.leader.toString()] },
    }).select(
        "username fullName avatar bio location techStack preferences experience team_role experienceLevel availability workingHours"
    );

    const ranked = rankUsersForTeam(team, team.members, candidates);

    const skip = (Number(page) - 1) * Number(limit);
    const paged = ranked.slice(skip, skip + Number(limit));

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                matches: paged.map(({ user, score, breakdown }) => ({
                    user,
                    matchScore: score,
                    matchBreakdown: breakdown,
                    matchExplanation: explainUserForTeam(breakdown),
                })),
                pagination: {
                    totalMatches: ranked.length,
                    currentPage: Number(page),
                    totalPages: Math.ceil(ranked.length / Number(limit)),
                    limit: Number(limit),
                },
            },
            "Matched candidates fetched successfully"
        )
    );
});

export { getMatchedUsers, getMatchedTeams, getMatchedCandidatesForTeam };