// backend/services/badges.service.js
//
// Badges are computed on-the-fly every time they're requested, from a
// user's current reputation stats + role + experience level. There is no
// separate Badges collection and no "awarded on X date" history - a badge
// simply reflects current state, so it can't go stale or need migration
// when the underlying rules change. If you want persistent award history
// later, that's a deliberate separate feature, not a tweak to this file.

const MIN_OPEN_SOURCE_FOR_BADGE = 2;
const MIN_COMMUNITY_ACTIVITY_FOR_BADGE = 15;
const MIN_HACKATHONS_FOR_MENTOR = 3;

const AI_ROLES = ["ML Engineer", "Data Scientist", "Data Engineer"];
const AI_SKILLS = [
    "tensorflow", "pytorch", "scikit-learn", "keras", "langchain",
    "huggingface transformers", "computer vision", "natural language processing",
];
const DESIGN_ROLES = ["UI/UX Designer", "Product Designer"];

function computeBadges(user, reputation, isCurrentlyLeader) {
    const badges = [];
    const level = user.experienceLevel;
    const isSenior = level === "Advanced" || level === "Expert";

    if (reputation.hackathonsWon >= 1) {
        badges.push({
            id: "hackathon_winner",
            label: "Hackathon Winner",
            description: "Won at least one hackathon on the platform.",
        });
    }

    if (user.team_role === "Frontend Developer" && isSenior) {
        badges.push({
            id: "top_frontend",
            label: "Top Frontend Developer",
            description: "Advanced+ experience as a Frontend Developer.",
        });
    }

    const aiSkillHits = (user.techStack || []).filter((s) =>
        AI_SKILLS.includes(String(s).toLowerCase())
    ).length;
    if ((AI_ROLES.includes(user.team_role) && isSenior) || aiSkillHits >= 3) {
        badges.push({
            id: "ai_expert",
            label: "AI Expert",
            description: "Strong AI/ML role or skill set.",
        });
    }

    if (DESIGN_ROLES.includes(user.team_role) && isSenior) {
        badges.push({
            id: "uiux_specialist",
            label: "UI/UX Specialist",
            description: "Advanced+ experience as a designer.",
        });
    }

    if (reputation.openSourceContributions >= MIN_OPEN_SOURCE_FOR_BADGE) {
        badges.push({
            id: "open_source_contributor",
            label: "Open Source Contributor",
            description: "Multiple open-source contributions noted in their experience log.",
        });
    }

    if (isCurrentlyLeader) {
        badges.push({
            id: "team_leader",
            label: "Team Leader",
            description: "Currently leading a team.",
        });
    }

    if (level === "Expert" && reputation.hackathonsParticipated >= MIN_HACKATHONS_FOR_MENTOR) {
        badges.push({
            id: "mentor",
            label: "Mentor",
            description: "Expert-level with significant hackathon experience.",
        });
    }

    if (reputation.communityActivity >= MIN_COMMUNITY_ACTIVITY_FOR_BADGE) {
        badges.push({
            id: "community_builder",
            label: "Community Builder",
            description: "Highly active creating teams and sending/accepting invites.",
        });
    }

    return badges;
}

export { computeBadges };