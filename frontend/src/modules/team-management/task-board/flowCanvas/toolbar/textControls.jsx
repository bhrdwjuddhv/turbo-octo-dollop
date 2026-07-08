import { Minus, Plus, Heading, Baseline } from 'lucide-react';
import Popover from './popover.jsx';
import ToolButton from './toolButton.jsx';
import {
    TEXT_STYLES,
    FONT_WEIGHTS,
    FONT_SIZES,
} from '../config/canvasConfig.js';

/**
 * Typography controls for the toolbar: heading/body switch, font-weight menu
 * and a font-size stepper. All emit partial style patches through `onChange`,
 * which the toolbar applies to the selected node (or the new-node defaults).
 */
export default function TextControls({ style, onChange }) {
    const cycleSize = (dir) => {
        const idx = FONT_SIZES.indexOf(style.fontSize);
        const base = idx === -1 ? FONT_SIZES.indexOf(16) : idx;
        const next = Math.min(
            FONT_SIZES.length - 1,
            Math.max(0, base + dir),
        );
        onChange({ fontSize: FONT_SIZES[next] });
    };

    return (
        <div className="flex items-center gap-1">
            {/* Heading vs Body */}
            {TEXT_STYLES.map((ts) => {
                const Icon = ts.id === 'heading' ? Heading : Baseline;
                return (
                    <ToolButton
                        key={ts.id}
                        icon={Icon}
                        label={ts.label}
                        active={style.textStyle === ts.id}
                        onClick={() =>
                            onChange({
                                textStyle: ts.id,
                                fontFamily: ts.fontFamily,
                                fontWeight: ts.fontWeight,
                            })
                        }
                    />
                );
            })}

            {/* Font weight */}
            <Popover
                trigger={() => (
                    <button
                        type="button"
                        title="Font weight"
                        className="flex h-9 items-center rounded-xl px-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100"
                    >
                        <span style={{ fontWeight: style.fontWeight }}>Aa</span>
                    </button>
                )}
            >
                <div className="w-32">
                    {FONT_WEIGHTS.map((w) => (
                        <button
                            key={w.id}
                            type="button"
                            onClick={() => onChange({ fontWeight: w.value })}
                            className={[
                                'flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-left text-sm transition-colors hover:bg-slate-100',
                                style.fontWeight === w.value ? 'text-slate-900' : 'text-slate-500',
                            ].join(' ')}
                        >
                            <span style={{ fontWeight: w.value }}>{w.label}</span>
                            {style.fontWeight === w.value && (
                                <span className="h-1.5 w-1.5 rounded-full bg-slate-900" />
                            )}
                        </button>
                    ))}
                </div>
            </Popover>

            {/* Font size stepper */}
            <div className="rf-stepper flex items-center rounded-xl bg-slate-100/70">
                <button
                    type="button"
                    title="Smaller"
                    onClick={() => cycleSize(-1)}
                    className="flex h-9 w-8 items-center justify-center rounded-l-xl text-slate-600 hover:bg-slate-200"
                >
                    <Minus className="h-4 w-4" />
                </button>
                <span className="w-8 text-center text-sm tabular-nums text-slate-700">
                    {style.fontSize}
                </span>
                <button
                    type="button"
                    title="Larger"
                    onClick={() => cycleSize(1)}
                    className="flex h-9 w-8 items-center justify-center rounded-r-xl text-slate-600 hover:bg-slate-200"
                >
                    <Plus className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
}
