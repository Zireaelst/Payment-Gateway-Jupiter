import { Request, Response } from 'express';
import { PublicKey, Connection } from '@solana/web3.js';
import { createJupiterApiClient } from '@jup-ag/api';
import { Payment } from '../models/payment';
import { Merchant } from '../models/merchant';
import { solanaConnection } from '../index';

const jupiterClient = createJupiterApiClient();
const USDC_MINT = new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v');

export const createPayment = async (req: Request, res: Response) => {
  try {
    const { merchantId, amount, inputToken } = req.body;

    // Validate merchant
    const merchant = await Merchant.findById(merchantId);
    if (!merchant) {
      return res.status(404).json({ error: 'Merchant not found' });
    }

    // Get quote for USDC conversion
    const quoteResponse = await jupiterClient.quoteGet({
      amount: amount.toString(),
      inputMint: inputToken,
      outputMint: USDC_MINT.toBase58(),
      slippageBps: 50,
    });

    // Create payment record
    const payment = new Payment({
      merchantId,
      amount,
      inputToken,
      inputAmount: amount.toString(),
      outputToken: USDC_MINT.toBase58(),
      outputAmount: quoteResponse.outAmount,
      paymentAddress: merchant.walletAddress,
      status: 'pending',
    });

    await payment.save();

    res.status(201).json({
      payment: {
        id: payment._id,
        amount: payment.amount,
        inputToken: payment.inputToken,
        paymentAddress: payment.paymentAddress,
        expectedOutputAmount: payment.outputAmount,
      },
    });
  } catch (error) {
    console.error('Error creating payment:', error);
    res.status(500).json({ error: 'Failed to create payment' });
  }
};

export const processPayment = async (req: Request, res: Response) => {
  try {
    const { paymentId, signature } = req.body;

    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    // Verify transaction
    const transaction = await solanaConnection.getTransaction(signature, {
      maxSupportedTransactionVersion: 0,
    });

    if (!transaction) {
      return res.status(400).json({ error: 'Invalid transaction' });
    }

    // Update payment status
    payment.status = 'received';
    payment.signature = signature;
    await payment.save();

    // Initiate USDC conversion
    await convertToUSDC(payment);

    res.json({ status: 'success', payment });
  } catch (error) {
    console.error('Error processing payment:', error);
    res.status(500).json({ error: 'Failed to process payment' });
  }
};

async function convertToUSDC(payment: any) {
  try {
    const merchant = await Merchant.findById(payment.merchantId);
    if (!merchant) {
      throw new Error('Merchant not found');
    }

    payment.status = 'converting';
    await payment.save();

    // Get latest quote
    const quoteResponse = await jupiterClient.quoteGet({
      amount: payment.inputAmount,
      inputMint: payment.inputToken,
      outputMint: USDC_MINT.toBase58(),
      slippageBps: 50,
    });

    // Execute swap
    const swapResult = await jupiterClient.swapInstructionsPost({
      swapRequest: {
        quoteResponse,
        userPublicKey: new PublicKey(merchant.walletAddress).toBase58(),
        wrapAndUnwrapSol: true,
        computeUnitPriceMicroLamports: 1000
      }
    });

    // Update payment with settlement details
    payment.status = 'settled';
    payment.settlementTx = JSON.stringify(swapResult);
    await payment.save();

    // Send webhook notification if configured
    if (merchant.webhookUrl) {
      // Implement webhook notification
    }
  } catch (error) {
    console.error('Error converting to USDC:', error);
    payment.status = 'failed';
    payment.error = error instanceof Error ? error.message : 'Unknown error occurred';
    await payment.save();
  }
} 