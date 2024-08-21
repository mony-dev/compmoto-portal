import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
const prisma = new PrismaClient();
import bcrypt from "bcrypt";
import { encrypt } from "@lib-shared/utils/encryption";

export async function PUT( request: Request,
    { params, body }: { params: { id: number }; body: any }) {
    const data = await request.json();
    const id = params.id;
    const hashedPassword = await bcrypt.hash(data.newPassword, 10);
    
    const encrypted = encrypt(data.newPassword);

    try {
      const updatedUser = await prisma.user.update({
        where: {
          id: Number(id),
        },
        data: { 
          encryptedPassword: hashedPassword,
          encryptedPasswordtext: encrypted
        }
      });
      return NextResponse.json(updatedUser);
    } catch (error) {
      return NextResponse.json(error);
    } finally {
      await prisma.$disconnect();
    }
  }
  