import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { name, email, password, companyName, currency } = await req.json();

    if (!name || !email || !password || !companyName || !currency) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "User with this email already exists" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the Company and the Admin User in a transaction
    const newUser = await prisma.$transaction(async (tx) => {
      const company = await tx.company.create({
        data: {
          name: companyName,
          defaultCurrency: currency,
        },
      });

      const user = await tx.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: "ADMIN", // First user is automatically ADMIN
          companyId: company.id,
        },
      });

      return user;
    });

    return NextResponse.json(
      { message: "Successfully signed up", user: { id: newUser.id, email: newUser.email } },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { message: "An error occurred during signup." },
      { status: 500 }
    );
  }
}
