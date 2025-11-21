import { Router } from 'express';
import { getUsers } from '../controllers/user.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

router.get('/', authenticate, authorize(['ADMIN']), getUsers);

export default router;
