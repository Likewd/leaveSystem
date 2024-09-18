import { Router } from "express";
import {
    createPermission,
    deletePermission,
    getAllPermission
} from "../controllers/permission.controllers.js";

const router = Router()

router.route("/create")
    .post(createPermission)
router.route("/delete/:_id").delete(deletePermission)
router.route("/all").get(getAllPermission)

export default router