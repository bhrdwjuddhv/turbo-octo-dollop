// backend/services/reputation.service.js
//
// Reputation is entirely derived from real platform activity - no
// self-reported honor-system fields to keep in sync. This is what makes
// it worth trusting:
//   - hackathonsParticipated / hackathonsWon -> counted from Team
//     membership + the leader-set Team.result field
//   - completedProjects                      -> length of User.projects
//   - openSourceContributions                -> heuristic scan of
//                                                User.experience entries
//   - reliability                            -> % of received invites the
//                                                user actually responded
//                                                to (accept or reject),
//                                                instead of leaving pending
//   - communityActivity                      -> weighted usage score from
//                                                teams led / invites sent
//                                                / invites accepted

import { Team } from "../modules/team/team.model.js";
import { Invite } from "../modules/invite/invite.model.js";

// No GitHub API integration by design (keeps this dependency-free and
// synchronous-friendly) - this is a heuristic proxy, not a verified count.
function countOpenSourceMentions(experience = []) {
    return (experience || []).filter((e) => /open[\s-]?source|contribut/i.test(e)).length;
}

async function computeReputation(user) {
    const userId = user._id;

    const teams = await Team.find({ members: userId }).select("hackathonName result leader");

    const hackathonNames = new Set(
        teams.filter((t) => t.hackathonName).map((t) => t.hackathonName)
    );
    const hackathonsParticipated = hackathonNames.size;
    const hackathonsWon = teams.filter((t) => t.result === "winner").length;
    const teamsLed = teams.filter((t) => String(t.leader) === String(userId)).length;

    const completedProjects = (user.projects || []).length;
    const openSourceContributions = countOpenSourceMentions(user.experience || []);

    const invitesReceived = await Invite.find({ receiver: userId }).select("status");
    const totalReceived = invitesReceived.length;
    const respondedCount = invitesReceived.filter((i) => i.status !== "pending").length;
    const reliability = totalReceived === 0 ? 100 : Math.round((respondedCount / totalReceived) * 100);

    const invitesSent = await Invite.countDocuments({ sender: userId });
    const invitesAccepted = invitesReceived.filter((i) => i.status === "accepted").length;
    const communityActivity = teamsLed * 3 + invitesSent * 1 + invitesAccepted * 2;

    // Simple weighted point formula, capped at 100. Not a scientific
    // model - just enough to give a directional "trust" number.
    const reputationScore = Math.min(
        100,
        Math.round(
            hackathonsParticipated * 6 +
            hackathonsWon * 12 +
            Math.min(completedProjects, 5) * 3 +
            Math.min(openSourceContributions, 5) * 2 +
            reliability * 0.25 +
            Math.min(communityActivity, 20) * 1
        )
    );

    return {
        hackathonsParticipated,
        hackathonsWon,
        completedProjects,
        openSourceContributions,
        reliability,
        communityActivity,
        teamsLed,
        reputationScore,
    };
}

export { computeReputation };