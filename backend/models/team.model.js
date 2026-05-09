import mongoose from "mongoose";

const TeamSchema = new mongoose.Schema({

    name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 50,
        index: true
    },

    description: {
        type: String,
        trim: true,
        maxlength: 500,
        default: ""
    },

    teamAvatar: {
        type: String,
        default: ""
    },

    bannerImage: {
        type: String,
        default: ""
    },

    leader: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true
    },

    members: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        index: true
    }],

    requiredSkills: [{
        type: String,
        trim: true,
        lowercase: true,
        index: true
    }],

    maxMembers: {
        type: Number,
        default: 4,
        min: 1,
        max: 20
    },

    status: {
        type: String,
        enum: ["open", "closed"],
        default: "open",
        index: true
    },

    hackathonName: {
        type: String,
        trim: true,
        index: true,
        default: ""
    },

    projectIdea: {
        type: String,
        trim: true,
        maxlength: 1000,
        default: ""
    }

}, { timestamps: true });


const Team = mongoose.model("Team", TeamSchema);
export {Team}