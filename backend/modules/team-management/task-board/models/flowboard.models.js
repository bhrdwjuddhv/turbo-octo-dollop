import mongoose from "mongoose";

const nodeSchema = new mongoose.Schema(
    {
        // Client-generated (crypto.randomUUID()); unique within a board.
        id: {
            type: String,
            required: true
        },

        // Registered React Flow nodeType: "shape" | "sticky" | "text" | "textUpdater".
        type: {
            type: String,
            required: true
        },

        // Canvas coordinates (not screen).
        position: {
            x: {
                type: Number,
                required: true
            },
            y: {
                type: Number,
                required: true
            }
        },

        width: {
            type: Number
        },

        height: {
            type: Number
        },

        // Opaque visual blob (label, shape, fill, stroke, color, fontSize,
        // fontWeight, fontFamily, textStyle, …). Kept as-is.
        data: {
            type: mongoose.Schema.Types.Mixed,
            default: {}
        }
    },
    { _id: false }
);

const edgeSchema = new mongoose.Schema(
    {
        // React Flow auto-generated edge id (e.g. "xy-edge__<src>r-<tgt>l").
        id: {
            type: String,
            required: true
        },

        source: {
            type: String,
            required: true
        },

        target: {
            type: String,
            required: true
        },

        // "t" | "r" | "b" | "l" | null
        sourceHandle: {
            type: String,
            default: null
        },

        targetHandle: {
            type: String,
            default: null
        },

        // "floating" is the board default (custom border-routing edge).
        type: {
            type: String,
            default: "floating"
        },

        // Arrowhead, e.g. { type: "arrowclosed", color: "#94a3b8" }.
        markerEnd: {
            type: mongoose.Schema.Types.Mixed,
            default: null
        }
    },
    { _id: false }
);

const flowBoardSchema = new mongoose.Schema(
    {
        // Owning team. Indexed (non-unique) for fast per-team lookups and the
        // create-time board-count check. NOT unique on purpose — a unique index
        // would wrongly cap premium teams at one board (see controller §create).
        teamId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Team",
            required: true,
            index: true
        },

        title: {
            type: String,
            trim: true,
            maxlength: 120,
            default: "Untitled board"
        },

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        // Last saved pan/zoom { x, y, zoom }. Optional — null means "fitView".
        viewport: {
            type: mongoose.Schema.Types.Mixed,
            default: null
        },

        nodes: {
            type: [nodeSchema],
            default: []
        },

        edges: {
            type: [edgeSchema],
            default: []
        }
    },
    { timestamps: true }
);

// Compound index for the "list a team's boards, newest first" query.
flowBoardSchema.index({ teamId: 1, updatedAt: -1 });

const FlowBoard = mongoose.model("FlowBoard", flowBoardSchema);

export { FlowBoard };
