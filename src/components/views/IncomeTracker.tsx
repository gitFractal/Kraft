import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Plus, Trash2 } from 'lucide-react';
import { useCurrency, CURRENCIES } from '../../lib/CurrencyContext';

export default function IncomeTracker() {
  const { convert, format, baseCurrency, displayCurrency } = useCurrency();
  const [incomes, setIncomes] = useState([
    { id: '1', date: '2026-03-01', category: 'Salary', amount: 5000, currency: 'USD' },
    { id: '2', date: '2026-03-05', category: 'Freelance', amount: 850, currency: 'USD' },
    { id: '3', date: '2026-03-12', category: 'Dividends', amount: 150, currency: 'USD' },
  ]);

  const [newIncome, setNewIncome] = useState({ date: '', category: '', amount: '', currency: displayCurrency });

  const totalIncome = incomes.reduce((sum, item) => sum + convert(item.amount, item.currency, displayCurrency), 0);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIncome.date || !newIncome.category || !newIncome.amount) return;
    setIncomes([...incomes, { 
      id: Date.now().toString(), 
      date: newIncome.date, 
      category: newIncome.category, 
      amount: parseFloat(newIncome.amount),
      currency: newIncome.currency || displayCurrency
    }]);
    setNewIncome({ date: '', category: '', amount: '', currency: displayCurrency });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Income Tracker</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleAdd} className="flex flex-wrap gap-3 mb-6">
          <Input type="date" value={newIncome.date} onChange={e => setNewIncome({...newIncome, date: e.target.value})} className="w-full md:w-auto flex-1" required />
          <Input placeholder="Category" value={newIncome.category} onChange={e => setNewIncome({...newIncome, category: e.target.value})} className="w-full md:w-auto flex-1" required />
          <div className="flex w-full md:w-auto">
            <select 
              value={newIncome.currency} 
              onChange={e => setNewIncome({...newIncome, currency: e.target.value})}
              className="bg-gray-100 dim:bg-[#3d3d3d] dark:bg-[#242424] border-r border-gray-200 dim:border-gray-700 dark:border-gray-700 rounded-l-xl px-2 text-sm focus:outline-none"
            >
              {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <Input type="number" step="0.01" placeholder="Amount" value={newIncome.amount} onChange={e => setNewIncome({...newIncome, amount: e.target.value})} className="rounded-l-none w-full md:w-32" required />
          </div>
          <Button type="submit" className="w-full md:w-auto"><Plus className="h-4 w-4 mr-2" /> Add</Button>
        </form>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200 dim:border-gray-700 dark:border-gray-800 text-gray-500">
                <th className="pb-3 font-medium">Date</th>
                <th className="pb-3 font-medium">Category</th>
                <th className="pb-3 text-right font-medium">Amount</th>
                <th className="pb-3 text-right font-medium">Value in {displayCurrency}</th>
                <th className="pb-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dim:divide-gray-800 dark:divide-gray-800">
              {incomes.map((inc) => (
                <tr key={inc.id} className="hover:bg-gray-50 dim:hover:bg-[#3d3d3d] dark:hover:bg-[#242424] transition-colors">
                  <td className="py-3">{inc.date}</td>
                  <td className="py-3 font-medium">{inc.category}</td>
                  <td className="py-3 text-right text-gray-500">{format(inc.amount, inc.currency)}</td>
                  <td className="py-3 text-right font-bold text-green-600 dark:text-green-400">{format(convert(inc.amount, inc.currency, displayCurrency), displayCurrency)}</td>
                  <td className="py-3 text-right">
                    <Button variant="ghost" size="icon" onClick={() => setIncomes(incomes.filter(i => i.id !== inc.id))} className="h-8 w-8 text-red-500 hover:bg-red-50 dim:hover:bg-red-900/20 dark:hover:bg-red-900/20">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-gray-200 dim:border-gray-700 dark:border-gray-800">
                <td colSpan={3} className="py-4 font-bold text-right">Total Income:</td>
                <td className="py-4 text-right font-bold text-lg text-green-600 dark:text-green-400">{format(totalIncome, displayCurrency)}</td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
