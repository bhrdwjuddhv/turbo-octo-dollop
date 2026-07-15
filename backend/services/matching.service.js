// backend/services/matching.service.js
//
// No ML — deterministic weighted scoring based on skills, roles,
// experience, preferences, location, availability, working hours, and
// prior hackathon experience. Every score comes with a `breakdown` (raw
// 0-1 factors) and an `explanation` (plain-English reasons) generated
// from that same breakdown — see explainUserForUser / explainUserForTeam.

import { EXPERIENCE_LEVELS } from "../constants/techStack.constants.js";

// Groups roles into broader categories so we can reward complementary
// (not identical) skillsets when matching two people, and reward filling
// a category gap when matching a person to a team.
const ROLE_CATEGORY = {
    "Frontend Developer": "frontend",
    "Backend Developer": "backend",
    "Full Stack Developer": "fullstack",
    "Mobile Developer (Flutter)": "mobile",
    "Mobile Developer (React Native)": "mobile",
    "iOS Developer": "mobile",
    "Android Developer": "mobile",
    "ML Engineer": "data_ai",
    "Data Scientist": "data_ai",
    "Data Engineer": "data_ai",
    "DevOps Engineer": "devops",
    "Cloud Engineer": "devops",
    "Blockchain Developer": "blockchain",
    "Game Developer": "gamedev",
    "UI/UX Designer": "design",
    "Product Designer": "design",
    "Product Manager": "product",
    "QA Engineer": "qa",
    "Security Engineer": "security",
    "AR/VR Developer": "gamedev",
    "Embedded Systems Engineer": "hardware",
    "Technical Writer": "product",
};

const roleCategory = (role) => ROLE_CATEGORY[role] || "other";

const round2 = (n) => Math.round(n * 100) / 100;

const expLevelIndex = (level) => {
    const idx = EXPERIENCE_LEVELS.indexOf(level);
    return idx === -1 ? 1 : idx; // default -> Intermediate
};

function jaccard(a = [], b = []) {
    const setA = new Set((a || []).map((x) => String(x).toLowerCase()));
    const setB = new Set((b || []).map((x) => String(x).toLowerCase()));
    if (setA.size === 0 && setB.size === 0) return 0;
    let intersection = 0;
    for (const item of setA) if (setB.has(item)) intersection++;
    const union = new Set([...setA, ...setB]).size;
    return union === 0 ? 0 : intersection / union;
}

function extractCountry(location = "") {
    const parts = (location || "").split(",");
    return parts.length > 1
        ? parts[parts.length - 1].trim().toLowerCase()
        : (location || "").trim().toLowerCase();
}

// --- Phase 4 additions -----------------------------------------------

// "Flexible / Anytime" is treated as compatible with everything. Missing
// data on either side gets a neutral-leaning score rather than penalizing
// either person for not having set a preference yet.
function workingHoursMatch(a, b) {
    if (!a || !b) return 0.6;
    if (a === "Flexible / Anytime" || b === "Flexible / Anytime") return 1;
    return a === b ? 1 : 0.3;
}

// Lightweight, dependency-free proxy for "has hackathon experience" -
// counts free-text `experience` entries that mention "hackathon" (the
// seed data and Signup's Experience step both produce entries like
// "Winner - college-level hackathon" or "3+ hackathons participated").
// This intentionally does NOT query the DB for the real, authoritative
// hackathonsParticipated count (see services/reputation.service.js) -
// doing so inside a per-candidate scoring loop would mean an extra query
// per candidate. The reputation service is the source of truth for
// profile display; this heuristic is only for fast, synchronous ranking.
function hackathonExperienceHits(experience = []) {
    return (experience || []).filter((e) => /hackathon/i.test(e)).length;
}

function hackathonExperienceProximity(aExp = [], bExp = []) {
    const a = Math.min(hackathonExperienceHits(aExp), 5);
    const b = Math.min(hackathonExperienceHits(bExp), 5);
    if (a === 0 && b === 0) return 0.5; // neither has listed any - neutral
    const diff = Math.abs(a - b);
    return Math.max(0, 1 - diff / 5);
}

// -----------------------------------------------------------------------

/**
 * Score how good a teammate match `candidate` is for `currentUser`.
 * Weights: techOverlap 30%, roleComplementarity 15%, preferenceOverlap 10%,
 * experienceProximity 10%, locationProximity 5%, availability 5%,
 * workingHoursCompatibility 15%, hackathonExperienceProximity 10%.
 */
function scoreUserForUser(currentUser, candidate) {
    const techOverlap = jaccard(currentUser.techStack, candidate.techStack);
    const prefOverlap = jaccard(currentUser.preferences, candidate.preferences);

    const sameCategory =
        roleCategory(currentUser.team_role) === roleCategory(candidate.team_role);
    const roleComplementarity = sameCategory ? 0.3 : 1; // reward different specialities

    const levelDiff = Math.abs(
        expLevelIndex(currentUser.experienceLevel) - expLevelIndex(candidate.experienceLevel)
    );
    const experienceProximity = Math.max(0, 1 - levelDiff / (EXPERIENCE_LEVELS.length - 1));

    const currentCountry = extractCountry(currentUser.location);
    const sameCountry = currentCountry !== "" && currentCountry === extractCountry(candidate.location);
    const locationProximity = sameCountry ? 1 : 0.3;

    const availabilityScore = candidate.availability === false ? 0 : 1;

    const workingHoursCompatibility = workingHoursMatch(currentUser.workingHours, candidate.workingHours);
    const hackathonExperience = hackathonExperienceProximity(currentUser.experience, candidate.experience);

    const score =
        techOverlap * 0.30 +
        roleComplementarity * 0.15 +
        prefOverlap * 0.10 +
        experienceProximity * 0.10 +
        locationProximity * 0.05 +
        availabilityScore * 0.05 +
        workingHoursCompatibility * 0.15 +
        hackathonExperience * 0.10;

    return {
        score: Math.round(score * 100),
        breakdown: {
            techOverlap: round2(techOverlap),
            roleComplementarity: round2(roleComplementarity),
            preferenceOverlap: round2(prefOverlap),
            experienceProximity: round2(experienceProximity),
            locationProximity: round2(locationProximity),
            availabilityScore,
            workingHoursCompatibility: round2(workingHoursCompatibility),
            hackathonExperienceProximity: round2(hackathonExperience),
        },
    };
}

/**
 * Score how good `candidate` is for `team`, given the team's current
 * `memberDocs` (should include the leader).
 * Weights: requiredSkillOverlap 28%, skillGapCoverage 20%, roleDiversity 12%,
 * preferenceAlignment 8%, locationProximity 4%, experienceScore 4%,
 * availability 4%, workingHoursCompatibility 12%, hackathonExperience 8%.
 */
function scoreUserForTeam(candidate, team, memberDocs = []) {
    const requiredSkills = (team.requiredSkills || []).map((s) => s.toLowerCase());
    const candidateSkills = (candidate.techStack || []).map((s) => s.toLowerCase());

    const requiredSkillOverlap = jaccard(candidateSkills, requiredSkills);

    const coveredSkills = new Set();
    memberDocs.forEach((m) => (m.techStack || []).forEach((s) => coveredSkills.add(s.toLowerCase())));
    const uncoveredSkills = requiredSkills.filter((s) => !coveredSkills.has(s));
    const skillGapCoverage =
        uncoveredSkills.length === 0
            ? requiredSkillOverlap
            : uncoveredSkills.filter((s) => candidateSkills.includes(s)).length / uncoveredSkills.length;

    const memberCategories = new Set(memberDocs.map((m) => roleCategory(m.team_role)));
    const roleDiversity = memberCategories.has(roleCategory(candidate.team_role)) ? 0.3 : 1;

    const teamThemeText = `${team.hackathonName || ""} ${team.projectIdea || ""} ${team.description || ""}`.toLowerCase();
    const prefHits = (candidate.preferences || []).filter((p) => teamThemeText.includes(p.toLowerCase())).length;
    const preferenceAlignment = Math.min(1, prefHits / 2);

    const leaderDoc = memberDocs.find((m) => String(m._id) === String(team.leader)) || memberDocs[0];
    const teamCountry = leaderDoc ? extractCountry(leaderDoc.location) : "";
    const sameCountry = teamCountry !== "" && extractCountry(candidate.location) === teamCountry;
    const locationProximity = sameCountry ? 1 : 0.4;

    const experienceScore = expLevelIndex(candidate.experienceLevel) >= 1 ? 1 : 0.5;

    const availabilityScore = candidate.availability === false ? 0 : 1;

    const workingHoursCompatibility = workingHoursMatch(
        leaderDoc?.workingHours,
        candidate.workingHours
    );

    const memberExperienceHits = memberDocs.length
        ? memberDocs.reduce((sum, m) => sum + hackathonExperienceHits(m.experience), 0) / memberDocs.length
        : 0;
    const candidateExperienceHits = hackathonExperienceHits(candidate.experience);
    const hackathonExperience = Math.max(
        0,
        1 - Math.abs(candidateExperienceHits - memberExperienceHits) / 5
    );

    const score =
        requiredSkillOverlap * 0.28 +
        skillGapCoverage * 0.20 +
        roleDiversity * 0.12 +
        preferenceAlignment * 0.08 +
        locationProximity * 0.04 +
        experienceScore * 0.04 +
        availabilityScore * 0.04 +
        workingHoursCompatibility * 0.12 +
        hackathonExperience * 0.08;

    return {
        score: Math.round(score * 100),
        breakdown: {
            requiredSkillOverlap: round2(requiredSkillOverlap),
            skillGapCoverage: round2(skillGapCoverage),
            roleDiversity: round2(roleDiversity),
            preferenceAlignment: round2(preferenceAlignment),
            locationProximity: round2(locationProximity),
            experienceScore,
            availabilityScore,
            workingHoursCompatibility: round2(workingHoursCompatibility),
            hackathonExperienceProximity: round2(hackathonExperience),
        },
    };
}

// --- Phase 4: plain-English explanations off the breakdown -------------

function explainUserForUser(breakdown) {
    const lines = [];

    if (breakdown.techOverlap >= 0.5) {
        lines.push(`Strong tech-stack overlap (${Math.round(breakdown.techOverlap * 100)}%).`);
    } else if (breakdown.techOverlap > 0) {
        lines.push(`Some shared technologies (${Math.round(breakdown.techOverlap * 100)}% overlap).`);
    } else {
        lines.push("No shared tech stack listed yet.");
    }

    lines.push(
        breakdown.roleComplementarity === 1
            ? "Complementary role - brings a specialty your team may be missing."
            : "Similar role/specialty to yours."
    );

    if (breakdown.preferenceOverlap >= 0.34) {
        lines.push("Shares several of your hackathon interests.");
    }

    if (breakdown.experienceProximity >= 0.66) {
        lines.push("Comparable experience level.");
    }

    if (breakdown.locationProximity === 1) {
        lines.push("Based in the same region as you.");
    }

    if (breakdown.workingHoursCompatibility >= 1) {
        lines.push("Compatible working hours.");
    } else if (breakdown.workingHoursCompatibility < 0.5) {
        lines.push("Different preferred working hours - may need to coordinate on timing.");
    }

    if (breakdown.hackathonExperienceProximity >= 0.8) {
        lines.push("Similar level of hackathon experience.");
    }

    if (breakdown.availabilityScore === 0) {
        lines.push("Currently marked unavailable.");
    }

    return lines;
}

function explainUserForTeam(breakdown) {
    const lines = [];

    if (breakdown.requiredSkillOverlap >= 0.5) {
        lines.push(`Strong overlap with required skills (${Math.round(breakdown.requiredSkillOverlap * 100)}%).`);
    } else if (breakdown.requiredSkillOverlap > 0) {
        lines.push(`Partial overlap with required skills (${Math.round(breakdown.requiredSkillOverlap * 100)}%).`);
    }

    if (breakdown.skillGapCoverage >= 0.5) {
        lines.push("Fills a skill gap the team is currently missing.");
    }

    lines.push(
        breakdown.roleDiversity === 1
            ? "Adds a role the team doesn't already have."
            : "Role overlaps with an existing team member."
    );

    if (breakdown.preferenceAlignment > 0) {
        lines.push("Interests align with this team's project/hackathon theme.");
    }

    if (breakdown.locationProximity === 1) {
        lines.push("Same region as the team.");
    }

    if (breakdown.workingHoursCompatibility >= 1) {
        lines.push("Working hours line up with the team's leader.");
    } else if (breakdown.workingHoursCompatibility < 0.5) {
        lines.push("Working hours differ from the team's leader - may need coordination.");
    }

    if (breakdown.hackathonExperienceProximity >= 0.8) {
        lines.push("Hackathon experience matches the team's current level.");
    }

    if (breakdown.availabilityScore === 0) {
        lines.push("Currently marked unavailable.");
    }

    return lines;
}

// -----------------------------------------------------------------------

function rankUsersForUser(currentUser, candidates) {
    return candidates
        .map((c) => ({ user: c, ...scoreUserForUser(currentUser, c) }))
        .sort((a, b) => b.score - a.score);
}

// teamsWithMembers: [{ team, memberDocs }]
function rankTeamsForUser(currentUser, teamsWithMembers) {
    return teamsWithMembers
        .map(({ team, memberDocs }) => ({
            team,
            ...scoreUserForTeam(currentUser, team, memberDocs),
        }))
        .sort((a, b) => b.score - a.score);
}

function rankUsersForTeam(team, memberDocs, candidates) {
    return candidates
        .map((c) => ({ user: c, ...scoreUserForTeam(c, team, memberDocs) }))
        .sort((a, b) => b.score - a.score);
}

export {
    rankUsersForUser,
    rankTeamsForUser,
    rankUsersForTeam,
    scoreUserForUser,
    scoreUserForTeam,
    explainUserForUser,
    explainUserForTeam,
};