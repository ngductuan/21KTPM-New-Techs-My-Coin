import { NextRequest, NextResponse } from 'next/server';
import { DatabaseManager } from '@/lib/database';

export async function GET() {
  try {
    const usersDB = DatabaseManager.readUsersDB();
    const transactionDB = DatabaseManager.readTransactionsDB();
    
    const wallets = Object.values(usersDB.wallets);
    const allTransactions = DatabaseManager.getAllTransactions();
    const pendingTransactions = DatabaseManager.getPendingTransactions();
    const blocks = DatabaseManager.getAllBlocks();

    // Calculate total supply
    const totalSupply = blocks.reduce((sum, block) => sum + block.reward, 0);
    
    // Calculate total fees collected
    const totalFees = allTransactions.reduce((sum, tx) => sum + tx.fee, 0);
    
    // Calculate average block time
    let averageBlockTime = 0;
    if (blocks.length > 1) {
      const timeDiffs = [];
      for (let i = 1; i < blocks.length; i++) {
        const prevTime = new Date(blocks[i - 1].timestamp).getTime();
        const currTime = new Date(blocks[i].timestamp).getTime();
        timeDiffs.push(currTime - prevTime);
      }
      averageBlockTime = timeDiffs.reduce((sum, diff) => sum + diff, 0) / timeDiffs.length;
    }

    // Get recent transactions (last 24 hours)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentTransactions = allTransactions.filter(tx => 
      new Date(tx.timestamp) > oneDayAgo
    );

    // Calculate transaction volume (last 24 hours)
    const transactionVolume = recentTransactions.reduce((sum, tx) => sum + tx.amount, 0);

    // Top addresses by balance
    const addressBalances = wallets.map(wallet => ({
      address: wallet.address,
      balance: DatabaseManager.calculateBalance(wallet.address),
      created: wallet.created
    })).sort((a, b) => b.balance - a.balance).slice(0, 10);

    return NextResponse.json({
      success: true,
      data: {
        network: {
          totalBlocks: blocks.length,
          totalTransactions: allTransactions.length,
          pendingTransactions: pendingTransactions.length,
          totalSupply,
          totalFees,
          difficulty: transactionDB.difficulty,
          miningReward: transactionDB.miningReward,
          averageBlockTime: Math.round(averageBlockTime / 1000), // in seconds
        },
        wallets: {
          total: wallets.length,
          topAddresses: addressBalances
        },
        activity: {
          transactionsLast24h: recentTransactions.length,
          volumeLast24h: transactionVolume,
          blocksLast24h: blocks.filter(block => 
            new Date(block.timestamp) > oneDayAgo
          ).length
        },
        latestBlock: blocks[blocks.length - 1] || null,
        recentTransactions: allTransactions.slice(-5).reverse()
      }
    });
  } catch (error) {
    console.error('Error getting statistics:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get statistics' },
      { status: 500 }
    );
  }
}
