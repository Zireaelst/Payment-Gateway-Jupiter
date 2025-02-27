'use client';

import React, { createContext, useContext, useMemo } from 'react';
import { QuoteResponse } from '@jup-ag/api';
import { useConnection } from '@solana/wallet-adapter-react';

interface JupiterContextType {
  getQuote: ((params: {
    inputMint: string;
    outputMint: string;
    amount: string;
    slippageBps?: number;
  }) => Promise<QuoteResponse>) | null;
}

const JupiterContext = createContext<JupiterContextType>({ getQuote: null });

export function useJupiter() {
  return useContext(JupiterContext);
}

export function JupiterProvider({ children }: { children: React.ReactNode }) {
  const { connection } = useConnection();
  
  const getQuote = useMemo(() => {
    if (!connection) return null;
    
    return async (params: {
      inputMint: string;
      outputMint: string;
      amount: string;
      slippageBps?: number;
    }) => {
      const response = await fetch('https://quote-api.jup.ag/v6/quote', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...params,
          slippageBps: params.slippageBps || 100, // Default 1% slippage
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to get quote');
      }
      
      return response.json();
    };
  }, [connection]);

  return (
    <JupiterContext.Provider value={{ getQuote }}>
      {children}
    </JupiterContext.Provider>
  );
} 