import { NextRequest, NextResponse } from 'next/server';
import { DatabaseManager } from '@/lib/database';
import { CryptoUtils } from '@/lib/crypto-utils';

// Access wallet by passphrase
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { passphrase } = body;

    if (!passphrase) {
      return NextResponse.json(
        { success: false, error: 'Passphrase is required' },
        { status: 400 }
      );
    }

    // Get all wallets from database
    const db = DatabaseManager.readUsersDB();
    
    // Find wallet with matching passphrase
    const matchingWallet = Object.values(db.wallets).find(wallet => 
      wallet.passphrase === passphrase.trim()
    );

    if (!matchingWallet) {
      return NextResponse.json(
        { success: false, error: 'No wallet found with this passphrase' },
        { status: 404 }
      );
    }

    // Calculate current balance
    const balance = DatabaseManager.calculateBalance(matchingWallet.address);

    return NextResponse.json({
      success: true,
      data: {
        address: matchingWallet.address,
        publicKey: matchingWallet.publicKey,
        balance,
        created: matchingWallet.created,
        hasPassphrase: true
      }
    });
  } catch (error) {
    console.error('Error accessing wallet with passphrase:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to access wallet' },
      { status: 500 }
    );
  }
}
