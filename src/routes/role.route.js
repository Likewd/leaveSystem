import { Router } from "express";
import { createRole, deleteRole, getAllRole, updatePermission, deletePermissionsInRole } from "../controllers/role.controllers.js";

const router = Router()

router.route("/create").post(createRole)
router.route("/all").get(getAllRole)
router.route("/update/:_id").put(updatePermission)
router.route("/:roleId/permissions/:permissionId").patch(deletePermissionsInRole)
router.route("/delete/:_id").delete(deleteRole)

export default router