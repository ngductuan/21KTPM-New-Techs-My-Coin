import { NextRequest, NextResponse } from 'next/server';
import { DatabaseManager } from '@/lib/database';

export async function GET(
  request: NextRequest,
  { params }: { params: { hash: string } }
) {
  try {
    const blockHash = params.hash;

    if (!blockHash) {
      return NextResponse.json(
        { success: false, error: 'Block hash is required' },
        { status: 400 }
      );
    }

    const blocks = DatabaseManager.getAllBlocks();
    const block = blocks.find(b => b.hash === blockHash);

    if (!block) {
      return NextResponse.json(
        { success: false, error: 'Block not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: block
    });
  } catch (error) {
    console.error('Error getting block:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get block' },
      { status: 500 }
    );
  }
}
