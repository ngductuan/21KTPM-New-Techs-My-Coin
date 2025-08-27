import { NextRequest, NextResponse } from 'next/server';
import { DatabaseManager } from '@/lib/database';
import { CryptoUtils } from '@/lib/crypto-utils';
import { v4 as uuidv4 } from 'uuid';

// Deposit fake money to wallet
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { address, amount } = body;

    if (!address || !amount) {
      return NextResponse.json(
        { success: false, error: 'Address and amount are required' },
        { status: 400 }
      );
    }

    if (!CryptoUtils.isValidAddress(address)) {
      return NextResponse.json(
        { success: false, error: 'Invalid address format' },
        { status: 400 }
      );
    }

    if (amount <= 0 || amount > 10000) {
      return NextResponse.json(
        { success: false, error: 'Amount must be between 1 and 10,000 MYC' },
        { status: 400 }
      );
    }

    // Check if wallet exists
    const wallet = DatabaseManager.getWallet(address);
    if (!wallet) {
      return NextResponse.json(
        { success: false, error: 'Wallet not found' },
        { status: 404 }
      );
    }

    // Create a deposit transaction (from system to user)
    const depositTransaction = {
      id: uuidv4(),
      from: '0x0000000000000000000000000000000000000000', // System address
      to: address,
      amount: amount,
      timestamp: new Date().toISOString(),
      signature: 'SYSTEM_DEPOSIT',
      status: 'confirmed' as const,
      blockHash: 'DEPOSIT_BLOCK',
      blockNumber: 0,
      gasUsed: 0,
      gasPrice: 0,
      fee: 0
    };

    // Add transaction to database
    DatabaseManager.addTransaction(depositTransaction);

    // Get updated balance
    const newBalance = DatabaseManager.calculateBalance(address);

    return NextResponse.json({
      success: true,
      data: {
        transaction: depositTransaction,
        newBalance,
        message: `Successfully deposited ${amount} MYC to your wallet`
      }
    });
  } catch (error) {
    console.error('Error depositing money:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to deposit money' },
      { status: 500 }
    );
  }
}
