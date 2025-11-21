import { Router } from 'express';
import { createSale, getSales, getSale, getSalesByUser } from '../controllers/sale.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

router.post('/', authenticate, createSale);
router.get('/', authenticate, getSales);
router.get('/user/:userId', authenticate, authorize(['ADMIN']), getSalesByUser);
router.get('/:id', authenticate, getSale);

export default router;
