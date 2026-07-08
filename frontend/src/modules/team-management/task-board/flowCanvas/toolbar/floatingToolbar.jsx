import { PaintBucket, PenLine, Type, Trash2 } from 'lucide-react';
import ToolButton from './toolButton.jsx';
import ColorControl from './colorControl.jsx';
import TextControls from './textControls.jsx';
import ViewControls from './viewControls.jsx';
import {
    SHAPE_TOOLS,
    COLOR_SWATCHES,
    STROKE_SWATCHES,
    TEXT_COLORS,
} from '../config/canvasConfig.js';

/**
 * The floating, glassy pill pinned to the bottom-centre of the canvas.
 *
 * Sections, left → right:
 *   1. Shape/node creators (driven entirely by SHAPE_TOOLS — add an entry there
 *      to add a tool, no change needed here).
 *   2. Fill / stroke / text colour pickers.
 *   3. Typography controls.
 *   4. View controls (background dots + theme).
 *   5. Delete (only shown when a node is selected).
 *
 * Style controls act on the selected node when there is one, otherwise they
 * update the defaults applied to the next node created.
 */
const Divider = () => <span className="mx-1 h-6 w-px bg-slate-200 dark:bg-slate-600" />;

export default function FloatingToolbar({
    onAddNode,
    style,
    onStyleChange,
    hasSelection,
    onDelete,
    backgroundOn,
    onToggleBackground,
    colorMode,
    onCycleColorMode,
}) {
    return (
        <div className="pointer-events-none absolute bottom-6 left-1/2 z-10 -translate-x-1/2">
            <div className="rf-toolbar pointer-events-auto flex items-center gap-1 rounded-2xl border border-white/60 bg-white/80 px-2 py-1.5 shadow-[0_8px_30px_rgba(15,23,42,0.12)] backdrop-blur-xl">
                {/* 1. Shapes */}
                {SHAPE_TOOLS.map((tool) => (
                    <ToolButton
                        key={tool.id}
                        icon={tool.icon}
                        label={`Add ${tool.label.toLowerCase()}`}
                        onClick={() => onAddNode(tool)}
                    />
                ))}

                <Divider />

                {/* 2. Colours */}
                <ColorControl
                    icon={PaintBucket}
                    label="Fill"
                    swatches={COLOR_SWATCHES}
                    valueKey="fill"
                    current={style.fill}
                    onPick={(s) =>
                        onStyleChange(
                            s.stroke ? { fill: s.fill, stroke: s.stroke } : s,
                        )
                    }
                />
                <ColorControl
                    icon={PenLine}
                    label="Stroke"
                    swatches={STROKE_SWATCHES}
                    valueKey="stroke"
                    current={style.stroke}
                    onPick={(s) => onStyleChange({ stroke: s.stroke })}
                />
                <ColorControl
                    icon={Type}
                    label="Text colour"
                    swatches={TEXT_COLORS}
                    valueKey="color"
                    current={style.color}
                    onPick={(s) => onStyleChange({ color: s.color })}
                />

                <Divider />

                {/* 3. Typography */}
                <TextControls style={style} onChange={onStyleChange} />

                <Divider />

                {/* 4. View: background dots + theme */}
                <ViewControls
                    backgroundOn={backgroundOn}
                    onToggleBackground={onToggleBackground}
                    colorMode={colorMode}
                    onCycleColorMode={onCycleColorMode}
                />

                {/* 5. Delete */}
                {hasSelection && (
                    <>
                        <Divider />
                        <ToolButton
                            icon={Trash2}
                            label="Delete selection"
                            onClick={onDelete}
                        />
                    </>
                )}
            </div>
        </div>
    );
}
