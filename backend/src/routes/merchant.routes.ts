import { Router } from 'express';
import { body } from 'express-validator';
import {
  registerMerchant,
  getMerchantProfile,
  updateMerchantSettings,
  regenerateApiKey,
} from '../controllers/merchant.controller';
import { authenticateMerchant } from '../middleware/auth';

const router = Router();

// Validation middleware
const validateMerchantRegistration = [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('walletAddress').notEmpty().withMessage('Wallet address is required'),
];

const validateSettingsUpdate = [
  body('minSettlementAmount').optional().isFloat({ min: 0 }).withMessage('Invalid minimum settlement amount'),
  body('autoSettlement').optional().isBoolean().withMessage('Invalid auto settlement value'),
  body('webhookUrl').optional().isURL().withMessage('Invalid webhook URL'),
];

// Routes
router.post('/register', validateMerchantRegistration, registerMerchant);
router.get('/profile/:merchantId', authenticateMerchant, getMerchantProfile);
router.put('/settings/:merchantId', authenticateMerchant, validateSettingsUpdate, updateMerchantSettings);
router.post('/apikey/:merchantId/regenerate', authenticateMerchant, regenerateApiKey);

export default router; 