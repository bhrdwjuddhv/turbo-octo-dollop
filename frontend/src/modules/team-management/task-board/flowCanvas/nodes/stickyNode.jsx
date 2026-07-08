import { NodeResizer } from '@xyflow/react';
import EditableLabel from './editableLabel.jsx';
import NodeHandles from './nodeHandles.jsx';

/**
 * A sticky note — same data contract as the shape nodes but with a warmer,
 * paper-like default look (soft shadow, slight tilt-free square). `data.fill`
 * still drives the colour so the swatch picker works uniformly.
 */
export default function StickyNode({ id, data, selected }) {
    return (
        <>
            <NodeResizer
                isVisible={selected}
                minWidth={100}
                minHeight={100}
                lineClassName="rf-resize-line"
                handleClassName="rf-resize-handle"
            />
            <NodeHandles />
            <div
                className="flex h-full w-full items-start justify-start p-3 shadow-md"
                style={{
                    backgroundColor: data.fill,
                    borderRadius: '4px',
                    boxShadow: '0 6px 16px rgba(15, 23, 42, 0.12)',
                }}
            >
                <div className="w-full text-left">
                    <EditableLabel id={id} data={data} placeholder="Write a note…" />
                </div>
            </div>
        </>
    );
}
