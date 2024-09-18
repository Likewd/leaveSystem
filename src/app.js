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

app.use("/api/v1/permission", permissionRouter)
export default app