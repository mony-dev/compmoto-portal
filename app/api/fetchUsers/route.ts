import { NextResponse } from 'next/server';
import { syncNavCustomersIncremental } from '@lib/server/services/navCustomerSync';

export async function GET() {
  try {
    const result = await syncNavCustomersIncremental();

    return NextResponse.json(
      {
        status: 'ok',
        insertedCount: result.insertedCount,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error('fetchUsers API error:', error);
    return NextResponse.json(
      {
        status: 'error',
        message: 'sync failed',
      },
      { status: 500 },
    );
  }
}