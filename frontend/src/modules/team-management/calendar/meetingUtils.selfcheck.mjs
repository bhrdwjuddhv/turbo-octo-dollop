/**
 * Self-check for derived meeting status + link sanitising.
 *     node src/modules/team-management/calendar/meetingUtils.selfcheck.mjs
 */
import assert from 'node:assert/strict';
import {
    isMeeting,
    meetingStartAt,
    meetingStatus,
    canEndMeeting,
    safeMeetingUrl,
} from './meetingUtils.js';

const meeting = (over = {}) => ({
    _id: 'm1',
    type: 'team-meeting',
    date: '2026-07-10',
    time: '14:00',
    endedAt: null,
    createdBy: { _id: 'u1' },
    ...over,
});

const at = (iso) => new Date(iso);

// --- start instant is UTC, not local -------------------------------------
assert.equal(meetingStartAt(meeting()).toISOString(), '2026-07-10T14:00:00.000Z');
// missing time => midnight UTC
assert.equal(
    meetingStartAt(meeting({ time: '' })).toISOString(),
    '2026-07-10T00:00:00.000Z',
);

// --- the three states ------------------------------------------------------
assert.equal(meetingStatus(meeting(), at('2026-07-10T13:59:59Z')), 'scheduled');
assert.equal(meetingStatus(meeting(), at('2026-07-10T14:00:00Z')), 'in-progress'); // inclusive
assert.equal(meetingStatus(meeting(), at('2026-07-10T18:00:00Z')), 'in-progress'); // no end time
assert.equal(
    meetingStatus(meeting({ endedAt: '2026-07-10T15:00:00Z' }), at('2026-07-10T18:00:00Z')),
    'ended',
);
// endedAt wins even before the start instant
assert.equal(
    meetingStatus(meeting({ endedAt: '2026-07-01T00:00:00Z' }), at('2026-07-01T00:00:00Z')),
    'ended',
);

// --- end-meeting permission: creator only, in-progress only ----------------
const now = at('2026-07-10T15:00:00Z');
assert.equal(canEndMeeting(meeting(), 'u1', now), true);
assert.equal(canEndMeeting(meeting(), 'u2', now), false, 'non-creator cannot end');
assert.equal(canEndMeeting(meeting(), null, now), false, 'anonymous cannot end');
assert.equal(
    canEndMeeting(meeting(), 'u1', at('2026-07-10T13:00:00Z')),
    false,
    'cannot end before it starts',
);
assert.equal(
    canEndMeeting(meeting({ endedAt: '2026-07-10T14:30:00Z' }), 'u1', now),
    false,
    'cannot end twice',
);
assert.equal(
    canEndMeeting(meeting({ type: 'event' }), 'u1', now),
    false,
    'non-meetings have nothing to end',
);
// createdBy may arrive unpopulated (raw id)
assert.equal(canEndMeeting(meeting({ createdBy: 'u1' }), 'u1', now), true);

assert.equal(isMeeting(meeting()), true);
assert.equal(isMeeting({ type: 'exam' }), false);

// --- link sanitising -------------------------------------------------------
assert.equal(safeMeetingUrl('https://meet.example.com/x'), 'https://meet.example.com/x');
assert.ok(safeMeetingUrl('http://zoom.us/j/1')); // http allowed
assert.equal(safeMeetingUrl(''), null);
assert.equal(safeMeetingUrl(null), null);
assert.equal(safeMeetingUrl('   '), null);
assert.equal(safeMeetingUrl('javascript:alert(1)'), null, 'javascript: blocked');
assert.equal(safeMeetingUrl('data:text/html,x'), null, 'data: blocked');
assert.equal(safeMeetingUrl('not a url'), null);

console.log('meetingUtils: all checks passed');
