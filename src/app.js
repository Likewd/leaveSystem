import express from "express"
import cookieParser from "cookie-parser"
import cors from "cors"

const app = express()

app.use(express.json({ limit: "16kb" }))
app.use(express.urlencoded({ extended: true, limit: "16kb" }))
app.use(express.static("public"))

app.use(cors({
    origin: process.env.ORIGIN,
    credentials: true
}))
app.use(cookieParser())


// import router
import permissionRouter from "./routes/permission.route.js"
import roleRouter from "./routes/role.route.js"
import departmentRouter from "./routes/department.route.js"
import globalErrorHandler from "./utils/globalErrorHandler.js"
import userRouter from "./routes/user.route.js"
import leaveRouter from "./routes/leave.route.js"
import { ApiError } from "./utils/ApiError.js"

app.use("/api/v1/user", userRouter)
app.use("/api/v1/permission", permissionRouter)
app.use("/api/v1/role", roleRouter)
app.use("/api/v1/department", departmentRouter)
app.use("/api/v1/leave", leaveRouter)
app.all("*", (req, res, next) => {
    next(new ApiError(`This path ${req.originalUrl} isn't on this server!`, 404));
});

// console.log(process.env.);

app.use(globalErrorHandler)
export default app