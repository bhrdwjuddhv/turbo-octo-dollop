import mongoose from "mongoose";
import { CalendarEvent } from "../models/calendarEvent.models.js";
import { Team } from "../../../team/team.model.js";
import { asyncHandler } from "../../../../utils/asyncHandler.js";
import { ApiResponse } from "../../../../utils/ApiResponse.js";
import { ApiError } from "../../../../utils/ApiError.js";

// Same rule as the rest of team-management: leader or member.
const assertTeamMembership = (team, userId) => {
    const uid = userId.toString();

    const isMember =
        team.leader.toString() === uid ||
        team.members.some((member) => member.toString() === uid);

    if (!isMember) {
        throw new ApiError(403, "You are not a member of this team");
    }
};

const loadTeamForUser = async (teamId, userId) => {
    if (!teamId || !mongoose.isValidObjectId(teamId)) {
        throw new ApiError(400, "A valid teamId is required");
    }

    const team = await Team.findById(teamId);

    if (!team) {
        throw new ApiError(404, "Team not found");
    }

    assertTeamMembership(team, userId);

    return team;
};

// Loads an event and checks the caller belongs to its owning team.
const loadEventForUser = async (eventId, userId) => {
    if (!mongoose.isValidObjectId(eventId)) {
        throw new ApiError(400, "Invalid event id");
    }

    const event = await CalendarEvent.findById(eventId);

    if (!event) {
        throw new ApiError(404, "Event not found");
    }

    await loadTeamForUser(event.teamId, userId);

    return event;
};

const isDateKey = (value) => /^\d{4}-\d{2}-\d{2}$/.test(value ?? "");

// The creator's display name must ride along on every read, so the grid can
// show "who added this" without a second request.
const CREATED_BY_FIELDS = "username fullName avatar";

// Blank/absent endDate => single-day event ending on its start day.
// YYYY-MM-DD sorts lexicographically, so a string compare is a date compare.
const resolveEndDate = (endDate, startDate) => {
    if (endDate === undefined || endDate === null || endDate === "") {
        return startDate;
    }

    if (!isDateKey(endDate)) {
        throw new ApiError(400, "endDate must be in YYYY-MM-DD format");
    }

    if (endDate < startDate) {
        throw new ApiError(400, "endDate must be on or after date");
    }

    return endDate;
};

/*
 * --- Team meetings ------------------------------------------------------
 * Status is DERIVED, never stored (a stored status would drift). The single
 * source of truth for "when does this meeting start" is:
 *
 *     startAt = `${date}T${time || "00:00"}:00.000Z`   (interpreted as UTC)
 *
 * Interpreting the stored wall clock as UTC means the server and every client
 * — whatever their local zone — compute the SAME instant, so "in progress" is
 * consistent across timezones. The frontend mirrors this in meetingUtils.js;
 * keep the two in sync.
 */
const MEETING_TYPE = "team-meeting";

export const meetingStartAt = (event) =>
    new Date(`${event.date}T${event.time || "00:00"}:00.000Z`);

export const meetingStatus = (event, now = new Date()) => {
    if (event.endedAt) return "ended";
    return now >= meetingStartAt(event) ? "in-progress" : "scheduled";
};

// Only http(s) links are accepted — never javascript:/data: etc.
const resolveMeetingLink = (type, meetingLink) => {
    if (type !== MEETING_TYPE) return "";

    const raw = meetingLink?.trim();
    if (!raw) return "";

    let url;
    try {
        url = new URL(raw);
    } catch {
        throw new ApiError(400, "meetingLink must be a valid URL");
    }

    if (url.protocol !== "http:" && url.protocol !== "https:") {
        throw new ApiError(400, "meetingLink must be an http(s) URL");
    }

    return url.toString();
};

// A custom type carries its own label + colour; built-ins carry neither.
const resolveCustomFields = (type, customLabel, color) => {
    if (type !== "custom") {
        return { customLabel: "", color: "" };
    }

    if (!customLabel?.trim()) {
        throw new ApiError(400, "A custom type needs a label");
    }

    if (color && !/^#[0-9a-fA-F]{6}$/.test(color)) {
        throw new ApiError(400, "color must be a hex value like #CCFF00");
    }

    return { customLabel: customLabel.trim(), color: color || "" };
};

// POST /api/v1/calendar-events
const createEvent = asyncHandler(async (req, res) => {

    const {
        teamId,
        title,
        date,
        endDate,
        time,
        type,
        customLabel,
        color,
        description,
        meetingLink
    } = req.body;

    await loadTeamForUser(teamId, req.user?._id);

    if (!title?.trim()) {
        throw new ApiError(400, "Event title is required");
    }

    if (!isDateKey(date)) {
        throw new ApiError(400, "date must be in YYYY-MM-DD format");
    }

    const resolvedType = type?.trim() || "event";

    const event = await CalendarEvent.create({
        teamId,
        title: title.trim(),
        date,
        endDate: resolveEndDate(endDate, date),
        time: time ?? "",
        type: resolvedType,
        ...resolveCustomFields(resolvedType, customLabel, color),
        // "" for non-meetings; validated http(s) URL otherwise.
        meetingLink: resolveMeetingLink(resolvedType, meetingLink),
        description: description ?? "",
        createdBy: req.user?._id
    });

    await event.populate("createdBy", CREATED_BY_FIELDS);

    return res.status(201).json(
        new ApiResponse(
            201,
            event,
            "Event created successfully"
        )
    );
});

// GET /api/v1/calendar-events?teamId=...&from=YYYY-MM-DD&to=YYYY-MM-DD
// `from`/`to` are optional and inclusive — the week and month views pass the
// first and last day currently on screen.
//
// Returns every event whose [date, endDate] range OVERLAPS the window, not just
// those starting inside it. A multi-day event that begins before `from` or ends
// after `to` still touches the visible grid and must be drawn on it.
//
//   overlap  <=>  event.date <= to  AND  event.endDate >= from
const getEvents = asyncHandler(async (req, res) => {

    const { teamId, from, to } = req.query;

    await loadTeamForUser(teamId, req.user?._id);

    const filter = { teamId };

    if (to) {
        if (!isDateKey(to)) {
            throw new ApiError(400, "`to` must be in YYYY-MM-DD format");
        }
        filter.date = { $lte: to };
    }

    if (from) {
        if (!isDateKey(from)) {
            throw new ApiError(400, "`from` must be in YYYY-MM-DD format");
        }
        filter.endDate = { $gte: from };
    }

    const events = await CalendarEvent.find(filter)
        .populate("createdBy", CREATED_BY_FIELDS)
        .sort({ date: 1, time: 1 });

    return res.status(200).json(
        new ApiResponse(
            200,
            events,
            "Events fetched successfully"
        )
    );
});

// PATCH /api/v1/calendar-events/:eventId
const updateEvent = asyncHandler(async (req, res) => {

    const event = await loadEventForUser(req.params.eventId, req.user?._id);

    const {
        title,
        date,
        endDate,
        time,
        type,
        customLabel,
        color,
        description,
        meetingLink
    } = req.body;

    if (title !== undefined) {
        if (!title?.trim()) {
            throw new ApiError(400, "Event title is required");
        }
        event.title = title.trim();
    }

    if (date !== undefined) {
        if (!isDateKey(date)) {
            throw new ApiError(400, "date must be in YYYY-MM-DD format");
        }
        event.date = date;
    }

    // endDate must stay >= date even when only one of the two was sent — e.g.
    // pushing the start of a single-day event forward.
    if (endDate !== undefined) {
        event.endDate = resolveEndDate(endDate, event.date);
    } else if (event.endDate < event.date) {
        event.endDate = event.date;
    }

    if (type !== undefined) {
        event.type = type?.trim() || "event";
        const custom = resolveCustomFields(
            event.type,
            customLabel ?? event.customLabel,
            color ?? event.color,
        );
        event.customLabel = custom.customLabel;
        event.color = custom.color;
        // Switching away from a meeting drops its link.
        event.meetingLink = resolveMeetingLink(
            event.type,
            meetingLink ?? event.meetingLink,
        );
    } else if (meetingLink !== undefined) {
        event.meetingLink = resolveMeetingLink(event.type, meetingLink);
    }

    if (time !== undefined) event.time = time;
    if (description !== undefined) event.description = description;

    await event.save();
    await event.populate("createdBy", CREATED_BY_FIELDS);

    return res.status(200).json(
        new ApiResponse(
            200,
            event,
            "Event updated successfully"
        )
    );
});

// DELETE /api/v1/calendar-events/:eventId
const deleteEvent = asyncHandler(async (req, res) => {

    const event = await loadEventForUser(req.params.eventId, req.user?._id);

    await CalendarEvent.findByIdAndDelete(event._id);

    return res.status(200).json(
        new ApiResponse(
            200,
            {},
            "Event deleted successfully"
        )
    );
});

// PATCH /api/v1/calendar-events/:eventId/end
// Ends a running meeting. ONLY the meeting's creator may end it — enforced here,
// never trusted from the client.
const endMeeting = asyncHandler(async (req, res) => {

    const event = await loadEventForUser(req.params.eventId, req.user?._id);

    if (event.type !== MEETING_TYPE) {
        throw new ApiError(400, "This event is not a team meeting");
    }

    if (event.createdBy.toString() !== req.user?._id.toString()) {
        throw new ApiError(403, "Only the meeting's creator can end it");
    }

    if (event.endedAt) {
        throw new ApiError(400, "This meeting has already ended");
    }

    if (meetingStatus(event) !== "in-progress") {
        throw new ApiError(400, "This meeting has not started yet");
    }

    event.endedAt = new Date();
    await event.save();
    await event.populate("createdBy", CREATED_BY_FIELDS);

    return res.status(200).json(
        new ApiResponse(200, event, "Meeting ended")
    );
});

// GET /api/v1/calendar-events/meetings/current?teamId=...
// The one meeting the dashboard should feature, with its derived state:
//   an in-progress meeting wins (most recently started if several);
//   otherwise the soonest scheduled one. `null` when there is nothing to show.
const getCurrentMeeting = asyncHandler(async (req, res) => {

    const { teamId } = req.query;

    await loadTeamForUser(teamId, req.user?._id);

    // Non-ended meetings only. Few per team, so derive in JS rather than trying
    // to express the UTC start-instant rule as a Mongo query.
    const candidates = await CalendarEvent.find({
        teamId,
        type: MEETING_TYPE,
        endedAt: null
    }).populate("createdBy", CREATED_BY_FIELDS);

    const now = new Date();

    const withStatus = candidates.map((event) => ({
        event,
        startAt: meetingStartAt(event),
        status: meetingStatus(event, now)
    }));

    const inProgress = withStatus
        .filter((m) => m.status === "in-progress")
        .sort((a, b) => b.startAt - a.startAt); // most recently started first

    const scheduled = withStatus
        .filter((m) => m.status === "scheduled")
        .sort((a, b) => a.startAt - b.startAt); // soonest first

    const featured = inProgress[0] ?? scheduled[0] ?? null;

    return res.status(200).json(
        new ApiResponse(
            200,
            featured
                ? {
                    meeting: featured.event,
                    status: featured.status,
                    startAt: featured.startAt,
                    meetingLink: featured.event.meetingLink || ""
                }
                : null,
            "Current meeting fetched successfully"
        )
    );
});

export {
    createEvent,
    getEvents,
    endMeeting,
    getCurrentMeeting,
    updateEvent,
    deleteEvent
};
