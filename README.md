# ReimburseAI - Enterprise Expense Management
![Dark Mode UI](https://img.shields.io/badge/UI-Dark%20Mode-050505?style=flat-square&logo=next.js&logoColor=white) ![Hackathon Status](https://img.shields.io/badge/Status-MVP%20Complete-10B981?style=flat-square)

ReimburseAI is an intelligent, automated expense reporting and routing system built for the modern enterprise. It focuses on replacing clunky, manual receipt entry with lightning-fast AI extraction, and stops corporate fraud before it happens via automated compliance engines.

---

## 🚀 Key Features

* **Magic Demo Seed System:** For hackathon presentations, logging in instantly provisions a Demo Company, sets up a Manager, and links an Employee beneath them without manual data entry.
* **Enterprise AI Receipt OCR:** Visual drag-and-drop receipt scanning that auto-extracts Vendor Logos, translates handwritten notes, and interactively itemizes a single receipt into `Business (Reimbursable)` vs `Personal (Non-Reimbursable)` line items.
* **Smart Compliance & Fraud Interception:** The backend inherently catches and visually flags dangerous behavior in the Approval Queue:
  * 🚨 **Duplicate Submissions**
  * 🚨 **Weekend / Non-Working Day Splurges**
  * 🚨 **Policy Violations** (e.g., Blacklisted Categories like Alcohol)
* **Dynamic Approval Workflows:** Admins can configure custom approval routes. From `Direct Manager Only` to `Executive Override Approval` blocks!
* **Aesthetic Premium UI:** Fully custom dark-mode `#050505` layout matching the highest tier of SaaS products, with pulse-glowing emerald accents and slick sidebar routing.

---

## 🛠️ The Core Workflows

### 1. The Submission Flow (Employee)
1. Employee clicks **"Submit Expense"**.
2. They upload a receipt. The system enters an `Scanning...` state.
3. The AI breaks down the receipt into itemized rows. The Employee can toggle an item off, and the total claim amount actively updates!
4. The Employee sets the category and hits Submit. 

### 2. The Verification Flow (System)
Before the expense hits the database, the `/api/expenses` route runs our custom Compliance Engine. If it sees the transaction date was on a Sunday, or the category violates policy, it attaches `Warning Flags` to the database record.

### 3. The Approval Flow (Manager / Admin)
1. The assigned Manager logs into their dedicated dashboard.
2. They click **Approval Queue**. The expense appears natively in their list.
3. The Manager immediately sees the visually highlighted `🚨 AI Triggers` (like "Weekend Expense") and the extracted receipt logo/handwriting.
4. With full context, the manager clicks **Approve** or **Reject**. The expense status updates globally for the employee to see!

---

## 💻 Tech Stack
* **Framework:** Next.js 14.2 (App Router)
* **Design:** Tailwind CSS (Custom Dark-Emerald Configuration) + Lucide Icons
* **Database:** Prisma ORM with SQLite (Persistent on Local & Render)
* **Authentication:** NextAuth.js (Custom Credentials JWT)
