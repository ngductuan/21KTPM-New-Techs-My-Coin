import { NextRequest, NextResponse } from 'next/server';
import { DatabaseManager } from '@/lib/database';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const transactionId = params.id;

    if (!transactionId) {
      return NextResponse.json(
        { success: false, error: 'Transaction ID is required' },
        { status: 400 }
      );
    }

    // Search in confirmed transactions
    const allTransactions = DatabaseManager.getAllTransactions();
    const transaction = allTransactions.find(tx => tx.id === transactionId);

    if (transaction) {
      return NextResponse.json({
        success: true,
        data: transaction
      });
    }

    // Search in pending transactions
    const pendingTransactions = DatabaseManager.getPendingTransactions();
    const pendingTransaction = pendingTransactions.find(tx => tx.id === transactionId);

    if (pendingTransaction) {
      return NextResponse.json({
        success: true,
        data: pendingTransaction
      });
    }

    return NextResponse.json(
      { success: false, error: 'Transaction not found' },
      { status: 404 }
    );
  } catch (error) {
    console.error('Error getting transaction:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get transaction' },
      { status: 500 }
    );
  }
}
