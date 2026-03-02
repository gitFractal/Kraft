import { Transaction } from "./parser";

export interface BudgetSummary {
  totalIncome: number;
  totalExpenses: number;
  netSavings: number;
  savingsRate: number;
  expensesByCategory: Record<string, number>;
  incomeByCategory: Record<string, number>;
  monthlyTrend: { month: string; income: number; expense: number }[];
}

export function calculateBudgetSummary(transactions: Transaction[]): BudgetSummary {
  let totalIncome = 0;
  let totalExpenses = 0;
  const expensesByCategory: Record<string, number> = {};
  const incomeByCategory: Record<string, number> = {};
  const monthlyData: Record<string, { income: number; expense: number }> = {};

  transactions.forEach((tx) => {
    // Parse month for trends (assuming YYYY-MM-DD or MM/DD/YYYY)
    let month = "Unknown";
    try {
      const dateObj = new Date(tx.date);
      if (!isNaN(dateObj.getTime())) {
        month = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, "0")}`;
      }
    } catch (e) {
      // ignore
    }

    if (!monthlyData[month]) {
      monthlyData[month] = { income: 0, expense: 0 };
    }

    if (tx.type === "income") {
      totalIncome += tx.amount;
      incomeByCategory[tx.category] = (incomeByCategory[tx.category] || 0) + tx.amount;
      monthlyData[month].income += tx.amount;
    } else {
      totalExpenses += tx.amount;
      expensesByCategory[tx.category] = (expensesByCategory[tx.category] || 0) + tx.amount;
      monthlyData[month].expense += tx.amount;
    }
  });

  const netSavings = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? (netSavings / totalIncome) * 100 : 0;

  const monthlyTrend = Object.keys(monthlyData)
    .sort()
    .map((month) => ({
      month,
      income: monthlyData[month].income,
      expense: monthlyData[month].expense,
    }));

  return {
    totalIncome,
    totalExpenses,
    netSavings,
    savingsRate,
    expensesByCategory,
    incomeByCategory,
    monthlyTrend,
  };
}

export function formatCurrency(amount: number, currency: string = "USD", rate: number = 1): string {
  const convertedAmount = amount * rate;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
    maximumFractionDigits: 0,
  }).format(convertedAmount);
}
