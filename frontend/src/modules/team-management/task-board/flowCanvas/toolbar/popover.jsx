import { useEffect, useRef, useState } from 'react';

/**
 * Lightweight click-to-toggle popover that floats above its trigger. Used by
 * the colour controls. Closes on outside-click or Escape. No portal needed —
 * the toolbar sits above the canvas so absolute positioning is enough.
 */
export default function Popover({ trigger, children, align = 'center' }) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        if (!open) return;
        const onDown = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        };
        const onKey = (e) => e.key === 'Escape' && setOpen(false);
        document.addEventListener('mousedown', onDown);
        document.addEventListener('keydown', onKey);
        return () => {
            document.removeEventListener('mousedown', onDown);
            document.removeEventListener('keydown', onKey);
        };
    }, [open]);

    const alignClass =
        align === 'left'
            ? 'left-0'
            : align === 'right'
              ? 'right-0'
              : 'left-1/2 -translate-x-1/2';

    return (
        <div className="relative" ref={ref}>
            <div onClick={() => setOpen((v) => !v)}>{trigger(open)}</div>
            {open && (
                <div
                    className={[
                        'rf-popover absolute bottom-full z-20 mb-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-xl',
                        alignClass,
                    ].join(' ')}
                >
                    {children}
                </div>
            )}
        </div>
    );
}
