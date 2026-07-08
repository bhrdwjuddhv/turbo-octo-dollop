import Popover from './popover.jsx';

/**
 * Reusable swatch picker used for fill, stroke and text colour. Renders a
 * trigger dot in the toolbar; the popover shows preset swatches plus a native
 * colour input for a fully custom pick.
 *
 * `swatches`  -> [{ id, ...colorKeys }]  each item is spread into onChange
 * `valueKey`  -> which key on a swatch is the current value (e.g. 'fill')
 * `current`   -> current colour string for the trigger preview
 */
export default function ColorControl({ icon: Icon, label, swatches, valueKey, current, onPick }) {
    return (
        <Popover
            trigger={() => (
                <button
                    type="button"
                    title={label}
                    aria-label={label}
                    className="flex h-9 items-center gap-1.5 rounded-xl px-2 text-slate-600 transition-colors hover:bg-slate-100"
                >
                    {Icon && <Icon className="h-[18px] w-[18px]" strokeWidth={1.75} />}
                    <span
                        className="h-4 w-4 rounded-full border border-slate-300"
                        style={{ backgroundColor: current }}
                    />
                </button>
            )}
        >
            <div className="w-44">
                <p className="mb-2 px-0.5 text-[11px] font-medium uppercase tracking-wide text-slate-400">
                    {label}
                </p>
                <div className="grid grid-cols-4 gap-2">
                    {swatches.map((swatch) => {
                        const value = swatch[valueKey];
                        const isActive = value?.toLowerCase() === current?.toLowerCase();
                        return (
                            <button
                                key={swatch.id}
                                type="button"
                                onClick={() => onPick(swatch)}
                                title={swatch.id}
                                className={[
                                    'h-8 w-8 rounded-lg border transition-transform hover:scale-110',
                                    isActive
                                        ? 'border-slate-900 ring-2 ring-slate-900/20'
                                        : 'border-slate-200',
                                ].join(' ')}
                                style={{ backgroundColor: value }}
                            />
                        );
                    })}
                </div>
                <label className="mt-3 flex items-center gap-2 rounded-lg border border-slate-200 px-2 py-1.5">
                    <input
                        type="color"
                        value={current || '#ffffff'}
                        onChange={(e) => onPick({ [valueKey]: e.target.value })}
                        className="h-6 w-6 cursor-pointer rounded border-0 bg-transparent p-0"
                    />
                    <span className="text-xs text-slate-500">Custom…</span>
                </label>
            </div>
        </Popover>
    );
}
