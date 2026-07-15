import { useCallback, useEffect, useState } from 'react';
import { Video, ExternalLink } from 'lucide-react';
import {
    meetingStatus,
    safeMeetingUrl,
    meetingTimeLabel,
} from '../calendar/meetingUtils.js';

/**
 * "Next / current meeting" banner — this is what activates the dashboard's
 * meeting placeholder. It is driven entirely by the team's calendar
 * team-meeting events (no separate scheduler module).
 *
 * The backend picks WHICH meeting to feature (in-progress wins, else soonest
 * scheduled) and returns it with its derived state. We re-derive the state
 * locally on a light 30s tick using the same shared rule, so the yellow ->
 * green flip happens live when the start time passes, without a reload.
 *
 * Colours here encode STATUS (yellow = scheduled, green = in progress) and are
 * deliberately distinct from the meeting type's violet on the calendar grid.
 */
export default function MeetingWidget({ teamId }) {
    const [meeting, setMeeting] = useState(null);
    const [now, setNow] = useState(() => new Date());

    const load = useCallback(async () => {
        try {
            const res = await fetch(
                `/api/v1/calendar-events/meetings/current?teamId=${teamId}`,
            );
            const data = await res.json();
            if (res.ok) setMeeting(data.data?.meeting ?? null);
        } catch (err) {
            console.error('Failed to load current meeting:', err);
        }
    }, [teamId]);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        load();
    }, [load]);

    // Tick locally for the status flip; re-poll occasionally so an ended /
    // newly-created meeting is picked up too.
    useEffect(() => {
        const tick = setInterval(() => setNow(new Date()), 30000);
        const poll = setInterval(() => load(), 60000);
        return () => {
            clearInterval(tick);
            clearInterval(poll);
        };
    }, [load]);

    if (!meeting) return null; // nothing scheduled or running -> hide entirely

    const status = meetingStatus(meeting, now);
    if (status === 'ended') return null; // ended between polls

    const live = status === 'in-progress';
    const url = safeMeetingUrl(meeting.meetingLink);

    const tone = live
        ? {
            border: 'border-emerald-400/50',
            bg: 'bg-emerald-400/10',
            text: 'text-emerald-300',
            dot: 'bg-emerald-400',
        }
        : {
            border: 'border-yellow-400/50',
            bg: 'bg-yellow-400/10',
            text: 'text-yellow-300',
            dot: 'bg-yellow-400',
        };

    const headline = live
        ? 'Meeting in progress'
        : `Meeting starts at ${meetingTimeLabel(meeting)}`;

    const body = (
        <div
            className={[
                'flex items-center gap-3 border p-4 transition-colors',
                tone.border,
                tone.bg,
                url ? 'hover:brightness-125' : '',
            ].join(' ')}
        >
            <span className="relative flex h-2.5 w-2.5 shrink-0">
                {live && (
                    <span
                        className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${tone.dot}`}
                    />
                )}
                <span className={`relative inline-flex h-2.5 w-2.5 rounded-full ${tone.dot}`} />
            </span>

            <Video className={`h-5 w-5 shrink-0 ${tone.text}`} />

            <div className="min-w-0 flex-1">
                <p className={`text-xs font-bold uppercase tracking-widest ${tone.text}`}>
                    {headline}
                </p>
                <p className="truncate text-sm text-gray-300">{meeting.title}</p>
            </div>

            {url ? (
                <span
                    className={`flex shrink-0 items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest ${tone.text}`}
                >
                    Join <ExternalLink className="h-3 w-3" />
                </span>
            ) : (
                <span className="shrink-0 text-[10px] font-mono uppercase tracking-widest text-gray-600">
                    No link
                </span>
            )}
        </div>
    );

    // Clickable only when a safe http(s) link exists; otherwise it is a plain
    // status banner with no navigation.
    return url ? (
        <a href={url} target="_blank" rel="noopener noreferrer" className="block">
            {body}
        </a>
    ) : (
        body
    );
}
