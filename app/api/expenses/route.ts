import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { amount, currency: originalCurrency, category, description, date, receiptUrl, detectedLogo, handwrittenNote, items } = await req.json();

    if (!amount || !originalCurrency || !category || !description || !date) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    // Get company default currency
    const company = await prisma.company.findUnique({
      where: { id: session.user.companyId },
      select: { defaultCurrency: true },
    });

    if (!company) {
      return NextResponse.json({ message: "Company not found" }, { status: 404 });
    }

    let convertedAmount = parseFloat(amount);
    const defaultCurrency = company.defaultCurrency;

    // Currency Conversion
    if (originalCurrency !== defaultCurrency) {
      try {
        const res = await fetch(`https://api.exchangerate-api.com/v4/latest/${originalCurrency}`);
        const data = await res.json();
        const rate = data.rates[defaultCurrency];
        if (rate) {
          convertedAmount = convertedAmount * rate;
        }
      } catch (e) {
        console.error("Exchange rate fetch failed:", e);
        // Fallback or leave as original if API fails (in production we'd handle this strictly)
      }
    }

    // Compliance Flags
    const expenseDate = new Date(date);
    const dayOfWeek = expenseDate.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    let policyViolation = null;
    if (category === "Entertainment" || category === "Alcohol") {
      policyViolation = "Blacklisted category requires manual high-level review.";
    }

    const duplicate = await prisma.expense.findFirst({
      where: {
        submitterId: session.user.id,
        amount: parseFloat(amount),
        date: expenseDate,
        description: description,
      }
    });
    const isDuplicate = !!duplicate;

    const expense = await prisma.expense.create({
      data: {
        amount: parseFloat(amount),
        originalCurrency,
        convertedAmount,
        category,
        description,
        date: expenseDate,
        receiptUrl: receiptUrl || null,
        
        isDuplicate,
        policyViolation,
        isWeekend,
        detectedLogo: detectedLogo || null,
        handwrittenNote: handwrittenNote || null,
        items: items ? JSON.stringify(items) : null,
        
        status: "PENDING",
        submitterId: session.user.id,
      },
    });

    return NextResponse.json(
      { message: "Expense submitted successfully", expense },
      { status: 201 }
    );
  } catch (error) {
    console.error("Expense creation error:", error);
    return NextResponse.json({ message: "Internal Error" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    // Return expenses for the currently logged in user
    const expenses = await prisma.expense.findMany({
      where: { submitterId: session.user.id },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(expenses);
  } catch (error) {
    return NextResponse.json({ message: "Internal Error" }, { status: 500 });
  }
}
