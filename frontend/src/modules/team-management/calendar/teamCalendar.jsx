import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '../../../components/Navbar';
import CalendarToolbar from './calendarToolbar.jsx';
import MonthView from './monthView.jsx';
import WeekView from './weekView.jsx';
import EventModal from './eventModal.jsx';
import EventDetailModal from './eventDetailModal.jsx';
import DayEventsModal from './dayEventsModal.jsx';
import {
    generateMonthDays,
    generateWeekDays,
    rangeOf,
    addDays,
    addMonths,
    toKey,
    monthLabel,
    weekLabel,
} from './calendarUtils.js';

/**
 * Team calendar page. Events live in the backend and are scoped by teamId
 * (taken from the route), reached with the same cookie-authed `fetch` the rest
 * of the app uses.
 */
export default function TeamCalendar() {
    const { teamId } = useParams();
    const gridRef = useRef(null);

    const [view, setView] = useState('month');
    const [cursor, setCursor] = useState(() => new Date());
    const [events, setEvents] = useState([]);
    const [modalEvent, setModalEvent] = useState(null); // create / edit form
    const [detailEvent, setDetailEvent] = useState(null); // read-only popover
    const [dayKey, setDayKey] = useState(null); // "+N more" day list
    const [saving, setSaving] = useState(false);
    const [exporting, setExporting] = useState(false);
    const [error, setError] = useState(null);

    // Only fetch the days currently on screen (the month grid includes its
    // leading/trailing days, so those cells populate too).
    const load = useCallback(async () => {
        if (!teamId) return;

        const days =
            view === 'month' ? generateMonthDays(cursor) : generateWeekDays(cursor);
        const { from, to } = rangeOf(days);

        try {
            const params = new URLSearchParams({ teamId, from, to });
            const response = await fetch(`/api/v1/calendar-events?${params}`);
            const data = await response.json();

            if (response.ok) {
                setEvents(data.data || []);
                setError(null);
            } else {
                setError(data.message || 'Could not load events');
            }
        } catch (err) {
            console.error('Failed to load calendar events:', err);
            setError('Could not load events');
        }
    }, [teamId, view, cursor]);

    useEffect(() => {
        // ponytail: `load` only setStates after `await fetch`, so this is an
        // async callback, not a synchronous cascading render. Rule can't see that.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        load();
    }, [load]);

    const saveEvent = async (form) => {
        setSaving(true);
        try {
            const editing = Boolean(modalEvent?._id);
            const response = await fetch(
                editing
                    ? `/api/v1/calendar-events/${modalEvent._id}`
                    : '/api/v1/calendar-events',
                {
                    method: editing ? 'PATCH' : 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(editing ? form : { ...form, teamId }),
                },
            );
            const data = await response.json();

            if (!response.ok) {
                alert(`Error: ${data.message || 'Could not save event'}`);
                return;
            }

            setModalEvent(null);
            setDetailEvent(null);
            await load();
        } catch (err) {
            console.error('Save failed:', err);
            alert('An error occurred while saving the event.');
        } finally {
            setSaving(false);
        }
    };

    const deleteEvent = async (event) => {
        if (!window.confirm(`Delete "${event.title}"?`)) return;

        try {
            const response = await fetch(`/api/v1/calendar-events/${event._id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const data = await response.json();
                alert(`Error: ${data.message || 'Could not delete event'}`);
                return;
            }

            setModalEvent(null);
            setDetailEvent(null);
            setDayKey(null);
            await load();
        } catch (err) {
            console.error('Delete failed:', err);
            alert('An error occurred while deleting the event.');
        }
    };

    // Pulled in on demand so html2canvas-pro + jspdf stay out of the main bundle.
    const exportPdf = async () => {
        if (!gridRef.current) return;
        setExporting(true);

        try {
            const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
                import('html2canvas-pro'),
                import('jspdf'),
            ]);

            const canvas = await html2canvas(gridRef.current, {
                backgroundColor: '#000000',
                scale: 2,
            });

            // Size the page to the capture — no scaling maths needed.
            const pdf = new jsPDF({
                orientation: canvas.width >= canvas.height ? 'landscape' : 'portrait',
                unit: 'px',
                format: [canvas.width, canvas.height],
            });

            pdf.addImage(
                canvas.toDataURL('image/png'),
                'PNG',
                0,
                0,
                canvas.width,
                canvas.height,
            );

            const label = view === 'month' ? monthLabel(cursor) : weekLabel(cursor);
            pdf.save(`hackmach-calendar-${label.replace(/[^\w]+/g, '-')}.pdf`);
        } catch (err) {
            console.error('Export failed:', err);
            alert('Could not export the calendar.');
        } finally {
            setExporting(false);
        }
    };

    const step = (direction) =>
        setCursor((current) =>
            view === 'month'
                ? addMonths(current, direction)
                : addDays(current, direction * 7),
        );

    const ViewComponent = view === 'month' ? MonthView : WeekView;

    return (
        <div className="min-h-screen bg-background text-text-main">
            <Navbar />

            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold">
                        Team <span className="gradient-text">Calendar</span>
                    </h1>
                    <p className="mt-1 text-sm text-gray-400">
                        Exams, hackathons and deadlines your whole team can see.
                    </p>
                </div>

                <CalendarToolbar
                    view={view}
                    cursor={cursor}
                    onViewChange={setView}
                    onPrev={() => step(-1)}
                    onNext={() => step(1)}
                    onToday={() => setCursor(new Date())}
                    onExport={exportPdf}
                    onAddEvent={(dateKey) =>
                        setModalEvent({ date: dateKey ?? toKey(new Date()) })
                    }
                    exporting={exporting}
                />

                {error && (
                    <div className="mb-4 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-2 text-sm text-red-400">
                        {error}
                    </div>
                )}

                <div ref={gridRef}>
                    <ViewComponent
                        cursor={cursor}
                        events={events}
                        onAddEvent={(dateKey) => setModalEvent({ date: dateKey })}
                        onSelectEvent={setDetailEvent}
                        onShowDay={setDayKey}
                    />
                </div>
            </div>

            {dayKey && (
                <DayEventsModal
                    dayKey={dayKey}
                    events={events}
                    onSelectEvent={(event) => {
                        setDayKey(null);
                        setDetailEvent(event);
                    }}
                    onClose={() => setDayKey(null)}
                />
            )}

            {detailEvent && !modalEvent && (
                <EventDetailModal
                    event={detailEvent}
                    onEdit={(event) => {
                        setDetailEvent(null);
                        setModalEvent(event);
                    }}
                    onDelete={deleteEvent}
                    onClose={() => setDetailEvent(null)}
                />
            )}

            {modalEvent && (
                <EventModal
                    event={modalEvent}
                    saving={saving}
                    onSave={saveEvent}
                    onDelete={deleteEvent}
                    onClose={() => setModalEvent(null)}
                />
            )}
        </div>
    );
}
