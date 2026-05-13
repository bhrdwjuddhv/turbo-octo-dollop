import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiResponse} from "../utils/ApiResponse.js";
import {Invite} from "../models/invite.model.js";
import {ApiError} from "../utils/ApiError.js";


const sendInvite = asyncHandler(async (req, res) => {

    const { receiverId, teamId } = req.body;

    if (!receiverId || !teamId) {
        throw new ApiError(
            400,
            "Receiver and team are required"
        );
    }

    const team = await Team.findById(teamId);

    if (!team) {
        throw new ApiError(
            404,
            "Team not found"
        );
    }

    // Only leader can invite
    if (
        team.leader.toString() !==
        req.user?._id.toString()
    ) {
        throw new ApiError(
            403,
            "Only team leader can send invites"
        );
    }

    // Prevent self invite
    if (
        receiverId ===
        req.user?._id.toString()
    ) {
        throw new ApiError(
            400,
            "Cannot invite yourself"
        );
    }

    // Prevent duplicate invites
    const existingInvite =
        await Invite.findOne({

            sender: req.user?._id,

            receiver: receiverId,

            team: teamId,

            status: "pending"
        });

    if (existingInvite) {
        throw new ApiError(
            400,
            "Invite already sent"
        );
    }

    // Prevent inviting existing members
    if (
        team.members.some(

            member =>

                member.toString() ===
                receiverId
        )
    ) {
        throw new ApiError(
            400,
            "User already in team"
        );
    }

    const invite = await Invite.create({

        sender: req.user?._id,

        receiver: receiverId,

        team: teamId

    });

    return res.status(201).json(

        new ApiResponse(
            201,
            invite,
            "Invite sent successfully"
        )
    );
});

const acceptInvite = asyncHandler(async (req, res) => {

    const { inviteId } = req.params;

    const invite = await Invite.findById(inviteId)

        .populate("team");

    if (!invite) {
        throw new ApiError(
            404,
            "Invite not found"
        );
    }

    // Only receiver can accept
    if (
        invite.receiver.toString() !==
        req.user?._id.toString()
    ) {
        throw new ApiError(
            403,
            "Unauthorized action"
        );
    }

    if (invite.status !== "pending") {
        throw new ApiError(
            400,
            "Invite already handled"
        );
    }

    // Check team capacity
    if (
        invite.team.members.length >=
        invite.team.maxMembers
    ) {
        throw new ApiError(
            400,
            "Team is full"
        );
    }

    invite.status = "accepted";

    await invite.save();

    await Team.findByIdAndUpdate(

        invite.team._id,

        {
            $addToSet: {
                members: req.user?._id
            }
        }
    );

    return res.status(200).json(

        new ApiResponse(
            200,
            {},
            "Invite accepted successfully"
        )
    );
});

const rejectInvite = asyncHandler(async (req, res) => {

    const { inviteId } = req.params;

    const invite = await Invite.findById(inviteId);

    if (!invite) {
        throw new ApiError(
            404,
            "Invite not found"
        );
    }

    if (
        invite.receiver.toString() !==
        req.user?._id.toString()
    ) {
        throw new ApiError(
            403,
            "Unauthorized action"
        );
    }

    invite.status = "rejected";

    await invite.save();

    return res.status(200).json(

        new ApiResponse(
            200,
            {},
            "Invite rejected successfully"
        )
    );
});

const getAllInvites = asyncHandler(async (req, res) => {

    const invites = await Invite.find({

        receiver: req.user?._id,

        status: "pending"

    })

        .populate(
            "sender",
            "username avatar"
        )

        .populate(
            "team",
            "name teamAvatar"
        )

        .sort({ createdAt: -1 });

    return res.status(200).json(

        new ApiResponse(
            200,
            invites,
            "Invites fetched successfully"
        )
    );
});

export {
    sendInvite,
    acceptInvite,
    rejectInvite,
    getAllInvites,
}