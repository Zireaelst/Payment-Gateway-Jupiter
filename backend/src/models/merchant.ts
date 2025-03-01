import { Schema, model, Document } from 'mongoose';

export interface IMerchant extends Document {
  name: string;
  email: string;
  walletAddress: string;
  settlementCurrency: string;
  minSettlementAmount: number;
  autoSettlement: boolean;
  apiKey: string;
  webhookUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const merchantSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  walletAddress: {
    type: String,
    required: true,
  },
  settlementCurrency: {
    type: String,
    default: 'USDC',
  },
  minSettlementAmount: {
    type: Number,
    default: 1, // 1 USDC
  },
  autoSettlement: {
    type: Boolean,
    default: true,
  },
  apiKey: {
    type: String,
    required: true,
    unique: true,
  },
  webhookUrl: {
    type: String,
  },
}, {
  timestamps: true,
});

export const Merchant = model<IMerchant>('Merchant', merchantSchema); 