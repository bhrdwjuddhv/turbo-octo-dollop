/**
 * Lane layout for one 7-day row.
 *
 * Single-day and multi-day events go through the SAME pass — a single-day event
 * is just a span of length 1. That's why bars and singles can never overlap:
 * once a lane owns a column, nothing else may sit there.
 *
 * Output feeds a `grid-template-columns: repeat(7, 1fr)` overlay:
 *   gridColumn = startIdx+1 / span (endIdx-startIdx+1)
 *   gridRow    = lane+1
 *
 * ponytail: O(events x lanes) scan. A week row holds a handful of events; if a
 * team ever puts hundreds on one row, switch the lane search to an interval tree.
 */

import { toKey } from './calendarUtils.js';

/** Last day of an event, inclusive. Backend always sets endDate. */
export const eventEnd = (event) => event.endDate || event.date;

export const isMultiDay = (event) => eventEnd(event) !== event.date;

/** Multi-day bars first, then timed events by clock, then untimed. */
const rank = (event) => (isMultiDay(event) ? 0 : event.time ? 1 : 2);

/** Every event touching `key`, spanning events included. */
export const eventsOnDay = (events, key) =>
    events.filter((event) => event.date <= key && eventEnd(event) >= key);

const compare = (a, b) =>
    rank(a.event) - rank(b.event) ||
    b.endIdx - b.startIdx - (a.endIdx - a.startIdx) ||
    a.startIdx - b.startIdx ||
    (a.event.time || '').localeCompare(b.event.time || '') ||
    a.event.title.localeCompare(b.event.title);

/**
 * @param days     [{ date }] — 7 consecutive days
 * @param events   all fetched events (unfiltered)
 * @param maxLanes rows of chips a cell can show before "+N more"
 * @returns { segments, chips, rows, visibleLanes }
 */
export function layoutWeek(days, events, maxLanes) {
    const keys = days.map((d) => toKey(d.date));
    const first = keys[0];
    const last = keys[keys.length - 1];

    // Clip each overlapping event to this row's columns.
    const placed = [];
    for (const event of events) {
        const start = event.date;
        const end = eventEnd(event);
        if (end < first || start > last) continue;

        placed.push({
            event,
            startIdx: start <= first ? 0 : keys.indexOf(start),
            endIdx: end >= last ? keys.length - 1 : keys.indexOf(end),
            continuesLeft: start < first,
            continuesRight: end > last,
        });
    }

    placed.sort(compare);

    // Lowest free lane wins; a lane is free only if every column of the span is.
    const lanes = [];
    for (const p of placed) {
        let lane = 0;
        for (;;) {
            if (!lanes[lane]) lanes[lane] = new Array(days.length).fill(false);
            let free = true;
            for (let i = p.startIdx; i <= p.endIdx; i += 1) {
                if (lanes[lane][i]) {
                    free = false;
                    break;
                }
            }
            if (free) break;
            lane += 1;
        }
        for (let i = p.startIdx; i <= p.endIdx; i += 1) lanes[lane][i] = true;
        p.lane = lane;
    }

    // On overflow the bottom lane is given up to the "+N more" chips.
    const lanesUsed = lanes.length;
    const overflow = lanesUsed > maxLanes;
    const visibleLanes = overflow ? maxLanes - 1 : lanesUsed;

    const segments = placed.filter((p) => p.lane < visibleLanes);

    const counts = new Array(days.length).fill(0);
    placed
        .filter((p) => p.lane >= visibleLanes)
        .forEach((p) => {
            for (let i = p.startIdx; i <= p.endIdx; i += 1) counts[i] += 1;
        });

    const chips = counts
        .map((count, dayIdx) => ({ dayIdx, count, key: keys[dayIdx] }))
        .filter((c) => c.count > 0);

    return {
        segments,
        chips,
        visibleLanes,
        rows: overflow ? maxLanes : lanesUsed,
    };
}
