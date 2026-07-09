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
        description
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
        description
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

export {
    createEvent,
    getEvents,
    updateEvent,
    deleteEvent
};
