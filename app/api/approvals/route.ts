import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Helper to determine the current state of an expense based on dynamic rules
async function evaluateExpenseState(expenseId: string, companyId: string) {
  const expense = await prisma.expense.findUnique({
    where: { id: expenseId },
    include: { submitter: true, logs: true },
  });
  if (!expense || expense.status === 'REJECTED') return { status: 'REJECTED', pendingFor: [] };
  if (expense.status === 'APPROVED') return { status: 'APPROVED', pendingFor: [] };

  const rules = await prisma.approvalRule.findMany({
    where: { companyId },
    orderBy: { stepOrder: 'asc' },
  });

  const allManagers = await prisma.user.findMany({
    where: { companyId, role: { in: ['MANAGER', 'ADMIN'] } },
  });

  let currentActiveStep = null;
  let pendingForIds: string[] = [];

  // If no rules exist, we auto-approve or fallback to direct manager. For MVP: Direct Manager.
  if (rules.length === 0) {
    const hasManagerApproved = expense.logs.some(l => l.approverId === expense.submitter.managerId && l.status === 'APPROVED');
    if (hasManagerApproved || !expense.submitter.managerId) {
      return { status: 'APPROVED', pendingFor: [] };
    } else {
      return { status: 'PENDING', pendingFor: [expense.submitter.managerId] };
    }
  }

  // Evaluate rules in sequence
  for (const rule of rules) {
    const logsForStep = expense.logs; // Simplified: we look at all logs. (A real system might tie logs to specific steps).
    let stepSatisfied = false;

    if (rule.type === 'MANAGER_ONLY') {
      const managerId = expense.submitter.managerId;
      if (!managerId) {
         stepSatisfied = true; // No manager to approve, skip step.
      } else {
         stepSatisfied = logsForStep.some(l => l.approverId === managerId && l.status === 'APPROVED');
         if (!stepSatisfied) pendingForIds = [managerId];
      }
    } 
    else if (rule.type === 'SPECIFIC_APPROVER') {
      stepSatisfied = logsForStep.some(l => l.approverId === rule.designatedApproverId && l.status === 'APPROVED');
      if (!stepSatisfied && rule.designatedApproverId) pendingForIds = [rule.designatedApproverId];
    }
    else if (rule.type === 'PERCENTAGE') {
      const totalManagers = allManagers.length;
      const approvedCount = logsForStep.filter(l => l.status === 'APPROVED').length; // Rough estimation for MVP: Any manager approval counts towards the committee
      
      const currentPercentage = (approvedCount / totalManagers) * 100;
      stepSatisfied = currentPercentage >= (rule.threshold || 50);

      if (!stepSatisfied) {
        // Any manager who hasn't approved yet is blocking this step
        const approvedManagerIds = logsForStep.filter(l => l.status === 'APPROVED').map(l => l.approverId);
        pendingForIds = allManagers.filter(m => !approvedManagerIds.includes(m.id)).map(m => m.id);
      }
    }

    if (!stepSatisfied) {
      currentActiveStep = rule;
      break; // Stop evaluation, we found the blocker
    }
  }

  if (!currentActiveStep) {
    return { status: 'APPROVED', pendingFor: [] }; // All rules passed!
  }

  return { status: 'PENDING', pendingFor: pendingForIds };
}

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  try {
    // 1. Fetch all pending expenses for the company
    const pendingExpenses = await prisma.expense.findMany({
      where: { submitter: { companyId: session.user.companyId }, status: 'PENDING' },
      include: { submitter: true },
      orderBy: { createdAt: 'asc' }
    });

    // 2. Filter down to only those where the current user is in `pendingForIds`
    const relevantExpenses = [];
    for (const exp of pendingExpenses) {
      const evaluation = await evaluateExpenseState(exp.id, session.user.companyId);
      if (evaluation.status === 'PENDING' && evaluation.pendingFor.includes(session.user.id)) {
        relevantExpenses.push(exp);
      }
    }

    return NextResponse.json(relevantExpenses);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Internal Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  try {
    const { expenseId, action, comments } = await req.json(); // action = 'APPROVE' | 'REJECT'

    if (action === 'REJECT') {
      // Immediate failure
      await prisma.$transaction([
        prisma.approvalLog.create({ data: { expenseId, approverId: session.user.id, status: 'REJECTED', comments } }),
        prisma.expense.update({ where: { id: expenseId }, data: { status: 'REJECTED' } })
      ]);
      return NextResponse.json({ message: "Expense Rejected" });
    }

    // It's an approval
    await prisma.approvalLog.create({
      data: { expenseId, approverId: session.user.id, status: 'APPROVED', comments },
    });

    // Re-evaluate state
    const newState = await evaluateExpenseState(expenseId, session.user.companyId);
    
    if (newState.status === 'APPROVED') {
      await prisma.expense.update({ where: { id: expenseId }, data: { status: 'APPROVED' } });
      return NextResponse.json({ message: "Expense Fully Approved!" });
    }

    return NextResponse.json({ message: "Approval registered. Pending next steps in workflow." });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Internal Error" }, { status: 500 });
  }
}
