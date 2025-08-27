import { NextRequest, NextResponse } from 'next/server';
import { CryptoUtils, Transaction } from '@/lib/crypto-utils';
import { DatabaseManager } from '@/lib/database';
import { v4 as uuidv4 } from 'uuid';

// Send transaction
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { from, to, amount, privateKey, gasPrice = 0.001 } = body;

    // Validate inputs
    if (!from || !to || !amount || !privateKey) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (!CryptoUtils.isValidAddress(from) || !CryptoUtils.isValidAddress(to)) {
      return NextResponse.json(
        { success: false, error: 'Invalid address format' },
        { status: 400 }
      );
    }

    if (amount <= 0) {
      return NextResponse.json(
        { success: false, error: 'Amount must be greater than 0' },
        { status: 400 }
      );
    }

    // Check if sender wallet exists
    const senderWallet = DatabaseManager.getWallet(from);
    if (!senderWallet) {
      return NextResponse.json(
        { success: false, error: 'Sender wallet not found' },
        { status: 404 }
      );
    }

    // Verify private key matches the sender address
    try {
      const crypto = require('crypto');
      const keyObject = crypto.createPrivateKey(privateKey);
      const publicKey = crypto.createPublicKey(keyObject).export({ type: 'spki', format: 'pem' });
      const derivedAddress = CryptoUtils.generateAddress(publicKey);
      
      if (derivedAddress !== from) {
        return NextResponse.json(
          { success: false, error: 'Private key does not match sender address' },
          { status: 400 }
        );
      }
    } catch (keyError) {
      return NextResponse.json(
        { success: false, error: 'Invalid private key' },
        { status: 400 }
      );
    }

    // Calculate current balance
    const currentBalance = DatabaseManager.calculateBalance(from);
    
    // Calculate fees
    const gasUsed = 21000; // Standard gas for simple transfer
    const fee = CryptoUtils.calculateFee(gasUsed, gasPrice);
    const totalCost = amount + fee;

    // Check if sender has sufficient balance
    if (currentBalance < totalCost) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Insufficient balance. Required: ${totalCost} MyCoin, Available: ${currentBalance} MyCoin` 
        },
        { status: 400 }
      );
    }

    // Create transaction
    const transaction: Transaction = {
      id: uuidv4(),
      from,
      to,
      amount,
      timestamp: new Date().toISOString(),
      signature: '',
      status: 'pending',
      gasUsed,
      gasPrice,
      fee
    };

    // Sign transaction
    transaction.signature = CryptoUtils.signTransaction(transaction, privateKey);

    // Add to pending transactions
    DatabaseManager.addPendingTransaction(transaction);

    return NextResponse.json({
      success: true,
      data: {
        transactionId: transaction.id,
        from: transaction.from,
        to: transaction.to,
        amount: transaction.amount,
        fee: transaction.fee,
        timestamp: transaction.timestamp,
        status: transaction.status
      }
    });
  } catch (error) {
    console.error('Error sending transaction:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to send transaction' },
      { status: 500 }
    );
  }
}

// Get all transactions
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    let transactions;
    
    if (address) {
      // Get transactions for specific address
      transactions = DatabaseManager.getTransactionsForAddress(address);
    } else {
      // Get all transactions
      transactions = DatabaseManager.getAllTransactions();
    }

    // Add pending transactions
    const pendingTransactions = DatabaseManager.getPendingTransactions();
    const allTransactions = [...pendingTransactions, ...transactions];

    // Sort by timestamp (newest first)
    allTransactions.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    // Apply pagination
    const paginatedTransactions = allTransactions.slice(offset, offset + limit);

    return NextResponse.json({
      success: true,
      data: {
        transactions: paginatedTransactions,
        total: allTransactions.length,
        limit,
        offset
      }
    });
  } catch (error) {
    console.error('Error getting transactions:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get transactions' },
      { status: 500 }
    );
  }
}
