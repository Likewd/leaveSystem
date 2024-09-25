import { Router } from "express";
import {
    createDepartment,
    deleteDepartment,
    updateDepartmentHOD,
    updateDepartmentName,
    allDepartment

} from "../controllers/department.controllers.js";

const router = Router()

router.route("/create")
    .post(createDepartment)
router.route("/delete/:_id").delete(deleteDepartment)
router.route("/update_hodName/:_id").patch(updateDepartmentHOD)
router.route("/update_departmentName/:_id").patch(updateDepartmentName)
router.route("/all").get(allDepartment)

export default router