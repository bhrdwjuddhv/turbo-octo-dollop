import { NodeResizer } from '@xyflow/react';
import EditableLabel from './editableLabel.jsx';
import NodeHandles from './nodeHandles.jsx';

/**
 * A frameless text node — no fill or border, just typographic content. Ideal
 * for headings and labels floating on the board. Still connectable so text can
 * annotate an edge/flow.
 */
export default function TextNode({ id, data, selected }) {
    return (
        <>
            <NodeResizer
                isVisible={selected}
                minWidth={60}
                minHeight={32}
                lineClassName="rf-resize-line"
                handleClassName="rf-resize-handle"
            />
            <NodeHandles />
            <div
                className="flex h-full w-full items-center justify-center rounded-md px-2"
                style={{
                    outline: selected ? '1px dashed #CBD5E1' : 'none',
                    outlineOffset: '4px',
                }}
            >
                <EditableLabel id={id} data={data} placeholder="Text" />
            </div>
        </>
    );
}
