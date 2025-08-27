import { NextRequest, NextResponse } from 'next/server';
import { PortfolioAnalyzer } from '@/lib/portfolio-analyzer';
import { DatabaseManager } from '@/lib/database';

export async function GET(
  request: NextRequest,
  { params }: { params: { address: string } }
) {
  try {
    const { address } = params;

    // Validate address
    if (!address) {
      return NextResponse.json(
        { success: false, error: 'Address is required' },
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

    const { searchParams } = new URL(request.url);
    const historyDays = parseInt(searchParams.get('historyDays') || '30');

    // Calculate portfolio statistics
    const portfolioStats = PortfolioAnalyzer.calculatePortfolioStats(address);
    const transactionHistory = PortfolioAnalyzer.getTransactionHistory(address, historyDays);
    const transactionSummary = PortfolioAnalyzer.getTransactionSummary(address);

    return NextResponse.json({
      success: true,
      data: {
        address,
        portfolio: portfolioStats,
        history: transactionHistory,
        summary: transactionSummary,
        wallet: {
          address: wallet.address,
          balance: wallet.balance,
          created: wallet.created
        }
      }
    });
  } catch (error) {
    console.error('Error getting portfolio statistics:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get portfolio statistics' },
      { status: 500 }
    );
  }
}
