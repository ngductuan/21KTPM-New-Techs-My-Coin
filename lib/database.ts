import fs from 'fs';
import path from 'path';
import { Wallet, Transaction, Block } from './crypto-utils';

const DATABASE_PATH = path.join(process.cwd(), 'database');
const USERS_FILE = path.join(DATABASE_PATH, 'users.json');
const TRANSACTIONS_FILE = path.join(DATABASE_PATH, 'transactions.json');

export interface Database {
  wallets: { [address: string]: Wallet };
}

export interface TransactionDatabase {
  transactions: Transaction[];
  blocks: Block[];
  difficulty: number;
  miningReward: number;
  pendingTransactions: Transaction[];
}

export class DatabaseManager {
  // Read users database
  static readUsersDB(): Database {
    try {
      const data = fs.readFileSync(USERS_FILE, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      return { wallets: {} };
    }
  }

  // Write users database
  static writeUsersDB(data: Database): void {
    fs.writeFileSync(USERS_FILE, JSON.stringify(data, null, 2));
  }

  // Read transactions database
  static readTransactionsDB(): TransactionDatabase {
    try {
      const data = fs.readFileSync(TRANSACTIONS_FILE, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      return {
        transactions: [],
        blocks: [],
        difficulty: 4,
        miningReward: 10,
        pendingTransactions: []
      };
    }
  }

  // Write transactions database
  static writeTransactionsDB(data: TransactionDatabase): void {
    fs.writeFileSync(TRANSACTIONS_FILE, JSON.stringify(data, null, 2));
  }

  // Add wallet to database
  static addWallet(wallet: Wallet): void {
    const db = this.readUsersDB();
    db.wallets[wallet.address] = wallet;
    this.writeUsersDB(db);
  }

  // Get wallet by address
  static getWallet(address: string): Wallet | null {
    const db = this.readUsersDB();
    // console.log(`Fetching wallet for db: ${JSON.stringify(db)}`);
    // console.log("db.wallets[address]", db.wallets[address])
    return db.wallets[address] || null;
  }

  // Update wallet balance
  static updateWalletBalance(address: string, newBalance: number): void {
    const db = this.readUsersDB();
    if (db.wallets[address]) {
      db.wallets[address].balance = newBalance;
      this.writeUsersDB(db);
    }
  }

  // Add transaction
  static addTransaction(transaction: Transaction): void {
    const db = this.readTransactionsDB();
    db.transactions.push(transaction);
    this.writeTransactionsDB(db);
  }

  // Add pending transaction
  static addPendingTransaction(transaction: Transaction): void {
    const db = this.readTransactionsDB();
    db.pendingTransactions.push(transaction);
    this.writeTransactionsDB(db);
  }

  // Get transactions for address
  static getTransactionsForAddress(address: string): Transaction[] {
    const db = this.readTransactionsDB();
    return db.transactions.filter(tx => tx.from === address || tx.to === address);
  }

  // Get all transactions
  static getAllTransactions(): Transaction[] {
    const db = this.readTransactionsDB();
    return db.transactions;
  }

  // Add block
  static addBlock(block: Block): void {
    const db = this.readTransactionsDB();
    db.blocks.push(block);
    
    // Move pending transactions to confirmed
    block.transactions.forEach(tx => {
      tx.status = 'confirmed';
      tx.blockHash = block.hash;
      tx.blockNumber = block.index;
      db.transactions.push(tx);
    });
    
    // Remove pending transactions
    db.pendingTransactions = db.pendingTransactions.filter(
      pendingTx => !block.transactions.some(blockTx => blockTx.id === pendingTx.id)
    );
    
    this.writeTransactionsDB(db);
  }

  // Get latest block
  static getLatestBlock(): Block | null {
    const db = this.readTransactionsDB();
    return db.blocks.length > 0 ? db.blocks[db.blocks.length - 1] : null;
  }

  // Get all blocks
  static getAllBlocks(): Block[] {
    const db = this.readTransactionsDB();
    return db.blocks;
  }

  // Get pending transactions
  static getPendingTransactions(): Transaction[] {
    const db = this.readTransactionsDB();
    return db.pendingTransactions;
  }

  // Calculate balance for address
  static calculateBalance(address: string): number {
    const db = this.readTransactionsDB();
    let balance = 0;

    // Add received transactions
    const receivedTx = db.transactions.filter(tx => 
      tx.to === address && tx.status === 'confirmed'
    );
    balance += receivedTx.reduce((sum, tx) => sum + tx.amount, 0);

    // Subtract sent transactions and fees
    const sentTx = db.transactions.filter(tx => 
      tx.from === address && tx.status === 'confirmed'
    );
    balance -= sentTx.reduce((sum, tx) => sum + tx.amount + tx.fee, 0);

    // Add mining rewards
    const minedBlocks = db.blocks.filter(block => block.miner === address);
    balance += minedBlocks.reduce((sum, block) => sum + block.reward, 0);

    return Math.max(0, balance);
  }
}
