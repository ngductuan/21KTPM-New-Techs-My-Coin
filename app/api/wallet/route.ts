import { NextRequest, NextResponse } from 'next/server';
import { CryptoUtils } from '@/lib/crypto-utils';
import { DatabaseManager } from '@/lib/database';

// Create new wallet
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { passphrase } = body;

    // Generate new wallet
    const wallet = CryptoUtils.generateWallet(passphrase);
    
    // Save to database
    DatabaseManager.addWallet(wallet);

    // Return wallet info (including private key for user to save)
    // Note: Private key is only returned during creation, not stored long-term
    return NextResponse.json({
      success: true,
      data: {
        address: wallet.address,
        publicKey: wallet.publicKey,
        privateKey: wallet.privateKey, // Include private key for user to save
        balance: wallet.balance,
        created: wallet.created,
        hasPassphrase: !!wallet.passphrase
      }
    });
  } catch (error) {
    console.error('Error creating wallet:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create wallet' },
      { status: 500 }
    );
  }
}

// Import wallet with private key
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { privateKey, passphrase } = body;

    if (!privateKey) {
      return NextResponse.json(
        { success: false, error: 'Private key is required' },
        { status: 400 }
      );
    }

    try {
      // Generate public key from private key
      const crypto = require('crypto');
      const keyObject = crypto.createPrivateKey(privateKey);
      const publicKey = crypto.createPublicKey(keyObject).export({ type: 'spki', format: 'pem' });
      
      const address = CryptoUtils.generateAddress(publicKey);
      
      // Check if wallet already exists
      const existingWallet = DatabaseManager.getWallet(address);
      if (existingWallet) {
        // Calculate current balance
        const balance = DatabaseManager.calculateBalance(address);
        
        return NextResponse.json({
          success: true,
          data: {
            address: existingWallet.address,
            publicKey: existingWallet.publicKey,
            balance,
            created: existingWallet.created,
            hasPassphrase: !!existingWallet.passphrase
          }
        });
      }

      // Create new wallet from private key
      const wallet = {
        address,
        privateKey,
        publicKey,
        balance: 0,
        created: new Date().toISOString(),
        passphrase
      };

      DatabaseManager.addWallet(wallet);

      return NextResponse.json({
        success: true,
        data: {
          address: wallet.address,
          publicKey: wallet.publicKey,
          balance: wallet.balance,
          created: wallet.created,
          hasPassphrase: !!wallet.passphrase
        }
      });
    } catch (keyError) {
      return NextResponse.json(
        { success: false, error: 'Invalid private key format' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error importing wallet:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to import wallet' },
      { status: 500 }
    );
  }
}
