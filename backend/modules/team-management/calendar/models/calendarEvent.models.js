import mongoose from "mongoose";

/*
 * A dated entry on a team's shared calendar (exam, hackathon, event, …).
 *
 * `date` is a plain "YYYY-MM-DD" string, not a Date. The calendar is a grid of
 * calendar days, not instants: storing a Date would shift entries across day
 * boundaries depending on the server/client timezone. Strings in this format
 * also range-query correctly ($gte/$lte compare lexicographically), and the
 * frontend grid keys its cells by exactly this value — so list responses need
 * no transformation.
 */

const calendarEventSchema = new mongoose.Schema(
    {
        teamId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Team",
            required: true
        },

        title: {
            type: String,
            required: true,
            trim: true,
            maxlength: 120
        },

        // Start day.
        date: {
            type: String,
            required: true,
            match: [/^\d{4}-\d{2}-\d{2}$/, "date must be YYYY-MM-DD"]
        },

        // Last day, inclusive. Optional in the request; the controller
        // normalises an absent/blank value to `date`, so this is ALWAYS set.
        // That keeps the overlap query a plain two-clause range (no $or /
        // $expr): date <= to AND endDate >= from.
        // An event is single-day iff endDate === date.
        endDate: {
            type: String,
            required: true,
            match: [/^\d{4}-\d{2}-\d{2}$/, "endDate must be YYYY-MM-DD"]
        },

        // Optional "HH:mm". Absent means an all-day entry.
        time: {
            type: String,
            default: "",
            trim: true
        },

        // Free-form on purpose: new types are added in the frontend's
        // calendarConfig.js without a backend change or migration.
        // The literal "custom" means the user named their own type — its name
        // lives in `customLabel` and its colour in `color`.
        type: {
            type: String,
            required: true,
            trim: true,
            default: "event"
        },

        // Only meaningful when type === "custom".
        customLabel: {
            type: String,
            trim: true,
            maxlength: 40,
            default: ""
        },

        // Hex colour for a custom type, e.g. "#CCFF00". Built-in types take
        // their colour from the frontend config instead.
        color: {
            type: String,
            trim: true,
            default: ""
        },

        description: {
            type: String,
            trim: true,
            maxlength: 1000,
            default: ""
        },

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        }
    },
    { timestamps: true }
);

// Non-unique. Covers both "all events for a team" and the week/month range
// queries via the teamId prefix.
calendarEventSchema.index({ teamId: 1, date: 1 });

const CalendarEvent = mongoose.model("CalendarEvent", calendarEventSchema);

export { CalendarEvent };
