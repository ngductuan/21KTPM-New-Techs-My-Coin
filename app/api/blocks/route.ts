import { NextRequest, NextResponse } from 'next/server';
import { DatabaseManager } from '@/lib/database';

// Get all blocks
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    const blocks = DatabaseManager.getAllBlocks();
    
    // Sort by index (newest first)
    blocks.sort((a, b) => b.index - a.index);

    // Apply pagination
    const paginatedBlocks = blocks.slice(offset, offset + limit);

    return NextResponse.json({
      success: true,
      data: {
        blocks: paginatedBlocks,
        total: blocks.length,
        limit,
        offset
      }
    });
  } catch (error) {
    console.error('Error getting blocks:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get blocks' },
      { status: 500 }
    );
  }
}
