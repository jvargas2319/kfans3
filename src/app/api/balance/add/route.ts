import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { user } = await validateRequest();
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { amount } = await request.json();
    
    if (typeof amount !== "number" || amount <= 0) {
      return new NextResponse("Invalid amount", { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        balance: {
          increment: amount
        }
      }
    });

    return NextResponse.json({ balance: updatedUser.balance });
  } catch (error) {
    console.error("Error adding balance:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}