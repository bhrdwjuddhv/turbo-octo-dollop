/**
 * Self-check for the date-grid math. No framework:
 *     node src/modules/team-management/calendar/calendarUtils.selfcheck.mjs
 */
import assert from 'node:assert/strict';
import {
    toKey,
    fromKey,
    addMonths,
    startOfWeek,
    generateWeekDays,
    generateMonthDays,
    rangeOf,
} from './calendarUtils.js';

// toKey uses local time (toISOString would shift the day in negative offsets).
assert.equal(toKey(new Date(2026, 0, 1)), '2026-01-01');
assert.equal(toKey(new Date(2026, 11, 31)), '2026-12-31');

// Weeks are Monday-first; Sunday belongs to the week that started 6 days ago.
assert.equal(toKey(startOfWeek(new Date(2026, 6, 8))), '2026-07-06'); // Wed -> Mon
assert.equal(toKey(startOfWeek(new Date(2026, 6, 6))), '2026-07-06'); // Mon -> itself
assert.equal(toKey(startOfWeek(new Date(2026, 6, 12))), '2026-07-06'); // Sun -> prev Mon

assert.equal(generateWeekDays(new Date(2026, 6, 8)).length, 7);

// addMonths must not roll Jan 31 into March.
assert.equal(toKey(addMonths(new Date(2026, 0, 31), 1)), '2026-02-01');

// Month grid: always whole weeks, starts Monday, covers the month.
for (const [y, m] of [[2026, 0], [2026, 1], [2026, 6], [2024, 1]]) {
    const days = generateMonthDays(new Date(y, m, 1));
    assert.equal(days.length % 7, 0, `month ${y}-${m + 1} not whole weeks`);
    assert.equal(days[0].date.getDay(), 1, 'grid must start on Monday');
    const inMonth = days.filter((d) => d.inMonth);
    assert.equal(inMonth.length, new Date(y, m + 1, 0).getDate(), 'all days present');
    assert.ok(days.every((d, i) => i === 0 || d.date > days[i - 1].date), 'strictly increasing');
}

// Feb 2026 starts on a Sunday -> needs 6 leading days from January.
const feb = generateMonthDays(new Date(2026, 1, 1));
assert.equal(toKey(feb[0].date), '2026-01-26');
assert.equal(feb[0].inMonth, false);

const r = rangeOf(feb);
assert.equal(r.from, '2026-01-26');
assert.ok(r.to > r.from);

// fromKey round-trips toKey in local time.
assert.equal(toKey(fromKey('2026-07-08')), '2026-07-08');
assert.equal(toKey(fromKey('2024-02-29')), '2024-02-29');

console.log('calendarUtils: all checks passed');
