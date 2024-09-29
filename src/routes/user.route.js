import { Router } from 'express';
import { createUser, loginUser, updatePassword } from '../controllers/user.controllers.js';
import { upload } from '../middlewares/multer.midlewares.js';
import { authUser } from '../middlewares/auth.midleware.js';

const router = Router();

// getUser, updateUser, deleteUser 

router.route('/create_user').post(upload.single("profileImage"), createUser);
router.route('/login_user').get(loginUser)

// Protected Routes
router.route('/update_password').patch(authUser, updatePassword);
// router.route('/user').get(getUser);
// router.route('/user/:id').put(updateUser);
// router.route('/user/:id').delete(deleteUser);

export default router;
