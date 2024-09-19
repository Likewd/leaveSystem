import { Router } from "express";
import { createRole, getAllRole } from "../controllers/role.controllers.js";

const router = Router()

router.route("/create").post(createRole)
router.route("/all").get(getAllRole)

export default router