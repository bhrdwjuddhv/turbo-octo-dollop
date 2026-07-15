import { resolveEventStyle } from './calendarConfig.js';
import { isMultiDay } from './calendarLayout.js';
import { isMeeting, meetingStatus, canEndMeeting } from './meetingUtils.js';

/**
 * One event, rendered as a bar. A multi-day bar is tinted and gets a left
 * accent; a single-day entry gets a dot. Both are the same element so they line
 * up on the lane grid.
 *
 * `continuesLeft/Right` square off the edge where the event runs past this
 * week row, so a broken-up span reads as continuous across rows.
 *
 * `meetingCtx` = { now, userId, onEnd } drives the in-cell meeting controls:
 * while a team meeting is in progress its CREATOR (and nobody else) sees an
 * "End" button here. `now` is a ticking clock from the page, so the button
 * appears the moment the start time passes — no reload.
 */
export default function EventChip({
    event,
    onClick,
    continuesLeft = false,
    continuesRight = false,
    meetingCtx,
}) {
    const { hex } = resolveEventStyle(event);
    const multi = isMultiDay(event);

    const now = meetingCtx?.now ?? new Date();
    const meeting = isMeeting(event);
    const status = meeting ? meetingStatus(event, now) : null;
    const showEnd = meeting && canEndMeeting(event, meetingCtx?.userId, now);

    return (
        <button
            type="button"
            onClick={(e) => {
                e.stopPropagation();
                onClick(event);
            }}
            title={event.title}
            className={[
                'flex h-[18px] w-full items-center gap-1.5 overflow-hidden px-1.5 text-left text-[11px] font-medium transition-opacity hover:opacity-80',
                continuesLeft ? 'rounded-l-none' : 'rounded-l',
                continuesRight ? 'rounded-r-none' : 'rounded-r',
                status === 'ended' ? 'opacity-50' : '',
            ].join(' ')}
            style={{
                backgroundColor: `${hex}26`,
                color: hex,
                borderLeft: multi && !continuesLeft ? `3px solid ${hex}` : undefined,
            }}
        >
            {!multi && (
                <span
                    className={[
                        'h-1.5 w-1.5 shrink-0 rounded-full',
                        status === 'in-progress' ? 'animate-pulse' : '',
                    ].join(' ')}
                    style={{ backgroundColor: hex }}
                />
            )}
            {continuesLeft && <span className="shrink-0 opacity-70">◀</span>}
            {event.time && !multi && (
                <span className="shrink-0 opacity-70">{event.time}</span>
            )}
            <span className="truncate">{event.title}</span>

            {status === 'ended' && (
                <span className="ml-auto shrink-0 text-[9px] uppercase opacity-60">
                    Ended
                </span>
            )}

            {/* Creator-only, in-progress-only. Nested interactive element: stop
                propagation so it ends the meeting instead of opening the detail. */}
            {showEnd && (
                <span
                    role="button"
                    tabIndex={0}
                    onClick={(e) => {
                        e.stopPropagation();
                        meetingCtx.onEnd(event);
                    }}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            e.stopPropagation();
                            meetingCtx.onEnd(event);
                        }
                    }}
                    title="End meeting"
                    className="ml-auto shrink-0 cursor-pointer rounded bg-red-500/20 px-1 text-[9px] font-bold uppercase text-red-300 hover:bg-red-500/40"
                >
                    End
                </span>
            )}

            {continuesRight && !showEnd && status !== 'ended' && (
                <span className="ml-auto shrink-0 opacity-70">▶</span>
            )}
        </button>
    );
}
