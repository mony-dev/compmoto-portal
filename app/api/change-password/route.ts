import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { NextApiRequest, NextApiResponse } from "next";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();
export async function PUT(request: Request, response: Response) {
  // const { currentPassword, newPassword, email } = req.body;
  const data = await request.json();

  const user = await prisma.user.findUnique({ where: { custNo: data.custNo } });

  if (!user) {
    return NextResponse.json({ message: 'User not found' }, { status: 404 })
  }

  const custNo = data.custNo
  // // Check if the current password is correct
  const isPasswordValid = await bcrypt.compare(data.currentPassword, user.encryptedPassword);
  if (!isPasswordValid) {
    return NextResponse.json({ message: 'Current password is incorrect' }, { status: 400 })

  }

  if (data.newPassword !== data.confirmPassword) {
    return NextResponse.json({ message: 'New password and confirm password must be the same' }, { status: 400 })
  }
  // // Hash the new password
  const hashedPassword = await bcrypt.hash(data.newPassword, 10);
  // // Update the password in the database
  try {
    const updatedUser = await prisma.user.update({
      where: { custNo },
      data: { encryptedPassword: hashedPassword, status: 'Active' },
    });
    return NextResponse.json({ message: 'Password updated successfully' }, { status: 200 })
  } catch (error) {
    return NextResponse.json(error)
  }

}
