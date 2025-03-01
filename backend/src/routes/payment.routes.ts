import { Router } from 'express';
import { body } from 'express-validator';
import { createPayment, processPayment } from '../controllers/payment.controller';
import { authenticateApiKey } from '../middleware/auth';

const router = Router();

// Validation middleware
const validatePaymentRequest = [
  body('merchantId').notEmpty().withMessage('Merchant ID is required'),
  body('amount').isNumeric().withMessage('Valid amount is required'),
  body('inputToken').notEmpty().withMessage('Input token is required'),
];

// Routes
router.post('/create', authenticateApiKey, validatePaymentRequest, createPayment);
router.post('/process', authenticateApiKey, processPayment);

export default router; 