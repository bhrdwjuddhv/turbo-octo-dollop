import { resolveEventStyle } from './calendarConfig.js';
import { isMultiDay } from './calendarLayout.js';

/**
 * One event, rendered as a bar. A multi-day bar is tinted and gets a left
 * accent; a single-day entry gets a dot. Both are the same element so they line
 * up on the lane grid.
 *
 * `continuesLeft/Right` square off the edge where the event runs past this
 * week row, so a broken-up span reads as continuous across rows.
 */
export default function EventChip({
    event,
    onClick,
    continuesLeft = false,
    continuesRight = false,
}) {
    const { hex } = resolveEventStyle(event);
    const multi = isMultiDay(event);

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
            ].join(' ')}
            style={{
                backgroundColor: `${hex}26`,
                color: hex,
                borderLeft: multi && !continuesLeft ? `3px solid ${hex}` : undefined,
            }}
        >
            {!multi && (
                <span
                    className="h-1.5 w-1.5 shrink-0 rounded-full"
                    style={{ backgroundColor: hex }}
                />
            )}
            {continuesLeft && <span className="shrink-0 opacity-70">◀</span>}
            {event.time && !multi && (
                <span className="shrink-0 opacity-70">{event.time}</span>
            )}
            <span className="truncate">{event.title}</span>
            {continuesRight && <span className="ml-auto shrink-0 opacity-70">▶</span>}
        </button>
    );
}
