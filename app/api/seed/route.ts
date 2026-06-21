import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const email = 'ebuka@bernmx.onmicrosoft.com';
    const password = '@Destroyer101';
    const passwordHash = await bcrypt.hash(password, 10);

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ message: 'Test user already exists. You can sign in now.' });
    }

    await prisma.user.create({
      data: {
        email,
        name: 'Ebuka Testing',
        passwordHash,
        role: 'ADMIN', // Giving ADMIN role so they can test everything
      },
    });

    return NextResponse.json({ message: 'Successfully seeded test user. You can now login.' });
  } catch (error: any) {
    console.error('Seeding error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
