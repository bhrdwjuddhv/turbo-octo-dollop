import dotenv from "dotenv";
dotenv.config({ path: ".env" });
import http from "http";
import { Server } from "socket.io";
import {app} from "./app.js";
import connectDB from "./db/index.js";
import { registerFlowBoardSocket } from "./modules/team-management/task-board/sockets/flowboard.socket.js";
import { registerTeamChatSocket } from "./modules/team-management/chat/sockets/chat.socket.js";

// Socket.io needs the raw http.Server, so create it explicitly instead of
// letting app.listen() build one internally.
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        // Both socket clients connect cross-origin (vite :5173 -> api :8000) with
        // `withCredentials: true` so the httpOnly accessToken cookie rides along.
        // A literal "*" origin is INVALID for credentialed requests — the browser
        // rejects `Access-Control-Allow-Origin: *` when credentials are included,
        // which would kill the polling transport. `true` reflects the caller's
        // origin instead, which is credential-safe.
        origin: process.env.CORS_ORIGIN === "*" ? true : process.env.CORS_ORIGIN,
        credentials: true,
    },
});

// Both features share this one Socket.io server, each on its own namespace:
// flowboard collab on /flowboard, team chat on /team-chat.
registerFlowBoardSocket(io);
registerTeamChatSocket(io);

connectDB()
    .then(()=>{
        server.listen(process.env.PORT, ()=>{
            console.log("Listening on port " + process.env.PORT);
        })
    })
    .catch(err => console.log(err));
