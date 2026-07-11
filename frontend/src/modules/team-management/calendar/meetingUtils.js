import { MEETING_TYPE } from './calendarConfig.js';

/**
 * Team-meeting status — DERIVED, never stored (a stored status would drift out
 * of sync with the clock).
 *
 *   endedAt set                     -> 'ended'
 *   now >= startAt && endedAt null  -> 'in-progress'
 *   now <  startAt && endedAt null  -> 'scheduled'
 *
 * SINGLE SOURCE OF TRUTH for the start instant:
 *
 *   startAt = `${date}T${time || '00:00'}:00.000Z`   (interpreted as UTC)
 *
 * The stored wall clock is read as UTC, so the server and every client — in any
 * timezone — resolve the identical instant and agree on "in progress". This
 * mirrors meetingStartAt/meetingStatus in the backend calendar controller; keep
 * the two in sync.
 */

export const isMeeting = (event) => event?.type === MEETING_TYPE;

export const meetingStartAt = (event) =>
    new Date(`${event.date}T${event.time || '00:00'}:00.000Z`);

export const meetingStatus = (event, now = new Date()) => {
    if (event?.endedAt) return 'ended';
    return now >= meetingStartAt(event) ? 'in-progress' : 'scheduled';
};

/** The creator is the only person allowed to end a running meeting. */
export const canEndMeeting = (event, userId, now = new Date()) =>
    isMeeting(event) &&
    meetingStatus(event, now) === 'in-progress' &&
    Boolean(userId) &&
    (event.createdBy?._id ?? event.createdBy) === userId;

/**
 * Only http(s) links are navigable. Anything else (javascript:, data:, garbage)
 * yields null, which makes the dashboard widget non-clickable.
 */
export const safeMeetingUrl = (link) => {
    const raw = link?.trim();
    if (!raw) return null;
    try {
        const url = new URL(raw);
        return url.protocol === 'http:' || url.protocol === 'https:'
            ? url.toString()
            : null;
    } catch {
        return null;
    }
};

/** The wall-clock the creator entered, shown verbatim (no locale shifting). */
export const meetingTimeLabel = (event) => event?.time || '00:00';
