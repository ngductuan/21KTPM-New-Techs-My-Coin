import { NextRequest, NextResponse } from 'next/server';
import { DatabaseManager } from '@/lib/database';

export async function GET(
  request: NextRequest,
  { params }: { params: { address: string } }
) {
  try {
    const address = params.address;

    if (!address) {
      return NextResponse.json(
        { success: false, error: 'Address is required' },
        { status: 400 }
      );
    }

    // Get wallet from database
    const wallet = DatabaseManager.getWallet(address);
    if (!wallet) {
      return NextResponse.json(
        { success: false, error: 'Wallet not found' },
        { status: 404 }
      );
    }

    // Calculate current balance
    const balance = DatabaseManager.calculateBalance(address);
    
    // Get transaction history
    const transactions = DatabaseManager.getTransactionsForAddress(address);
    
    // Get transaction statistics
    const sentTransactions = transactions.filter(tx => tx.from === address);
    const receivedTransactions = transactions.filter(tx => tx.to === address);
    const totalSent = sentTransactions.reduce((sum, tx) => sum + tx.amount + tx.fee, 0);
    const totalReceived = receivedTransactions.reduce((sum, tx) => sum + tx.amount, 0);

    return NextResponse.json({
      success: true,
      data: {
        address: wallet.address,
        balance,
        created: wallet.created,
        transactions: {
          total: transactions.length,
          sent: sentTransactions.length,
          received: receivedTransactions.length,
          totalSent,
          totalReceived,
          recent: transactions.slice(-10).reverse() // Last 10 transactions
        }
      }
    });
  } catch (error) {
    console.error('Error getting wallet info:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get wallet info' },
      { status: 500 }
    );
  }
}
