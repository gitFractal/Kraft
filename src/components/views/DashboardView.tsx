import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useCurrency } from '../../lib/CurrencyContext';

const netWorthData = [
  { month: 'Jan', amount: 45000 },
  { month: 'Feb', amount: 48000 },
  { month: 'Mar', amount: 47500 },
  { month: 'Apr', amount: 51000 },
  { month: 'May', amount: 54000 },
  { month: 'Jun', amount: 56300 },
];

const cashFlowData = [
  { month: 'Jan', income: 5000, expenses: 3200 },
  { month: 'Feb', income: 5200, expenses: 3100 },
  { month: 'Mar', income: 5000, expenses: 3800 },
  { month: 'Apr', income: 5500, expenses: 3000 },
  { month: 'May', income: 5000, expenses: 2900 },
  { month: 'Jun', income: 6000, expenses: 3400 },
];

export default function DashboardView() {
  const { convert, format, baseCurrency } = useCurrency();

  // Convert dummy data from baseCurrency to displayCurrency
  const convertedNetWorth = netWorthData.map(d => ({
    ...d,
    amount: convert(d.amount, baseCurrency)
  }));

  const convertedCashFlow = cashFlowData.map(d => ({
    ...d,
    income: convert(d.income, baseCurrency),
    expenses: convert(d.expenses, baseCurrency)
  }));

  const currentNetWorth = convertedNetWorth[convertedNetWorth.length - 1].amount;
  const currentIncome = convertedCashFlow[convertedCashFlow.length - 1].income;
  const currentExpenses = convertedCashFlow[convertedCashFlow.length - 1].expenses;

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">Current Net Worth</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{format(currentNetWorth)}</div>
            <p className="text-xs text-green-600 mt-1">+4.2% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">Monthly Income</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{format(currentIncome)}</div>
            <p className="text-xs text-green-600 mt-1">+9.1% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">Monthly Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{format(currentExpenses)}</div>
            <p className="text-xs text-red-600 mt-1">+17.2% from last month</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Net Worth Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={convertedNetWorth} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
                  <XAxis dataKey="month" stroke="#6B7280" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#6B7280" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => format(value, undefined).replace(/\.00$/, '')} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#f3f4f6', borderRadius: '0.5rem' }}
                    itemStyle={{ color: '#e5e7eb' }}
                    formatter={(value: number) => [format(value), 'Net Worth']}
                  />
                  <Line type="monotone" dataKey="amount" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Income vs Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={convertedCashFlow} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
                  <XAxis dataKey="month" stroke="#6B7280" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#6B7280" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => format(value, undefined).replace(/\.00$/, '')} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#f3f4f6', borderRadius: '0.5rem' }}
                    cursor={{ fill: '#374151', opacity: 0.1 }}
                    formatter={(value: number, name: string) => [format(value), name]}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                  <Bar dataKey="income" name="Income" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expenses" name="Expenses" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
