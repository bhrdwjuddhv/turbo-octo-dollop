import mongoose from "mongoose";
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const UserSchema = new mongoose.Schema({

    username:{
        type: String,
        required: true,
        lowercase: true,
        unique: true,
        trim: true
    },

    password: {
        type: String,
        required: true,
        select: false
    },

    avatar: {
        type: String,
        default: ""
    },

    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },

    coverImage: {
        type: String,
        default: "https://upload.wikimedia.org/wikipedia/commons/2/2c/Default_pfp.svg"
    },

    hackathonExperience: {
        type: Number,
        default: 0
    },

    location: {
        type: String
    },

    preferences: [{
        type: String
    }],

    techStack: [{
        type: String
    }],

    teamRole: [{
        type: String
    }],

    team: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Team"
    },

    projects:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project"
    }]

},{timestamps: true});

UserSchema.pre("save", async function (next) {
if (!this.isModified('password')) return next();
this.password = await bcrypt.hash(this.password, 12);
})

UserSchema.methods.comparePassword = function (password) {
    return bcrypt.compare(password, this.password);
}

UserSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
    )
}