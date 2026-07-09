import dotenv from "dotenv";
dotenv.config({ path: ".env" });
import http from "http";
import { Server } from "socket.io";
import {app} from "./app.js";
import connectDB from "./db/index.js";
import { registerFlowBoardSocket } from "./modules/team-management/task-board/sockets/flowboard.socket.js";

// Socket.io needs the raw http.Server, so create it explicitly instead of
// letting app.listen() build one internally.
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: process.env.CORS_ORIGIN,
        credentials: true,
    },
});

registerFlowBoardSocket(io);

connectDB()
    .then(()=>{
        server.listen(process.env.PORT, ()=>{
            console.log("Listening on port " + process.env.PORT);
        })
    })
    .catch(err => console.log(err));
