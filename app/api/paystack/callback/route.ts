import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const reference = searchParams.get('reference');

  if (!reference) {
    return NextResponse.json({ error: 'No reference provided' }, { status: 400 });
  }

  try {
    const paystackSecret = process.env.PAYSTACK_SECRET_KEY;
    
    // Verify the transaction with Paystack
    const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${paystackSecret}`,
      },
    });

    const data = await response.json();

    if (data.status && data.data.status === 'success') {
      await prisma.payment.update({
        where: { reference },
        data: { status: 'SUCCESS' }
      });
      
      // Also update the resident's security fee status
      const payment = await prisma.payment.findUnique({ where: { reference } });
      if (payment) {
        await prisma.residentProfile.update({
          where: { id: payment.residentId },
          data: { securityFeeStatus: 'PAID' }
        });
      }
      
      // Redirect the user to a success page
      return NextResponse.redirect(new URL('/payment/success', request.url));
    } else {
      // Redirect to a failure page
      return NextResponse.redirect(new URL('/payment/failed', request.url));
    }
  } catch (error) {
    console.error('Paystack verification error:', error);
    return NextResponse.json({ error: 'Verification process failed' }, { status: 500 });
  }
}
