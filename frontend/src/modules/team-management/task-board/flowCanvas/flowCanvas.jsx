import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    ReactFlow,
    ReactFlowProvider,
    Background,
    BackgroundVariant,
    Controls,
    MiniMap,
    ConnectionMode,
    addEdge,
    useNodesState,
    useEdgesState,
    useReactFlow,
    MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import './flowCanvas.css';

import { useAuth } from '../../../auth/context/AuthContext.jsx';
import { nodeTypes } from './nodes/nodeTypes.js';
import { edgeTypes } from './edges/edgeTypes.js';
import FloatingConnectionLine from './edges/floatingConnectionLine.jsx';
import FloatingToolbar from './toolbar/floatingToolbar.jsx';
import useCollaboration from './collab/useCollaboration.js';
import CollabCursors from './collab/collabCursors.jsx';
import PresenceBar from './collab/presenceBar.jsx';
import { DEFAULT_NODE_STYLE, CANVAS_EXTENT } from './config/canvasConfig.js';

/** Kept from the original module so existing sample data still renders. */
const initialNodes = [
    {
        id: 'node-1',
        type: 'shape',
        position: { x: 0, y: 0 },
        data: {
            ...DEFAULT_NODE_STYLE,
            shape: 'rectangle',
            label: 'Start here',
        },
        width: 160,
        height: 90,
    },
];

// Edges default to the custom "floating" type so they route border-to-border
// (no gap on ellipses/diamonds). See edges/floatingEdge.jsx.
const defaultEdgeOptions = {
    type: 'floating',
    markerEnd: { type: MarkerType.ArrowClosed, color: '#94a3b8' },
};

const COLOR_MODES = ['light', 'dark', 'system'];

const uid = () =>
    (crypto.randomUUID?.() ?? `n-${Date.now()}-${Math.random().toString(36).slice(2)}`);

function Canvas({ boardId }) {
    const wrapperRef = useRef(null);
    const { screenToFlowPosition } = useReactFlow();
    const auth = useAuth();

    // When collaborating, the board's contents arrive from the Yjs sync — don't
    // seed local sample state or we'd push it into the shared document.
    const [nodes, setNodes, onNodesChange] = useNodesState(boardId ? [] : initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);

    // Style applied to newly created nodes (mirrors the toolbar when nothing
    // is selected). Selecting a node surfaces that node's own style instead.
    const [defaults, setDefaults] = useState(DEFAULT_NODE_STYLE);
    const [selectedIds, setSelectedIds] = useState([]);

    // View state: background dots on/off and the React Flow colour mode.
    const [backgroundOn, setBackgroundOn] = useState(true);
    const [colorMode, setColorMode] = useState('system');

    // Resolve `system` to a concrete light/dark so the dot colour, minimap and
    // the (out-of-canvas) floating toolbar can theme themselves consistently.
    const [systemDark, setSystemDark] = useState(
        () => window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false,
    );
    useEffect(() => {
        const mq = window.matchMedia?.('(prefers-color-scheme: dark)');
        if (!mq) return;
        const onChange = (e) => setSystemDark(e.matches);
        mq.addEventListener('change', onChange);
        return () => mq.removeEventListener('change', onChange);
    }, []);
    const isDark = colorMode === 'dark' || (colorMode === 'system' && systemDark);

    const cycleColorMode = useCallback(() => {
        setColorMode((m) => COLOR_MODES[(COLOR_MODES.indexOf(m) + 1) % COLOR_MODES.length]);
    }, []);

    const onConnect = useCallback(
        // Stamp the type/marker onto the stored edge (not just at render) so the
        // serialised state saved to the backend matches backendSchema.md.
        (params) => setEdges((eds) => addEdge({ ...params, ...defaultEdgeOptions }, eds)),
        [setEdges],
    );

    const onSelectionChange = useCallback(({ nodes: sel }) => {
        setSelectedIds(sel.map((n) => n.id));
    }, []);

    // The style the toolbar reads/writes: first selected node's data, else defaults.
    const activeStyle = useMemo(() => {
        const selectedNode = nodes.find((n) => n.id === selectedIds[0]);
        return { ...DEFAULT_NODE_STYLE, ...(selectedNode?.data ?? defaults) };
    }, [nodes, selectedIds, defaults]);

    const addNode = useCallback(
        (tool) => {
            // Drop new nodes at the centre of the visible canvas (+ jitter so
            // repeated adds don't stack perfectly on top of each other).
            const rect = wrapperRef.current?.getBoundingClientRect();
            const center = rect
                ? screenToFlowPosition({
                      x: rect.left + rect.width / 2,
                      y: rect.top + rect.height / 2,
                  })
                : { x: 0, y: 0 };
            const jitter = () => (Math.random() - 0.5) * 40;

            const node = {
                id: uid(),
                type: tool.type,
                position: {
                    x: center.x - tool.size.width / 2 + jitter(),
                    y: center.y - tool.size.height / 2 + jitter(),
                },
                width: tool.size.width,
                height: tool.size.height,
                data: {
                    ...defaults,
                    ...tool.data,
                    shape: tool.shape,
                },
            };
            setNodes((nds) => nds.map((n) => ({ ...n, selected: false })).concat({ ...node, selected: true }));
        },
        [defaults, screenToFlowPosition, setNodes],
    );

    const onStyleChange = useCallback(
        (patch) => {
            if (selectedIds.length > 0) {
                setNodes((nds) =>
                    nds.map((n) =>
                        selectedIds.includes(n.id)
                            ? { ...n, data: { ...n.data, ...patch } }
                            : n,
                    ),
                );
            }
            // Always fold into defaults too, so the next new node inherits it.
            setDefaults((d) => ({ ...d, ...patch }));
        },
        [selectedIds, setNodes],
    );

    const onDelete = useCallback(() => {
        setNodes((nds) => nds.filter((n) => !selectedIds.includes(n.id)));
        setEdges((eds) =>
            eds.filter(
                (e) =>
                    !selectedIds.includes(e.source) &&
                    !selectedIds.includes(e.target) &&
                    !e.selected,
            ),
        );
        setSelectedIds([]);
    }, [selectedIds, setNodes, setEdges]);

    // Real-time collaboration. No boardId -> `enabled: false` and every handler
    // is a no-op, so the canvas behaves exactly as it does standalone.
    const {
        enabled: collabEnabled,
        synced,
        connected,
        error: collabError,
        peers,
        remoteSelections,
        onPointerMove,
        onPointerLeave,
    } = useCollaboration({
        boardId,
        user: auth?.user,
        nodes,
        edges,
        setNodes,
        setEdges,
        selectedIds,
        screenToFlowPosition,
    });

    // Outline nodes that a remote collaborator currently has selected.
    const renderedNodes = useMemo(() => {
        if (!collabEnabled) return nodes;
        return nodes.map((node) => {
            const color = remoteSelections[node.id];
            if (!color) return node;
            return {
                ...node,
                style: {
                    ...node.style,
                    outline: `2px solid ${color}`,
                    outlineOffset: 3,
                    borderRadius: 12,
                },
            };
        });
    }, [nodes, collabEnabled, remoteSelections]);

    return (
        <div
            ref={wrapperRef}
            className={`flow-canvas-shell relative h-full w-full${isDark ? ' dark' : ''}`}
            onPointerMove={collabEnabled ? onPointerMove : undefined}
            onPointerLeave={collabEnabled ? onPointerLeave : undefined}
        >
            <ReactFlow
                className="flow-canvas"
                nodes={renderedNodes}
                edges={edges}
                nodeTypes={nodeTypes}
                edgeTypes={edgeTypes}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onSelectionChange={onSelectionChange}
                defaultEdgeOptions={defaultEdgeOptions}
                connectionMode={ConnectionMode.Loose}
                connectionLineComponent={FloatingConnectionLine}
                deleteKeyCode={['Backspace', 'Delete']}
                selectionKeyCode="Shift"
                multiSelectionKeyCode={['Meta', 'Control']}
                minZoom={0.2}
                maxZoom={2.5}
                fitView
                colorMode={colorMode}
                translateExtent={CANVAS_EXTENT}
                nodeExtent={CANVAS_EXTENT}
                proOptions={{ hideAttribution: false }}
            >
                {backgroundOn && (
                    <Background
                        variant={BackgroundVariant.Dots}
                        gap={22}
                        size={1.5}
                        color={isDark ? '#334155' : '#e2e8f0'}
                    />
                )}
                <Controls showInteractive={false} />
                <MiniMap
                    pannable
                    zoomable
                    nodeColor={(n) => n.data?.fill ?? '#e2e8f0'}
                    maskColor={
                        isDark ? 'rgba(15, 23, 42, 0.6)' : 'rgba(241, 245, 249, 0.6)'
                    }
                    className="!rounded-xl !shadow-lg"
                />

                {collabEnabled && <CollabCursors peers={peers} />}
            </ReactFlow>

            {collabEnabled && (
                <PresenceBar
                    peers={peers}
                    connected={connected}
                    synced={synced}
                    error={collabError}
                />
            )}

            <FloatingToolbar
                onAddNode={addNode}
                style={activeStyle}
                onStyleChange={onStyleChange}
                hasSelection={selectedIds.length > 0}
                onDelete={onDelete}
                backgroundOn={backgroundOn}
                onToggleBackground={() => setBackgroundOn((v) => !v)}
                colorMode={colorMode}
                onCycleColorMode={cycleColorMode}
            />
        </div>
    );
}

/**
 * Public entry. Wrapped in ReactFlowProvider so the toolbar and canvas can both
 * use React Flow hooks (screenToFlowPosition, etc.).
 *
 * Collaboration turns on only when a board id is supplied — either via the
 * `boardId` prop or a `?board=<flowboardId>` query param. Without one the canvas
 * runs purely locally, exactly as before.
 */
export default function FlowCanvas({ boardId: boardIdProp }) {
    const boardId = useMemo(() => {
        if (boardIdProp) return boardIdProp;
        if (typeof window === 'undefined') return null;
        return new URLSearchParams(window.location.search).get('board');
    }, [boardIdProp]);

    return (
        <ReactFlowProvider>
            <Canvas boardId={boardId} />
        </ReactFlowProvider>
    );
}
