import { Router } from 'express';
import { createUser} from '../controllers/user.controllers.js';
import { upload } from '../middlewares/multer.midlewares.js';

const router = Router();

// getUser, updateUser, deleteUser 

router.route('/create_user').post(upload.single("profileImage"), createUser);
// router.route('/user').get(getUser);
// router.route('/user/:id').put(updateUser);
// router.route('/user/:id').delete(deleteUser);

export default router;
