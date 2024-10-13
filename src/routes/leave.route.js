import { Router } from "express";
import { createLeaveRequest } from "../controllers/leave.controllers.js";


const router = Router();


router.route("/create").post(createLeaveRequest)


export default router