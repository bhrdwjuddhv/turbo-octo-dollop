import jwt from "jsonwebtoken";
import { User } from "../../../auth/user.model.js";

/*
 * Socket.io handshake auth. Deliberately mirrors middlewares/auth.middleware.js
 * (verifyJWT) — same `accessToken` cookie, same ACCESS_TOKEN_SECRET, same User
 * lookup. No new auth mechanism is introduced.
 *
 * The browser sends the httpOnly `accessToken` cookie on the socket handshake
 * when the client connects with `withCredentials: true` (cookies ignore port,
 * so the vite dev origin and the API origin share it).
 */

const parseCookies = (header = "") =>
    header.split(";").reduce((acc, part) => {
        const idx = part.indexOf("=");

        if (idx > -1) {
            const key = part.slice(0, idx).trim();
            const value = part.slice(idx + 1).trim();
            acc[key] = decodeURIComponent(value);
        }

        return acc;
    }, {});

export const authenticateSocket = async (socket, next) => {
    try {
        const cookies = parseCookies(socket.handshake.headers?.cookie);

        // Cookie first (browser), then an explicit handshake token (non-browser clients).
        const token = cookies.accessToken || socket.handshake.auth?.token;

        if (!token) {
            return next(new Error("Unauthorized request"));
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        const user = await User.findById(decodedToken?._id).select(
            "-password -refreshToken"
        );

        if (!user) {
            return next(new Error("Invalid Access Token"));
        }

        socket.user = user;

        return next();
    } catch (error) {
        return next(new Error(error?.message || "Invalid access token"));
    }
};
