/**
 * Small, reusable icon button for the floating toolbar. Keeps every tool
 * visually consistent so adding a new one is just `<ToolButton icon={...} />`.
 */
export default function ToolButton({
    icon: Icon,
    label,
    onClick,
    active = false,
    children,
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            title={label}
            aria-label={label}
            className={[
                'flex h-9 min-w-9 items-center justify-center gap-1.5 rounded-xl px-2',
                'text-slate-600 transition-colors',
                'hover:bg-slate-100 active:bg-slate-200',
                active ? 'bg-slate-900 text-white hover:bg-slate-900' : '',
            ].join(' ')}
        >
            {Icon && <Icon className="h-[18px] w-[18px]" strokeWidth={1.75} />}
            {children}
        </button>
    );
}
