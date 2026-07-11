// backend/seeds/seed.js
//
// Seeds the HackMatch database with realistic-looking users, teams, and
// invites. Images are stored as direct URLs (randomuser.me / picsum.photos /
// dicebear) — NOT re-uploaded through Cloudinary — so this is fast and safe
// to run repeatedly against a local/dev database.
//
// USAGE:
//   node seeds/seed.js            -> seeds only if User collection is empty
//   node seeds/seed.js --force    -> wipes Users/Teams/Invites first, then seeds
//   npm run seed / npm run seed:force  -> same, via package.json scripts
//
// All seeded users share one password so you can log in as any of them:
//   password: "Passw0rd!123"
//
// Requires: @faker-js/faker  (npm install -D @faker-js/faker)

import dotenv from "dotenv";
dotenv.config({ path: ".env" });

import mongoose from "mongoose";
import bcrypt from "bcrypt";
// fakerEN_IN generates Indian names, emails, etc. out of the box
import { fakerEN_IN as faker } from "@faker-js/faker";

import connectDB from "../db/index.js";
import { User } from "../modules/auth/user.model.js";
import { Team } from "../modules/team/team.model.js";
import { Invite } from "../modules/invite/invite.model.js";

import {
    TECH_STACK,
    ROLES,
    EXPERIENCE_LEVELS,
    EXPERIENCE_SNIPPETS,
    PREFERENCES,
    PROJECT_IDEAS,
    HACKATHON_NAMES,
    CITIES,
    WORKING_HOURS_OPTIONS,
} from "../constants/techStack.constants.js";

// ------------------------------------------------------------------
// Config
// ------------------------------------------------------------------
const TOTAL_USERS = 110;
const TOTAL_TEAMS = 26;
const SEED_PASSWORD = "Passw0rd!123";
const FORCE = process.argv.includes("--force");

// ------------------------------------------------------------------
// Small helpers
// ------------------------------------------------------------------
const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];

const randInt = (min, max) =>
    Math.floor(Math.random() * (max - min + 1)) + min;

// Sample `n` unique items from an array (n clamped to array length)
function sample(arr, n) {
    const copy = [...arr];
    const out = [];
    const count = Math.min(n, copy.length);
    for (let i = 0; i < count; i++) {
        const idx = Math.floor(Math.random() * copy.length);
        out.push(copy.splice(idx, 1)[0]);
    }
    return out;
}

function slugify(str) {
    return str
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
}

// randomuser.me exposes 0-99 static portrait images per gender - no API
// call needed, just build the URL directly.
function avatarUrl(gender, index) {
    const folder = gender === "female" ? "women" : "men";
    return `https://randomuser.me/api/portraits/${folder}/${index % 100}.jpg`;
}

function coverImageUrl(seed) {
    return `https://picsum.photos/seed/${encodeURIComponent(seed)}-cover/1200/400`;
}

function teamAvatarUrl(seed) {
    return `https://api.dicebear.com/7.x/shapes/png?seed=${encodeURIComponent(seed)}&size=256`;
}

function bannerImageUrl(seed) {
    return `https://picsum.photos/seed/${encodeURIComponent(seed)}-banner/1600/400`;
}

// Weighted so most teams haven't "finished" a hackathon yet (realistic -
// most teams are mid-formation), but enough have results to make the
// reputation/badges system visible in demo data.
function weightedTeamResult() {
    const r = Math.random();
    if (r < 0.5) return "not_specified";
    if (r < 0.75) return "participated";
    if (r < 0.90) return "finalist";
    return "winner";
}

// ------------------------------------------------------------------
// User generation
// ------------------------------------------------------------------
function buildUsers(count, hashedPassword) {
    const users = [];
    const usedUsernames = new Set();
    const usedEmails = new Set();

    for (let i = 0; i < count; i++) {
        const gender = Math.random() < 0.5 ? "male" : "female";
        const firstName = faker.person.firstName(
            gender === "male" ? "male" : "female"
        );
        const lastName = faker.person.lastName();

        let username = faker.internet
            .username({ firstName, lastName })
            .toLowerCase()
            .replace(/[^a-z0-9._]/g, "");
        while (usedUsernames.has(username)) {
            username = `${username}${randInt(1, 999)}`;
        }
        usedUsernames.add(username);

        let email = faker.internet
            .email({ firstName, lastName, provider: "example.com" })
            .toLowerCase();
        while (usedEmails.has(email)) {
            email = `${username}${randInt(1, 999)}@example.com`;
        }
        usedEmails.add(email);

        const techStack = sample(TECH_STACK, randInt(3, 8));
        const experience = sample(EXPERIENCE_SNIPPETS, randInt(1, 3));
        const preferences = sample(PREFERENCES, randInt(2, 4));
        const projects = sample(PROJECT_IDEAS, randInt(1, 3)).map(
            (idea) => `${idea} — built during ${rand(HACKATHON_NAMES)}`
        );

        const hasGithub = Math.random() < 0.85;
        const hasLinkedin = Math.random() < 0.7;
        const hasOther = Math.random() < 0.3;

        users.push({
            username,
            email,
            password: hashedPassword, // already bcrypt-hashed once, see main()
            avatar: avatarUrl(gender, i),
            coverImage: coverImageUrl(username),
            fullName: `${firstName} ${lastName}`,
            bio: faker.lorem.sentence({ min: 10, max: 20 }),
            team_role: rand(ROLES),
            experienceLevel: rand(EXPERIENCE_LEVELS),
            availability: Math.random() < 0.85, // ~85% mark themselves available
            workingHours: rand(WORKING_HOURS_OPTIONS),
            location: rand(CITIES),
            techStack,
            experience,
            preferences,
            projects,
            socialLinks: {
                github: hasGithub
                    ? `https://github.com/${username}`
                    : "",
                linkedin: hasLinkedin
                    ? `https://linkedin.com/in/${username}`
                    : "",
                others: hasOther
                    ? [
                          {
                              platform: rand([
                                  "Twitter",
                                  "Portfolio",
                                  "Devpost",
                              ]),
                              url: `https://${
                                  faker.helpers.arrayElement([
                                      "x.com",
                                      "myportfolio.dev",
                                      "devpost.com",
                                  ])
                              }/${username}`,
                          },
                      ]
                    : [],
            },
        });
    }

    return users;
}

// ------------------------------------------------------------------
// Team generation
// ------------------------------------------------------------------
function buildTeams(count, insertedUsers) {
    // shuffle a copy so leaders are spread across the user pool
    const leaderPool = sample(insertedUsers, count);
    const teams = [];

    for (let i = 0; i < count; i++) {
        const leader = leaderPool[i];
        const requiredSkills = sample(TECH_STACK, randInt(3, 6));
        const maxMembers = randInt(3, 6);
        const name = `${rand([
            "Byte",
            "Neon",
            "Quantum",
            "Nimbus",
            "Vertex",
            "Pixel",
            "Cipher",
            "Orbit",
            "Nova",
            "Fusion",
            "Catalyst",
            "Zenith",
        ])}${rand([
            "Squad",
            "Labs",
            "Collective",
            "Works",
            "Forge",
            "Hive",
            "Crew",
            "Studio",
        ])}`;
        const uniqueName = `${name} ${randInt(1, 999)}`;
        const slug = slugify(uniqueName);

        teams.push({
            name: uniqueName,
            description: faker.lorem.sentence({ min: 12, max: 25 }),
            teamAvatar: teamAvatarUrl(slug),
            bannerImage: bannerImageUrl(slug),
            leader: leader._id,
            members: [leader._id], // leader auto-joins, filled in further below
            requiredSkills,
            maxMembers,
            status: "open", // may flip to "closed" after filling members
            hackathonName: rand(HACKATHON_NAMES),
            projectIdea: rand(PROJECT_IDEAS),
            result: weightedTeamResult(),
        });
    }

    return teams;
}

// Fill each team's members using a simple skill-overlap heuristic so teams
// look intentionally assembled rather than random.
function fillTeamMembers(teams, insertedUsers) {
    const memberCountByUser = new Map(); // avoid over-stacking one user on many teams
    insertedUsers.forEach((u) => memberCountByUser.set(String(u._id), 0));

    for (const team of teams) {
        const leaderId = String(team.leader);
        memberCountByUser.set(
            leaderId,
            (memberCountByUser.get(leaderId) || 0) + 1
        );

        const slotsToFill = randInt(0, team.maxMembers - 1); // some teams stay under-filled (realistic "open" teams)

        const candidates = insertedUsers
            .filter((u) => String(u._id) !== leaderId)
            .filter((u) => (memberCountByUser.get(String(u._id)) || 0) < 2) // cap: user in at most 2 teams
            .map((u) => {
                const overlap = u.techStack.filter((s) =>
                    team.requiredSkills.includes(s)
                ).length;
                return { user: u, score: overlap + Math.random() }; // small random jitter
            })
            .sort((a, b) => b.score - a.score);

        const chosen = candidates.slice(0, slotsToFill);

        for (const { user } of chosen) {
            team.members.push(user._id);
            memberCountByUser.set(
                String(user._id),
                (memberCountByUser.get(String(user._id)) || 0) + 1
            );
        }

        if (team.members.length >= team.maxMembers) {
            team.status = "closed";
        }
    }

    return teams;
}

// ------------------------------------------------------------------
// Invite generation
// ------------------------------------------------------------------
function buildInvites(teams, insertedUsers, targetCount) {
    const invites = [];
    const seenPending = new Set(); // `${sender}-${receiver}-${team}` dedupe for pending

    const openTeams = teams.filter(
        (t) => t.status === "open" && t.members.length < t.maxMembers
    );

    if (openTeams.length === 0) return invites;

    let attempts = 0;
    const maxAttempts = targetCount * 5;

    while (invites.length < targetCount && attempts < maxAttempts) {
        attempts++;
        const team = rand(openTeams);
        const memberIds = new Set(team.members.map(String));
        const candidate = rand(insertedUsers);

        if (memberIds.has(String(candidate._id))) continue;
        if (String(candidate._id) === String(team.leader)) continue;

        const key = `${team.leader}-${candidate._id}-${team._id}`;
        if (seenPending.has(key)) continue;

        const roll = Math.random();
        let status = "pending";
        if (roll < 0.4) status = "accepted";
        else if (roll < 0.6) status = "rejected";

        if (status === "accepted") {
            if (team.members.length >= team.maxMembers) continue; // team full, skip
            team.members.push(candidate._id);
            if (team.members.length >= team.maxMembers) {
                team.status = "closed";
            }
        } else if (status === "pending") {
            seenPending.add(key);
        }

        invites.push({
            sender: team.leader,
            receiver: candidate._id,
            team: team._id,
            status,
        });
    }

    return invites;
}

// ------------------------------------------------------------------
// Main
// ------------------------------------------------------------------
async function main() {
    await connectDB();

    const existingUserCount = await User.countDocuments();

    if (existingUserCount > 0 && !FORCE) {
        console.log(
            `⚠️  User collection already has ${existingUserCount} documents.`
        );
        console.log(
            "   Run with --force to wipe Users/Teams/Invites and reseed:"
        );
        console.log("   node seeds/seed.js --force  (or: npm run seed:force)");
        await mongoose.connection.close();
        process.exit(0);
    }

    if (FORCE) {
        console.log("🧹 Clearing existing Users, Teams, Invites...");
        await Promise.all([
            User.deleteMany({}),
            Team.deleteMany({}),
            Invite.deleteMany({}),
        ]);
    }

    console.log("🔐 Hashing shared seed password once...");
    const hashedPassword = await bcrypt.hash(SEED_PASSWORD, 10);

    console.log(`👥 Generating ${TOTAL_USERS} users...`);
    const userDocs = buildUsers(TOTAL_USERS, hashedPassword);
    // insertMany bypasses the pre('save') hook, which is fine here since
    // we already hashed the password manually above.
    const insertedUsers = await User.insertMany(userDocs, { ordered: false });
    console.log(`   ✅ Inserted ${insertedUsers.length} users.`);

    console.log(`🧑‍🤝‍🧑 Generating ${TOTAL_TEAMS} teams...`);
    let teamDocs = buildTeams(TOTAL_TEAMS, insertedUsers);
    teamDocs = fillTeamMembers(teamDocs, insertedUsers);
    const insertedTeams = await Team.insertMany(teamDocs, { ordered: false });
    console.log(`   ✅ Inserted ${insertedTeams.length} teams.`);

    const targetInvites = Math.round(TOTAL_TEAMS * 2.2); // ~55-60 invites
    console.log(`✉️  Generating ~${targetInvites} invites...`);
    const inviteDocs = buildInvites(insertedTeams, insertedUsers, targetInvites);
    const insertedInvites = inviteDocs.length
        ? await Invite.insertMany(inviteDocs, { ordered: false })
        : [];
    console.log(`   ✅ Inserted ${insertedInvites.length} invites.`);

    // Persist any team member/status changes made while generating invites
    console.log("💾 Syncing team member/status changes from invites...");
    await Promise.all(
        insertedTeams.map((t) =>
            Team.findByIdAndUpdate(t._id, {
                members: t.members,
                status: t.status,
            })
        )
    );

    console.log("\n🎉 Seeding complete!");
    console.log(`   Users:   ${insertedUsers.length}`);
    console.log(`   Teams:   ${insertedTeams.length}`);
    console.log(`   Invites: ${insertedInvites.length}`);
    console.log(`\n🔑 All seeded users share the password: ${SEED_PASSWORD}`);
    console.log(
        `   Example login -> username: "${insertedUsers[0].username}", password: "${SEED_PASSWORD}"`
    );

    await mongoose.connection.close();
    process.exit(0);
}

main().catch((err) => {
    console.error("❌ Seeding failed:", err);
    process.exit(1);
});