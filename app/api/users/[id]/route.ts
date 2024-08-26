import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
const prisma = new PrismaClient();

export async function GET(
  request: Request,
  { params }: { params: { id: number } }
) {
  const id = params.id; 
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: Number(id),
      },
    });
    return NextResponse.json(user);
  } catch (error) {
    console.log(error)
    return NextResponse.json(error);
  } finally {
    await prisma.$disconnect();
  }
}
type Role = 'USER' | 'ADMIN' | 'SUPER_ADMIN' | 'CLAIM' | 'SALE';

interface dataBodyInterface {
  name: string;
  email: string;
  role?: Role;
  phoneNumber?: string;
  saleUserId?: number;
  custNo?: string;
  rewardPoint?: number;
}

export async function PUT( request: Request,
  { params, body }: { params: { id: number }; body: any }) {
  const data = await request.json();
  const id = params.id;

  let dataBody: dataBodyInterface = {
    name: data.name,
    email: data.email,
  }
  if (data.role) {
    dataBody.role = data.role
  }
  if (data.phoneNumber) {
    dataBody.phoneNumber = data.phoneNumber
  }

  if(data.saleUserId) {
    dataBody.saleUserId = data.saleUserId
  }
  if(data.custNo) {
    dataBody.custNo = data.custNo
  }
  if(data.rewardPoint) {
    dataBody.rewardPoint = data.rewardPoint
  }
  
  try {
    const updatedUser = await prisma.user.update({
      where: {
        id: Number(id),
      },
      data: dataBody,
    });
    return NextResponse.json(updatedUser);
  } catch (error) {
    return NextResponse.json(error);
  } finally {
    await prisma.$disconnect();
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: number } }
) {
  const id = params.id;
  try {
    const deletedUser = await prisma.user.delete({
      where: {
        id: Number(id),
      },
    });
    return NextResponse.json(deletedUser);
  } catch (error) {
    return NextResponse.json(error);
  } finally {
    await prisma.$disconnect();
  }
}
