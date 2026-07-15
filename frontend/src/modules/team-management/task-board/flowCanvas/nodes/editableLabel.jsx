import { useEffect, useRef, useState } from 'react';
import { useReactFlow } from '@xyflow/react';

/**
 * Inline, double-click-to-edit text used by every node component.
 * On blur / Escape it writes the value back into the node's data via
 * setNodes so the change lives in the single React Flow state tree.
 *
 * `nodrag`/`nowheel` keep React Flow from stealing pointer + wheel events
 * while the user is typing.
 */
export default function EditableLabel({ id, data, placeholder = 'Type…' }) {
    const { setNodes } = useReactFlow();
    const [editing, setEditing] = useState(false);
    const [draft, setDraft] = useState('');
    const ref = useRef(null);

    // Seed the draft from the latest label, then enter edit mode.
    const startEditing = () => {
        setDraft(data.label ?? '');
        setEditing(true);
    };

    useEffect(() => {
        if (editing && ref.current) {
            ref.current.focus();
            ref.current.select();
        }
    }, [editing]);

    const commit = () => {
        setEditing(false);
        setNodes((nodes) =>
            nodes.map((node) =>
                node.id === id
                    ? { ...node, data: { ...node.data, label: draft } }
                    : node,
            ),
        );
    };

    const textStyle = {
        color: data.color,
        fontSize: data.fontSize,
        fontWeight: data.fontWeight,
        fontFamily: data.fontFamily,
    };

    if (editing) {
        return (
            <textarea
                ref={ref}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onBlur={commit}
                onKeyDown={(e) => {
                    if (e.key === 'Escape') commit();
                    if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        commit();
                    }
                }}
                className="nodrag nowheel w-full resize-none bg-transparent text-center outline-none"
                style={{ ...textStyle, minHeight: '1.5em' }}
            />
        );
    }

    return (
        <div
            onDoubleClick={startEditing}
            className="w-full whitespace-pre-wrap break-words text-center leading-snug"
            style={textStyle}
        >
            {data.label || (
                <span className="opacity-40">{placeholder}</span>
            )}
        </div>
    );
}
