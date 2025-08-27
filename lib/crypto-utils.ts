import crypto from 'crypto';

export interface Wallet {
  address: string;
  privateKey: string;
  publicKey: string;
  balance: number;
  created: string;
  passphrase?: string;
}

export interface Transaction {
  id: string;
  from: string;
  to: string;
  amount: number;
  timestamp: string;
  signature: string;
  status: 'pending' | 'confirmed' | 'failed';
  blockHash?: string;
  blockNumber?: number;
  gasUsed: number;
  gasPrice: number;
  fee: number;
}

export interface Block {
  index: number;
  timestamp: string;
  transactions: Transaction[];
  previousHash: string;
  hash: string;
  nonce: number;
  difficulty: number;
  miner: string;
  reward: number;
}

export class CryptoUtils {
  // Generate a new wallet
  static generateWallet(passphrase?: string): Wallet {
    const keyPair = crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: { type: 'spki', format: 'pem' },
      privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
    });

    const address = this.generateAddress(keyPair.publicKey);
    
    return {
      address,
      privateKey: keyPair.privateKey,
      publicKey: keyPair.publicKey,
      balance: 0,
      created: new Date().toISOString(),
      passphrase
    };
  }

  // Generate address from public key
  static generateAddress(publicKey: string): string {
    const hash = crypto.createHash('sha256').update(publicKey).digest('hex');
    return '0x' + hash.substring(0, 40);
  }

  // Sign transaction
  static signTransaction(transaction: any, privateKey: string): string {
    const transactionString = JSON.stringify({
      from: transaction.from,
      to: transaction.to,
      amount: transaction.amount,
      timestamp: transaction.timestamp
    });
    
    const sign = crypto.createSign('SHA256');
    sign.update(transactionString);
    return sign.sign(privateKey, 'hex');
  }

  // Verify transaction signature
  static verifyTransaction(transaction: Transaction, publicKey: string): boolean {
    try {
      const transactionString = JSON.stringify({
        from: transaction.from,
        to: transaction.to,
        amount: transaction.amount,
        timestamp: transaction.timestamp
      });
      
      const verify = crypto.createVerify('SHA256');
      verify.update(transactionString);
      return verify.verify(publicKey, transaction.signature, 'hex');
    } catch {
      return false;
    }
  }

  // Calculate hash for block
  static calculateHash(block: Omit<Block, 'hash'>): string {
    const blockString = JSON.stringify({
      index: block.index,
      timestamp: block.timestamp,
      transactions: block.transactions,
      previousHash: block.previousHash,
      nonce: block.nonce,
      difficulty: block.difficulty
    });
    
    return crypto.createHash('sha256').update(blockString).digest('hex');
  }

  // Proof of Work mining
  static mineBlock(block: Omit<Block, 'hash' | 'nonce'>, difficulty: number): Block {
    let nonce = 0;
    let hash = '';
    const target = '0'.repeat(difficulty);
    
    while (!hash.startsWith(target)) {
      nonce++;
      const blockWithNonce = { ...block, nonce };
      hash = this.calculateHash(blockWithNonce);
    }
    
    return { ...block, nonce, hash };
  }

  // Proof of Work for transaction validation
  static performProofOfWork(transaction: Transaction, difficulty: number): { 
    isValid: boolean; 
    hash: string; 
    iterations: number; 
  } {
    let nonce = 0;
    let hash = '';
    const target = '0'.repeat(difficulty);
    const maxIterations = 1000000; // Limit iterations to prevent infinite loops
    
    const transactionString = JSON.stringify({
      id: transaction.id,
      from: transaction.from,
      to: transaction.to,
      amount: transaction.amount,
      timestamp: transaction.timestamp,
      nonce
    });
    
    while (nonce < maxIterations) {
      const dataWithNonce = transactionString + nonce;
      hash = crypto.createHash('sha256').update(dataWithNonce).digest('hex');
      
      if (hash.startsWith(target)) {
        return {
          isValid: true,
          hash,
          iterations: nonce
        };
      }
      nonce++;
    }
    
    return {
      isValid: false,
      hash: '',
      iterations: nonce
    };
  }

  // Generate random passphrase
  static generatePassphrase(): string {
    const words = [
      'abandon', 'ability', 'able', 'about', 'above', 'absent', 'absorb', 'abstract',
      'absurd', 'abuse', 'access', 'accident', 'account', 'accuse', 'achieve', 'acid',
      'acoustic', 'acquire', 'across', 'act', 'action', 'actor', 'actress', 'actual',
      'adapt', 'add', 'addict', 'address', 'adjust', 'admit', 'adult', 'advance',
      'advice', 'aerobic', 'affair', 'afford', 'afraid', 'again', 'against', 'age',
      'agent', 'agree', 'ahead', 'aim', 'air', 'airport', 'aisle', 'alarm',
      'album', 'alcohol', 'alert', 'alien', 'all', 'alley', 'allow', 'almost'
    ];
    
    const selectedWords = [];
    for (let i = 0; i < 12; i++) {
      selectedWords.push(words[Math.floor(Math.random() * words.length)]);
    }
    
    return selectedWords.join(' ');
  }

  // Validate address format
  static isValidAddress(address: string): boolean {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  }

  // Calculate transaction fee
  static calculateFee(gasUsed: number, gasPrice: number): number {
    return gasUsed * gasPrice;
  }
}
