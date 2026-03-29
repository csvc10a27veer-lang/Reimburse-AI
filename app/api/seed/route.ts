import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST() {
  try {
    let company = await prisma.company.findFirst({ where: { name: "Demo Corp" } });
    if (!company) {
      company = await prisma.company.create({
        data: { name: "Demo Corp", defaultCurrency: "USD" },
      });
    }

    const hashedPassword = await bcrypt.hash("Password123!", 10);

    let manager = await prisma.user.findUnique({ where: { email: "manager@demo.com" } });
    if (!manager) {
      manager = await prisma.user.create({
        data: {
          email: "manager@demo.com",
          password: hashedPassword,
          name: "Demo Manager",
          role: "MANAGER",
          companyId: company.id,
        },
      });
    }

    let employee = await prisma.user.findUnique({ where: { email: "employee@demo.com" } });
    if (!employee) {
      employee = await prisma.user.create({
        data: {
          email: "employee@demo.com",
          password: hashedPassword,
          name: "Demo Employee",
          role: "EMPLOYEE",
          companyId: company.id,
          managerId: manager.id,
        },
      });
    } else if (employee.managerId !== manager.id) {
       await prisma.user.update({ where: { id: employee.id }, data: { managerId: manager.id } });
    }

    return NextResponse.json({ message: "Seed complete" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Internal Error" }, { status: 500 });
  }
}
