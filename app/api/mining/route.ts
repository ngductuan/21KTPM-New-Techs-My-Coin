import { NextRequest, NextResponse } from 'next/server';
import { CryptoUtils, Block } from '@/lib/crypto-utils';
import { DatabaseManager } from '@/lib/database';

// Mine a new block (Proof of Work)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { minerAddress } = body;

    if (!minerAddress) {
      return NextResponse.json(
        { success: false, error: 'Miner address is required' },
        { status: 400 }
      );
    }

    if (!CryptoUtils.isValidAddress(minerAddress)) {
      return NextResponse.json(
        { success: false, error: 'Invalid miner address format' },
        { status: 400 }
      );
    }

    // Get pending transactions
    const pendingTransactions = DatabaseManager.getPendingTransactions();
    
    if (pendingTransactions.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No pending transactions to mine' },
        { status: 400 }
      );
    }

    // Get blockchain data
    const transactionDB = DatabaseManager.readTransactionsDB();
    const previousBlock = DatabaseManager.getLatestBlock();
    const previousHash = previousBlock ? previousBlock.hash : '0';
    
    // Take up to 10 transactions for this block
    const transactionsToMine = pendingTransactions.slice(0, 10);
    
    // Create new block
    const newBlock: Omit<Block, 'hash' | 'nonce'> = {
      index: (previousBlock?.index || 0) + 1,
      timestamp: new Date().toISOString(),
      transactions: transactionsToMine,
      previousHash,
      difficulty: transactionDB.difficulty,
      miner: minerAddress,
      reward: transactionDB.miningReward
    };

    // Mine the block (Proof of Work)
    console.log('Starting mining process...');
    const startTime = Date.now();
    const minedBlock = CryptoUtils.mineBlock(newBlock, transactionDB.difficulty);
    const miningTime = Date.now() - startTime;
    console.log(`Block mined in ${miningTime}ms with nonce: ${minedBlock.nonce}`);

    // Add block to blockchain
    DatabaseManager.addBlock(minedBlock);

    // Update miner balance with reward
    const currentBalance = DatabaseManager.calculateBalance(minerAddress);
    DatabaseManager.updateWalletBalance(minerAddress, currentBalance + transactionDB.miningReward);

    return NextResponse.json({
      success: true,
      data: {
        block: minedBlock,
        miningTime,
        reward: transactionDB.miningReward,
        transactionsProcessed: transactionsToMine.length
      }
    });
  } catch (error) {
    console.error('Error mining block:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to mine block' },
      { status: 500 }
    );
  }
}

// Get blockchain information
export async function GET() {
  try {
    const blocks = DatabaseManager.getAllBlocks();
    const pendingTransactions = DatabaseManager.getPendingTransactions();
    const transactionDB = DatabaseManager.readTransactionsDB();

    return NextResponse.json({
      success: true,
      data: {
        totalBlocks: blocks.length,
        latestBlock: blocks[blocks.length - 1] || null,
        pendingTransactions: pendingTransactions.length,
        difficulty: transactionDB.difficulty,
        miningReward: transactionDB.miningReward,
        blocks: blocks.slice(-10).reverse() // Last 10 blocks
      }
    });
  } catch (error) {
    console.error('Error getting blockchain info:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get blockchain info' },
      { status: 500 }
    );
  }
}
