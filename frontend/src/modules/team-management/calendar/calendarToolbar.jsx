import { ChevronLeft, ChevronRight, Download, Plus } from 'lucide-react';
import { EVENT_TYPES, VIEWS } from './calendarConfig.js';
import { monthLabel, weekLabel } from './calendarUtils.js';

/** Title + navigation + Week/Month switch + export + new-event. */
export default function CalendarToolbar({
    view,
    cursor,
    onViewChange,
    onPrev,
    onNext,
    onToday,
    onExport,
    onAddEvent,
    exporting,
}) {
    return (
        <div className="mb-6 flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={onPrev}
                        aria-label="Previous"
                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-border-dark bg-secondary text-gray-400 transition-colors hover:text-primary"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                        type="button"
                        onClick={onNext}
                        aria-label="Next"
                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-border-dark bg-secondary text-gray-400 transition-colors hover:text-primary"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </button>
                    <button
                        type="button"
                        onClick={onToday}
                        className="h-9 rounded-lg border border-border-dark bg-secondary px-3 text-sm font-semibold text-gray-300 transition-colors hover:text-primary"
                    >
                        Today
                    </button>

                    <h2 className="ml-2 text-xl font-bold text-text-main">
                        {view === 'month' ? monthLabel(cursor) : weekLabel(cursor)}
                    </h2>
                </div>

                <div className="flex items-center gap-2">
                    <div className="flex rounded-lg border border-border-dark bg-secondary p-0.5">
                        {VIEWS.map((v) => (
                            <button
                                key={v.id}
                                type="button"
                                onClick={() => onViewChange(v.id)}
                                className={[
                                    'rounded-md px-3 py-1.5 text-sm font-semibold transition-colors',
                                    view === v.id
                                        ? 'bg-primary text-background'
                                        : 'text-gray-400 hover:text-white',
                                ].join(' ')}
                            >
                                {v.label}
                            </button>
                        ))}
                    </div>

                    <button
                        type="button"
                        onClick={onExport}
                        disabled={exporting}
                        className="flex h-9 items-center gap-2 rounded-lg border border-border-dark bg-secondary px-3 text-sm font-semibold text-gray-300 transition-colors hover:text-primary disabled:opacity-50"
                    >
                        <Download className="h-4 w-4" />
                        {exporting ? 'Exporting…' : 'Download PDF'}
                    </button>

                    <button
                        type="button"
                        onClick={() => onAddEvent(null)}
                        className="flex h-9 items-center gap-2 rounded-lg border border-primary bg-primary/10 px-3 text-sm font-semibold text-primary transition-all hover:bg-primary hover:text-background"
                    >
                        <Plus className="h-4 w-4" />
                        New event
                    </button>
                </div>
            </div>

            {/* Type legend — colour key for the grid. */}
            <div className="flex flex-wrap items-center gap-4">
                {EVENT_TYPES.map((type) => (
                    <div key={type.id} className="flex items-center gap-1.5">
                        <span className={`h-2 w-2 rounded-full ${type.dot}`} />
                        <span className="text-xs text-gray-500">{type.label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
