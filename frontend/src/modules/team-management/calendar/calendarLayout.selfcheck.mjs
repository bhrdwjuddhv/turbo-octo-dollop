/**
 * Self-check for the week-row lane layout.
 *     node src/modules/team-management/calendar/calendarLayout.selfcheck.mjs
 */
import assert from 'node:assert/strict';
import { layoutWeek, eventsOnDay, isMultiDay, eventEnd } from './calendarLayout.js';
import { generateWeekDays } from './calendarUtils.js';

// Week of Mon 2026-07-06 .. Sun 2026-07-12
const week = generateWeekDays(new Date(2026, 6, 8));
const ev = (id, date, endDate = date, extra = {}) => ({
    _id: id, title: id, date, endDate, time: '', type: 'event', ...extra,
});

// --- basics ---------------------------------------------------------------
assert.equal(isMultiDay(ev('a', '2026-07-06')), false);
assert.equal(isMultiDay(ev('a', '2026-07-06', '2026-07-08')), true);
assert.equal(eventEnd({ date: '2026-07-06', endDate: '' }), '2026-07-06');

// --- single-day => span of 1 ----------------------------------------------
let out = layoutWeek(week, [ev('a', '2026-07-08')], 4);
assert.equal(out.segments.length, 1);
assert.equal(out.segments[0].startIdx, 2); // Wed
assert.equal(out.segments[0].endIdx, 2);
assert.equal(out.segments[0].lane, 0);
assert.equal(out.chips.length, 0);

// --- multi-day spans the right columns ------------------------------------
out = layoutWeek(week, [ev('a', '2026-07-07', '2026-07-10')], 4);
assert.equal(out.segments[0].startIdx, 1); // Tue
assert.equal(out.segments[0].endIdx, 4);   // Fri
assert.equal(out.segments[0].continuesLeft, false);
assert.equal(out.segments[0].continuesRight, false);

// --- clipping: event starts before / ends after this row -------------------
out = layoutWeek(week, [ev('a', '2026-07-01', '2026-07-20')], 4);
assert.equal(out.segments[0].startIdx, 0);
assert.equal(out.segments[0].endIdx, 6);
assert.equal(out.segments[0].continuesLeft, true);
assert.equal(out.segments[0].continuesRight, true);

// --- an event entirely outside the row is dropped --------------------------
assert.equal(layoutWeek(week, [ev('a', '2026-08-01')], 4).segments.length, 0);
assert.equal(layoutWeek(week, [ev('a', '2026-06-01', '2026-06-30')], 4).segments.length, 0);

// --- overlapping spans never share a lane/column (the core invariant) ------
out = layoutWeek(
    week,
    [
        ev('long', '2026-07-06', '2026-07-09'),
        ev('mid', '2026-07-08', '2026-07-10'),
        ev('single', '2026-07-08'),
    ],
    5,
);
const occupied = new Set();
for (const s of out.segments) {
    for (let i = s.startIdx; i <= s.endIdx; i += 1) {
        const cell = `${s.lane}:${i}`;
        assert.ok(!occupied.has(cell), `lane/column collision at ${cell}`);
        occupied.add(cell);
    }
}
assert.equal(out.segments.length, 3);

// --- ordering: multi-day, then timed, then untimed -------------------------
out = layoutWeek(
    week,
    [
        ev('untimed', '2026-07-08'),
        ev('timed', '2026-07-08', '2026-07-08', { time: '09:00' }),
        ev('span', '2026-07-08', '2026-07-09'),
    ],
    5,
);
const laneOf = (id) => out.segments.find((s) => s.event._id === id).lane;
assert.ok(laneOf('span') < laneOf('timed'), 'spans above timed');
assert.ok(laneOf('timed') < laneOf('untimed'), 'timed above untimed');

// --- non-overlapping spans reuse lane 0 ------------------------------------
out = layoutWeek(week, [ev('a', '2026-07-06', '2026-07-07'), ev('b', '2026-07-09', '2026-07-10')], 4);
assert.equal(out.segments.every((s) => s.lane === 0), true);

// --- overflow: bottom lane yields to "+N more" -----------------------------
const many = ['a', 'b', 'c', 'd', 'e'].map((id) => ev(id, '2026-07-08'));
out = layoutWeek(week, many, 3);
assert.equal(out.visibleLanes, 2, 'one lane reserved for chips');
assert.equal(out.segments.length, 2);
assert.equal(out.rows, 3);
assert.deepEqual(out.chips, [{ dayIdx: 2, count: 3, key: '2026-07-08' }]);

// no overflow => no chips, rows == lanes actually used
out = layoutWeek(week, many.slice(0, 3), 3);
assert.equal(out.chips.length, 0);
assert.equal(out.rows, 3);
assert.equal(out.segments.length, 3);

// a span outranks singles, so the singles are what overflow (both on day 0)
out = layoutWeek(
    week,
    [ev('x', '2026-07-06'), ev('y', '2026-07-06'), ev('span', '2026-07-06', '2026-07-08')],
    2,
);
assert.equal(out.visibleLanes, 1);
assert.equal(out.segments[0].event._id, 'span', 'span keeps the visible lane');
assert.deepEqual(out.chips.map((c) => [c.dayIdx, c.count]), [[0, 2]]);

// hidden SPANS contribute +1 to every day they cover.
// 3 stacked spans, maxLanes 2 -> lane 0 visible, lanes 1&2 hidden.
out = layoutWeek(
    week,
    ['a', 'b', 'c'].map((id) => ev(id, '2026-07-06', '2026-07-08')),
    2,
);
assert.equal(out.visibleLanes, 1);
assert.equal(out.segments.length, 1);
assert.deepEqual(
    out.chips.map((c) => [c.dayIdx, c.count]),
    [[0, 2], [1, 2], [2, 2]],
);

// exactly maxLanes lanes is NOT overflow
out = layoutWeek(week, ['a', 'b'].map((id) => ev(id, '2026-07-06', '2026-07-08')), 2);
assert.equal(out.visibleLanes, 2);
assert.equal(out.chips.length, 0);

// --- eventsOnDay includes spanning events ----------------------------------
const list = [ev('span', '2026-07-06', '2026-07-09'), ev('one', '2026-07-08')];
assert.equal(eventsOnDay(list, '2026-07-07').length, 1);
assert.equal(eventsOnDay(list, '2026-07-08').length, 2);
assert.equal(eventsOnDay(list, '2026-07-10').length, 0);

console.log('calendarLayout: all checks passed');
