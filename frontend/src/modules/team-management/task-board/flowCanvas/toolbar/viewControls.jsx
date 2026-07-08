import { Grid3x3, Sun, Moon, Monitor } from 'lucide-react';
import ToolButton from './toolButton.jsx';

/**
 * Canvas view controls: toggle the background dots, and cycle the colour mode
 * light → dark → system. Kept in its own component so the main toolbar stays
 * declarative and new view options are easy to slot in here.
 */
const MODE_META = {
    light: { icon: Sun, label: 'Theme: light (click for dark)' },
    dark: { icon: Moon, label: 'Theme: dark (click for system)' },
    system: { icon: Monitor, label: 'Theme: system (click for light)' },
};

export default function ViewControls({
    backgroundOn,
    onToggleBackground,
    colorMode,
    onCycleColorMode,
}) {
    const { icon: ModeIcon, label } = MODE_META[colorMode] ?? MODE_META.system;

    return (
        <div className="flex items-center gap-1">
            <ToolButton
                icon={Grid3x3}
                label={backgroundOn ? 'Hide background dots' : 'Show background dots'}
                active={backgroundOn}
                onClick={onToggleBackground}
            />
            <ToolButton icon={ModeIcon} label={label} onClick={onCycleColorMode} />
        </div>
    );
}
