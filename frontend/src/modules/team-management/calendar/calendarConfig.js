/**
 * Static config for the team calendar.
 *
 * Adding a new built-in type is a one-line change here — nothing else in the
 * calendar (grid, modal, legend) needs touching, and the backend stores `type`
 * as a free-form string so no migration is required either.
 *
 * `hex` drives the grid bars (inline styles, so a user's custom colour works
 * through the identical code path). The `dot`/`chip` Tailwind classes are used
 * by the legend and the modal's type picker.
 *
 * Colours accent the app's neon palette (primary #CCFF00 / accent #FF00E5)
 * rather than the reference project's pastel social-media scheme.
 */

export const EVENT_TYPES = [
    {
        id: 'exam',
        label: 'Exam',
        hex: '#FF00E5',
        dot: 'bg-accent',
        chip: 'bg-accent/15 text-accent border-accent/40',
    },
    {
        id: 'hackathon',
        label: 'Hackathon',
        hex: '#CCFF00',
        dot: 'bg-primary',
        chip: 'bg-primary/15 text-primary border-primary/40',
    },
    {
        id: 'event',
        label: 'Event',
        hex: '#38BDF8',
        dot: 'bg-sky-400',
        chip: 'bg-sky-400/15 text-sky-300 border-sky-400/40',
    },
    {
        id: 'deadline',
        label: 'Deadline',
        hex: '#FB923C',
        dot: 'bg-orange-400',
        chip: 'bg-orange-400/15 text-orange-300 border-orange-400/40',
    },
    {
        // Violet on the grid — deliberately distinct from the dashboard widget's
        // yellow/green, which encode meeting STATUS, not type.
        id: 'team-meeting',
        label: 'Team meeting',
        hex: '#A78BFA',
        dot: 'bg-violet-400',
        chip: 'bg-violet-400/15 text-violet-300 border-violet-400/40',
    },
];

export const DEFAULT_TYPE = 'event';

/** Team meetings carry `meetingLink` + `endedAt`; their status is derived. */
export const MEETING_TYPE = 'team-meeting';

/** A user-named type. Its label + colour live on the event, not here. */
export const CUSTOM_TYPE = 'custom';

/** Swatches offered when naming a custom type. */
export const CUSTOM_COLORS = [
    '#CCFF00',
    '#FF00E5',
    '#38BDF8',
    '#FB923C',
    '#34D399',
    '#A78BFA',
    '#F87171',
    '#FACC15',
];

export const getEventType = (id) =>
    EVENT_TYPES.find((t) => t.id === id) ??
    EVENT_TYPES.find((t) => t.id === DEFAULT_TYPE);

/**
 * The single place that answers "what colour and name is this event?" — built-in
 * types read the table, a custom type reads its own stored label + colour.
 */
export const resolveEventStyle = (event) => {
    if (event?.type === CUSTOM_TYPE) {
        return {
            label: event.customLabel || 'Custom',
            hex: event.color || CUSTOM_COLORS[0],
        };
    }
    const type = getEventType(event?.type);
    return { label: type.label, hex: type.hex };
};

/** Display name of whoever added the event — `createdBy` is populated by the API. */
export const creatorName = (event) =>
    event?.createdBy?.fullName || event?.createdBy?.username || 'Unknown';

export const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const VIEWS = [
    { id: 'week', label: 'Week' },
    { id: 'month', label: 'Month' },
];

/** Chip rows a cell shows before collapsing the rest into "+N more". */
export const MAX_LANES = { month: 4, week: 8 };

/** Pixel geometry of the overlay grid — must match calendarCell's padding. */
export const LANE_HEIGHT = 22;
export const CELL_HEADER_HEIGHT = 30;
