import { NodeResizer } from '@xyflow/react';
import EditableLabel from './editableLabel.jsx';
import NodeHandles from './nodeHandles.jsx';

/**
 * One component renders every geometric shape (rectangle / ellipse / diamond).
 * Geometry is driven by `data.shape`; all visual styling comes from node data
 * so the toolbar can mutate a single source of truth.
 *
 * The diamond is a rotated square with a counter-rotated label so the text
 * stays upright.
 */
export default function ShapeNode({ id, data, selected }) {
    const shape = data.shape ?? 'rectangle';
    const isEllipse = shape === 'ellipse';
    const isDiamond = shape === 'diamond';

    const surfaceStyle = {
        backgroundColor: data.fill,
        border: `2px solid ${data.stroke}`,
        borderRadius: isEllipse ? '50%' : isDiamond ? '10px' : '14px',
        transform: isDiamond ? 'rotate(45deg)' : undefined,
    };

    return (
        <>
            <NodeResizer
                isVisible={selected}
                minWidth={80}
                minHeight={48}
                lineClassName="rf-resize-line"
                handleClassName="rf-resize-handle"
                keepAspectRatio={isEllipse || isDiamond}
            />
            <NodeHandles />
            <div
                className="flex h-full w-full items-center justify-center shadow-sm transition-shadow"
                style={surfaceStyle}
            >
                <div
                    className="flex w-full items-center justify-center px-3"
                    style={{ transform: isDiamond ? 'rotate(-45deg)' : undefined }}
                >
                    <EditableLabel id={id} data={data} placeholder="Label" />
                </div>
            </div>
        </>
    );
}
