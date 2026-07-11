import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { ApiError } from "../../utils/ApiError.js";
import { User } from "../auth/user.model.js";
import { Team } from "../team/team.model.js";
import { computeReputation } from "../../services/reputation.service.js";
import { computeBadges } from "../../services/badges.service.js";

// GET /api/v1/reputation/:userId
// Public-within-the-platform reputation stats + earned badges for any user.
const getReputation = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    const user = await User.findById(userId).select(
        "username fullName avatar team_role experienceLevel techStack experience projects"
    );

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const reputation = await computeReputation(user);
    const isCurrentlyLeader = await Team.exists({ leader: userId });
    const badges = computeBadges(user, reputation, !!isCurrentlyLeader);

    return res.status(200).json(
        new ApiResponse(
            200,
            { reputation, badges },
            "Reputation fetched successfully"
        )
    );
});

export { getReputation };