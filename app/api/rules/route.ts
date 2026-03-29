import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  try {
    const rules = await prisma.approvalRule.findMany({
      where: { companyId: session.user.companyId },
      include: { designatedApprover: { select: { name: true, email: true } } },
      orderBy: { stepOrder: 'asc' }
    });

    // Also send all managers so the UI can pick from them
    const managers = await prisma.user.findMany({
      where: { companyId: session.user.companyId, role: { in: ["MANAGER", "ADMIN"] } },
      select: { id: true, name: true, email: true }
    });

    return NextResponse.json({ rules, managers });
  } catch (error) {
    return NextResponse.json({ message: "Internal Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  try {
    const { type, threshold, designatedApproverId, stepOrder } = await req.json();

    const rule = await prisma.approvalRule.create({
      data: {
        companyId: session.user.companyId,
        type,
        threshold: threshold ? parseFloat(threshold) : null,
        stepOrder: parseInt(stepOrder),
        designatedApproverId: designatedApproverId || null,
      },
    });

    return NextResponse.json({ message: "Rule added", rule }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: "Internal Error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") return NextResponse.json({ message: "Forbidden" }, { status: 403 });

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ message: "Missing ID" }, { status: 400 });

    await prisma.approvalRule.delete({ where: { id } });
    return NextResponse.json({ message: "Deleted" });
  } catch (error) {
    return NextResponse.json({ message: "Internal Error" }, { status: 500 });
  }
}
