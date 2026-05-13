import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

export const verifyJWT = async (req, res, next) => {
    try {
        console.log("Verifying JWT...");
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")
        
        if (!token) {
            console.log("No token found");
            return res.status(401).json({ success: false, message: "Unauthorized request" });
        }
    
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
    
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
    
        if (!user) {
            console.log("User not found for token");
            return res.status(401).json({ success: false, message: "Invalid Access Token" });
        }
    
        req.user = user;
        console.log("JWT Verified for:", user.username);
        next()
    } catch (error) {
        console.error("JWT VERIFICATION ERROR:", error);
        return res.status(401).json({
            success: false,
            message: error?.message || "Invalid access token"
        });
    }
}
