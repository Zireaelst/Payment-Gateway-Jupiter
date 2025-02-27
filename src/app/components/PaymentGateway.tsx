'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { PublicKey } from '@solana/web3.js';
import { useJupiter } from '../providers/JupiterProvider';
import { useConnection } from '@solana/wallet-adapter-react';
import Decimal from 'decimal.js';
import Image from 'next/image';

export function PaymentGateway() {
  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();
  const { getQuote } = useJupiter();
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isAmountValid, setIsAmountValid] = useState(true);
  const [showTooltip, setShowTooltip] = useState(false);
  
  // USDC mint address (devnet)
  const USDC_MINT = new PublicKey('Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr');

  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        setSuccess(null);
        setError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [success, error]);

  const validateAmount = (value: string) => {
    const numValue = parseFloat(value);
    return !isNaN(numValue) && numValue > 0 && numValue <= 1000000;
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setAmount(value);
    setIsAmountValid(validateAmount(value));
  };
  
  const handlePayment = useCallback(async () => {
    if (!publicKey || !amount || !getQuote || !isAmountValid) return;
    
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const quote = await getQuote({
        inputMint: publicKey.toString(),
        outputMint: USDC_MINT.toString(),
        amount: new Decimal(amount).mul(1e9).toString(),
        slippageBps: 100,
      });

      if (!quote) {
        throw new Error('No quote available for swap');
      }

      const response = await fetch('https://quote-api.jup.ag/v6/swap', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          quoteResponse: quote,
          userPublicKey: publicKey.toString(),
        }),
      });

      const swapResult = await response.json();
      
      if (!swapResult.swapTransaction) {
        throw new Error('Failed to create swap transaction');
      }

      const txid = await sendTransaction(swapResult.swapTransaction, connection);
      
      setSuccess(`Payment successful! Transaction ID: ${txid.slice(0, 8)}...${txid.slice(-8)}`);
      setAmount('');
    } catch (err) {
      console.error('Payment failed:', err);
      setError(err instanceof Error ? err.message : 'Payment failed');
    } finally {
      setLoading(false);
    }
  }, [publicKey, amount, getQuote, sendTransaction, connection, isAmountValid]);

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900 via-slate-900 to-black text-white py-8 px-4 relative overflow-hidden">
      {/* Enhanced background gradients */}
      <div className="fixed inset-0 bg-gradient-to-br from-purple-900/80 via-slate-900/90 to-blue-900/80 animate-gradient-slow"></div>
      
      {/* Animated background patterns */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0 bg-[url('/images/grid.svg')] bg-center [mask-image:radial-gradient(white,transparent_85%)]"></div>
      </div>

      {/* Enhanced gradient orbs */}
      <div className="absolute top-1/4 left-1/4 w-[40rem] h-[40rem] bg-purple-600/30 rounded-full blur-3xl animate-pulse-slow"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[45rem] h-[45rem] bg-blue-600/20 rounded-full blur-3xl animate-pulse-slower"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[50rem] h-[50rem] bg-indigo-500/10 rounded-full blur-3xl animate-pulse"></div>

      <div className="max-w-7xl mx-auto bg-gradient-to-b from-white/10 to-white/5 backdrop-blur-2xl rounded-2xl shadow-2xl overflow-hidden border border-white/20 relative z-10">
        {/* Glass morphism effect */}
        <div className="absolute inset-0 bg-gradient-to-tr from-white/5 via-white/10 to-transparent opacity-50"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-blue-500/5"></div>
        
        <div className="p-12 relative">
          <div className="relative">
            <div className="flex justify-end mb-12">
              <div className="flex-shrink-0">
                <WalletMultiButton className="!bg-gradient-to-r !from-purple-600/90 !to-blue-600/90 !backdrop-blur-xl !border-0 !rounded-xl !hover:from-purple-500 !hover:to-blue-500 !px-8 !py-4 !text-lg !font-medium transition-all duration-300 !shadow-lg hover:!shadow-purple-500/20" />
              </div>
            </div>
            <div className="mb-12">
              <h1 className="text-6xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent mb-4">
                Crypto Payment
              </h1>
              <div className="flex items-center space-x-3 mt-4">
                <p className="text-gray-300 text-sm">Powered by</p>
                <Image
                  src="/images/jupiter-logo.png"
                  alt="Jupiter Logo"
                  width={28}
                  height={28}
                  className="inline-block"
                />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#36F197] to-[#00E1FF] font-medium text-lg">
                  Jupiter
                </span>
              </div>
            </div>

            {publicKey ? (
              <div className="space-y-6">
                <div 
                  className="relative group"
                  onMouseEnter={() => setShowTooltip(true)}
                  onMouseLeave={() => setShowTooltip(false)}
                >
                  <div className="flex items-center space-x-2 mb-2">
                    <label className="text-sm text-gray-300">Amount</label>
                    {!isAmountValid && amount && (
                      <span className="text-xs text-red-400">Please enter a valid amount (0-1,000,000 USDC)</span>
                    )}
                  </div>
                  <input
                    type="number"
                    value={amount}
                    onChange={handleAmountChange}
                    placeholder="Enter amount"
                    className={`w-full px-6 py-4 bg-white/5 backdrop-blur-xl border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent text-white placeholder-gray-400 transition-all duration-200 text-lg ${
                      !isAmountValid && amount ? 'border-red-500/50' : 'border-white/20'
                    }`}
                    disabled={loading}
                  />
                  <span className="absolute right-4 top-[42px] text-gray-400 text-sm">USDC</span>
                  {showTooltip && (
                    <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs py-2 px-3 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      Enter the amount in USDC
                    </div>
                  )}
                </div>

                <button
                  onClick={handlePayment}
                  disabled={loading || !amount || !isAmountValid}
                  className={`w-full py-4 rounded-xl font-medium text-lg transition-all duration-300 ${
                    loading || !amount || !isAmountValid
                      ? 'bg-gray-600/30 backdrop-blur-sm cursor-not-allowed'
                      : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 transform hover:-translate-y-0.5 hover:shadow-xl shadow-purple-500/20'
                  }`}
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <svg className="animate-spin h-5 w-5 mr-3 text-white" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Processing Payment...
                    </div>
                  ) : (
                    'Pay Now'
                  )}
                </button>

                {(error || success) && (
                  <div className={`transform transition-all duration-500 ${error || success ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
                    {error && (
                      <div className="p-4 bg-red-500/5 backdrop-blur-xl border border-red-500/20 rounded-xl text-red-200 text-sm">
                        <div className="flex items-center space-x-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>{error}</span>
                        </div>
                      </div>
                    )}

                    {success && (
                      <div className="p-4 bg-green-500/5 backdrop-blur-xl border border-green-500/20 rounded-xl text-green-200 text-sm">
                        <div className="flex items-center space-x-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                          </svg>
                          <span>{success}</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="mb-8 space-y-8">
                  <div className="flex justify-center space-x-16">
                    {/* Phantom Logo */}
                    <div className="p-8 bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-xl border border-white/10 backdrop-blur-xl hover:from-purple-500/20 hover:to-blue-500/20 transition-all duration-300">
                      <Image
                        src="/images/Phantom-Icon_App_128x128.png"
                        alt="Phantom Wallet"
                        width={64}
                        height={64}
                        className="inline-block"
                      />
                    </div>
                    {/* Generic Wallet Icon */}
                    <div className="p-8 bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-xl border border-white/10 backdrop-blur-xl hover:from-purple-500/20 hover:to-blue-500/20 transition-all duration-300">
                      <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-gray-300">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
                      </svg>
                    </div>
                    {/* Solana Icon */}
                    <div className="p-8 bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-xl border border-white/10 backdrop-blur-xl hover:from-purple-500/20 hover:to-blue-500/20 transition-all duration-300">
                      <svg width="64" height="64" viewBox="0 0 397 311" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M64.6 237.9c2.4-2.4 5.7-3.8 9.2-3.8h317.4c5.8 0 8.7 7 4.6 11.1l-62.7 62.7c-2.4 2.4-5.7 3.8-9.2 3.8H6.5c-5.8 0-8.7-7-4.6-11.1l62.7-62.7z" fill="url(#paint0_linear_sol)"/>
                        <path d="M64.6 3.8C67 1.4 70.3 0 73.8 0h317.4c5.8 0 8.7 7 4.6 11.1l-62.7 62.7c-2.4 2.4-5.7 3.8-9.2 3.8H6.5c-5.8 0-8.7-7-4.6-11.1L64.6 3.8z" fill="url(#paint1_linear_sol)"/>
                        <path d="M333.1 120.1c-2.4-2.4-5.7-3.8-9.2-3.8H6.5c-5.8 0-8.7 7-4.6 11.1l62.7 62.7c2.4 2.4 5.7 3.8 9.2 3.8h317.4c5.8 0 8.7-7 4.6-11.1l-62.7-62.7z" fill="url(#paint2_linear_sol)"/>
                        <defs>
                          <linearGradient id="paint0_linear_sol" x1="359.2" y1="18.8" x2="159.2" y2="318.8" gradientUnits="userSpaceOnUse">
                            <stop stopColor="#00FFA3"/>
                            <stop offset="1" stopColor="#DC1FFF"/>
                          </linearGradient>
                          <linearGradient id="paint1_linear_sol" x1="359.2" y1="18.8" x2="159.2" y2="318.8" gradientUnits="userSpaceOnUse">
                            <stop stopColor="#00FFA3"/>
                            <stop offset="1" stopColor="#DC1FFF"/>
                          </linearGradient>
                          <linearGradient id="paint2_linear_sol" x1="359.2" y1="18.8" x2="159.2" y2="318.8" gradientUnits="userSpaceOnUse">
                            <stop stopColor="#00FFA3"/>
                            <stop offset="1" stopColor="#DC1FFF"/>
                          </linearGradient>
                        </defs>
                      </svg>
                    </div>
                  </div>
                  <div className="mb-8">
                    <svg className="w-24 h-24 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 15v2m0 0v2m0-2h2m-2 0H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  {/* Black Phantom Logo */}
                  <div className="flex items-center justify-center space-x-2 mb-8">
                    <Image
                      src="/images/Phantom-Logo-Black.png"
                      alt="Phantom Logo"
                      width={200}
                      height={40}
                      className="opacity-50 hover:opacity-75 transition-opacity duration-200 invert"
                    />
                  </div>
                </div>
                <p className="text-gray-300 text-xl mb-4">Connect your wallet to make a payment</p>
                <p className="text-gray-400 text-base">Secure and instant transactions with Jupiter</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Enhanced bottom decorative elements */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-blue-500/20"></div>
    </div>
  );
} 