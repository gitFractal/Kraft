import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Plus, Trash2 } from 'lucide-react';

export default function ExpensesTracker() {
  const [expenses, setExpenses] = useState([
    { id: '1', date: '2026-03-02', category: 'Groceries', amount: 120.50 },
    { id: '2', date: '2026-03-04', category: 'Utilities', amount: 145.00 },
    { id: '3', date: '2026-03-08', category: 'Dining Out', amount: 65.00 },
    { id: '4', date: '2026-03-10', category: 'Transportation', amount: 40.00 },
  ]);

  const [newExpense, setNewExpense] = useState({ date: '', category: '', amount: '' });

  const totalExpense = expenses.reduce((sum, item) => sum + item.amount, 0);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExpense.date || !newExpense.category || !newExpense.amount) return;
    setExpenses([...expenses, { id: Date.now().toString(), date: newExpense.date, category: newExpense.category, amount: parseFloat(newExpense.amount) }]);
    setNewExpense({ date: '', category: '', amount: '' });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Expenses Tracker</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleAdd} className="flex flex-wrap gap-3 mb-6">
          <Input type="date" value={newExpense.date} onChange={e => setNewExpense({...newExpense, date: e.target.value})} className="w-full md:w-auto flex-1" required />
          <Input placeholder="Category" value={newExpense.category} onChange={e => setNewExpense({...newExpense, category: e.target.value})} className="w-full md:w-auto flex-1" required />
          <Input type="number" step="0.01" placeholder="Amount" value={newExpense.amount} onChange={e => setNewExpense({...newExpense, amount: e.target.value})} className="w-full md:w-32" required />
          <Button type="submit" variant="danger" className="w-full md:w-auto"><Plus className="h-4 w-4 mr-2" /> Add</Button>
        </form>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200 dim:border-gray-700 dark:border-gray-800 text-gray-500">
                <th className="pb-3 font-medium">Date</th>
                <th className="pb-3 font-medium">Category</th>
                <th className="pb-3 text-right font-medium">Amount</th>
                <th className="pb-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dim:divide-gray-800 dark:divide-gray-800">
              {expenses.map((exp) => (
                <tr key={exp.id} className="hover:bg-gray-50 dim:hover:bg-[#3d3d3d] dark:hover:bg-[#242424] transition-colors">
                  <td className="py-3">{exp.date}</td>
                  <td className="py-3 font-medium">{exp.category}</td>
                  <td className="py-3 text-right font-bold text-red-600 dark:text-red-400">${exp.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  <td className="py-3 text-right">
                    <Button variant="ghost" size="icon" onClick={() => setExpenses(expenses.filter(i => i.id !== exp.id))} className="h-8 w-8 text-red-500 hover:bg-red-50 dim:hover:bg-red-900/20 dark:hover:bg-red-900/20">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-gray-200 dim:border-gray-700 dark:border-gray-800">
                <td colSpan={2} className="py-4 font-bold text-right">Total Expenses:</td>
                <td className="py-4 text-right font-bold text-lg text-red-600 dark:text-red-400">${totalExpense.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
