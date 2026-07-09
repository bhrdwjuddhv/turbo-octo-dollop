import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import userRouter from './modules/auth/user.routes.js'
import teamRouter from './modules/team/team.routes.js'
import inviteRouter from './modules/invite/invite.routes.js'
import matchingRouter from './modules/matching/matching.routes.js'
import flowBoardRouter from './modules/team-management/task-board/routes/flowboard.routes.js'
import calendarEventRouter from './modules/team-management/calendar/routes/calendarEvent.routes.js'

const app = express();

app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
}));

app.use(express.json({
    limit: "16kb",
}));

app.use(express.urlencoded({
    extended: true,
    limit: "16kb",
}));

app.use(express.static("public"));
app.use(cookieParser());

// routes declaration
app.use("/api/v1/users", userRouter)
app.use("/api/v1/teams", teamRouter)
app.use("/api/v1/invites", inviteRouter)
app.use("/api/v1/matching", matchingRouter)
app.use("/api/v1/task-boards", flowBoardRouter)
app.use("/api/v1/calendar-events", calendarEventRouter)

// error handler
app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    
    return res.status(statusCode).json({
        success: false,
        message: message,
        errors: err.errors || []
    });
});

export { app };