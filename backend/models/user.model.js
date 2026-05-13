import mongoose, {Schema} from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    password: {
        type: String,
        required: [true, 'Password is required']
    },
    avatar: {
        type: String, // cloudinary url
        required: false
    },
    coverImage: {
        type: String, // cloudinary url
        required: false
    },
    fullName: {
        type: String,
        required: false
    },
    bio: {
        type: String,
        required: false
    },
    team_role: {
        type: String,
        required: false
    },
    location: {
        type: String,
        required: false
    },
    techStack: [
        {
            type: String
        }
    ],
    experience: [
        {
            type: String
        }
    ],
    preferences: [
        {
            type: String
        }
    ],
    projects: [
        {
            type: String
        }
    ],
    socialLinks: {
        github: { type: String },
        linkedin: { type: String },
        others: [
            {
                platform: { type: String },
                url: { type: String }
            }
        ]
    },
    refreshToken: {
        type: String
    }
}, {timestamps: true})

userSchema.pre("save", async function () {
    if(!this.isModified("password")) return;
    this.password = await bcrypt.hash(this.password, 10)
})

userSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password, this.password)
}

userSchema.methods.generateAccessToken = function(){
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY || "1d"
        }
    )
}

userSchema.methods.generateRefreshToken = function(){
    return jwt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY || "10d"
        }
    )
}

export const User = mongoose.model("User", userSchema)
