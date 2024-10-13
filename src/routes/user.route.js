import { Router } from 'express';
import { createUser, loginUser, updatePassword, deleteUser, updateUser, getAllUser } from '../controllers/user.controllers.js';
import { upload } from '../middlewares/multer.midlewares.js';
import { authUser } from '../middlewares/auth.midleware.js';
import { authorizeRolesAndPermissions } from '../middlewares/authorizeRolesAndPermissions.midleware.js';
import { authorizeUpdate } from '../middlewares/authorizeUpdate.midleware.js';

const router = Router();

// getUser, updateUser, deleteUser 

router.route('/create_user').post(
    // authUser,
    // authorizeRolesAndPermissions('createUser'),
    upload.single("profileImage"),
    createUser);
router.route('/login_user').post(loginUser)

// Protected Routes
router.route('/update_password').patch(authUser, updatePassword);
router.route('/delete_User/:employNumber').delete(authUser, authorizeRolesAndPermissions('deleteUser'), deleteUser);
router.route('/update_User/:_id').put(authUser, upload.single("profileImage"), authorizeUpdate, updateUser);
router.route('/all_user').get(getAllUser);
// router.route('/user/:id').put(updateUser);
// router.route('/user/:id').delete(deleteUser);

export default router;
