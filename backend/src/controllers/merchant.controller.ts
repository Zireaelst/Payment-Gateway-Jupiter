import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Merchant, IMerchant } from '../models/merchant';
import { PublicKey } from '@solana/web3.js';

export const registerMerchant = async (req: Request, res: Response) => {
  try {
    const { name, email, walletAddress } = req.body;

    // Validate Solana wallet address
    try {
      new PublicKey(walletAddress);
    } catch (error) {
      return res.status(400).json({ error: 'Invalid Solana wallet address' });
    }

    // Check if merchant already exists
    const existingMerchant = await Merchant.findOne({ email });
    if (existingMerchant) {
      return res.status(400).json({ error: 'Merchant already exists' });
    }

    // Generate API key
    const apiKey = uuidv4();

    // Create merchant
    const merchant = new Merchant({
      name,
      email,
      walletAddress,
      apiKey,
    });

    await merchant.save();

    // Generate JWT token
    const token = jwt.sign(
      { merchantId: merchant._id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      merchant: {
        id: merchant._id,
        name: merchant.name,
        email: merchant.email,
        walletAddress: merchant.walletAddress,
        apiKey: merchant.apiKey,
      },
      token,
    });
  } catch (error) {
    console.error('Error registering merchant:', error);
    res.status(500).json({ error: 'Failed to register merchant' });
  }
};

export const getMerchantProfile = async (req: Request, res: Response) => {
  try {
    const merchant = await Merchant.findById(req.params.merchantId).select('-apiKey');
    if (!merchant) {
      return res.status(404).json({ error: 'Merchant not found' });
    }
    res.json(merchant);
  } catch (error) {
    console.error('Error fetching merchant profile:', error);
    res.status(500).json({ error: 'Failed to fetch merchant profile' });
  }
};

export const updateMerchantSettings = async (req: Request, res: Response) => {
  try {
    const { minSettlementAmount, autoSettlement, webhookUrl } = req.body;
    const merchant = await Merchant.findById(req.params.merchantId);

    if (!merchant) {
      return res.status(404).json({ error: 'Merchant not found' });
    }

    if (minSettlementAmount !== undefined) {
      merchant.minSettlementAmount = minSettlementAmount;
    }
    if (autoSettlement !== undefined) {
      merchant.autoSettlement = autoSettlement;
    }
    if (webhookUrl !== undefined) {
      merchant.webhookUrl = webhookUrl;
    }

    await merchant.save();
    res.json(merchant);
  } catch (error) {
    console.error('Error updating merchant settings:', error);
    res.status(500).json({ error: 'Failed to update merchant settings' });
  }
};

export const regenerateApiKey = async (req: Request, res: Response) => {
  try {
    const merchant = await Merchant.findById(req.params.merchantId);
    if (!merchant) {
      return res.status(404).json({ error: 'Merchant not found' });
    }

    merchant.apiKey = uuidv4();
    await merchant.save();

    res.json({ apiKey: merchant.apiKey });
  } catch (error) {
    console.error('Error regenerating API key:', error);
    res.status(500).json({ error: 'Failed to regenerate API key' });
  }
}; 