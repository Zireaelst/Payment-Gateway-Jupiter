import { Schema, model, Document } from 'mongoose';
import { PublicKey } from '@solana/web3.js';

export interface IPayment extends Document {
  merchantId: Schema.Types.ObjectId;
  amount: number;
  inputToken: string;
  inputAmount: string;
  outputToken: string; // USDC
  outputAmount: string;
  paymentAddress: string;
  signature?: string;
  status: 'pending' | 'received' | 'converting' | 'settled' | 'failed';
  settlementTx?: string;
  error?: string;
  createdAt: Date;
  updatedAt: Date;
}

const paymentSchema = new Schema({
  merchantId: {
    type: Schema.Types.ObjectId,
    ref: 'Merchant',
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  inputToken: {
    type: String,
    required: true,
  },
  inputAmount: {
    type: String,
    required: true,
  },
  outputToken: {
    type: String,
    required: true,
    default: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', // USDC mint address
  },
  outputAmount: {
    type: String,
    required: true,
  },
  paymentAddress: {
    type: String,
    required: true,
  },
  signature: {
    type: String,
  },
  status: {
    type: String,
    enum: ['pending', 'received', 'converting', 'settled', 'failed'],
    default: 'pending',
  },
  settlementTx: {
    type: String,
  },
  error: {
    type: String,
  },
}, {
  timestamps: true,
});

export const Payment = model<IPayment>('Payment', paymentSchema); 