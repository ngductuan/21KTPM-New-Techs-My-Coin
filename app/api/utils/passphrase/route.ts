import { NextResponse } from 'next/server';
import { CryptoUtils } from '@/lib/crypto-utils';

export async function GET() {
  try {
    const passphrase = CryptoUtils.generatePassphrase();
    
    return NextResponse.json({
      success: true,
      data: {
        passphrase
      }
    });
  } catch (error) {
    console.error('Error generating passphrase:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate passphrase' },
      { status: 500 }
    );
  }
}
