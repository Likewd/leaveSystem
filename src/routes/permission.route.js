import { Router } from "express";
import { createPermission } from "../controllers/permission.controllers.js";

const router = Router()

router.route("/create").post(createPermission)

export default router