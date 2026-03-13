import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/Card';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Clock } from 'lucide-react';

export default function RealWageEstimator() {
  const [hourlyWage, setHourlyWage] = useState('25');
  const [hoursWorked, setHoursWorked] = useState('40');
  const [commuteHours, setCommuteHours] = useState('5');
  const [prepHours, setPrepHours] = useState('2');
  const [workExpenses, setWorkExpenses] = useState('50'); // weekly
  
  const [realWage, setRealWage] = useState<number | null>(null);

  const calculateRealWage = (e: React.FormEvent) => {
    e.preventDefault();
    const wage = parseFloat(hourlyWage) || 0;
    const worked = parseFloat(hoursWorked) || 0;
    const commute = parseFloat(commuteHours) || 0;
    const prep = parseFloat(prepHours) || 0;
    const expenses = parseFloat(workExpenses) || 0;

    const grossIncome = wage * worked;
    const netIncome = grossIncome - expenses;
    const totalHoursDedicated = worked + commute + prep;

    const actualHourly = totalHoursDedicated > 0 ? netIncome / totalHoursDedicated : 0;
    setRealWage(actualHourly);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Real Wage Estimator</CardTitle>
          <CardDescription>Calculate your true "Life Energy" hourly rate</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={calculateRealWage} className="space-y-6">
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Official Hourly Wage ($)</label>
                <Input type="number" step="0.5" value={hourlyWage} onChange={e => setHourlyWage(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Paid Hours per Week</label>
                <Input type="number" value={hoursWorked} onChange={e => setHoursWorked(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Unpaid Commute (Hours/Week)</label>
                <Input type="number" step="0.5" value={commuteHours} onChange={e => setCommuteHours(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Unpaid Prep (Hours/Week)</label>
                <Input type="number" step="0.5" value={prepHours} onChange={e => setPrepHours(e.target.value)} required />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <label className="text-sm font-medium">Work-Related Expenses ($/Week)</label>
                <p className="text-xs text-gray-500 mb-2">Gas, transit, work clothes, bought lunches, etc.</p>
                <Input type="number" value={workExpenses} onChange={e => setWorkExpenses(e.target.value)} required />
              </div>
            </div>
            
            <Button type="submit" className="w-full">
              <Clock className="mr-2 h-4 w-4" /> Calculate Real Wage
            </Button>
          </form>

          {realWage !== null && (
            <div className="mt-8 p-6 rounded-xl bg-emerald-50 dim:bg-emerald-900/20 dark:bg-emerald-900/20 border border-emerald-100 dim:border-emerald-800 dark:border-emerald-800 text-center">
              <h3 className="text-sm font-medium text-emerald-800 dim:text-emerald-300 dark:text-emerald-300 mb-2">Your True Hourly Wage</h3>
              <div className="text-4xl font-bold text-emerald-900 dim:text-emerald-100 dark:text-emerald-100">
                ${realWage.toFixed(2)} / hr
              </div>
              <p className="text-sm text-emerald-600 dim:text-emerald-400 dark:text-emerald-400 mt-2">
                Compared to official ${parseFloat(hourlyWage).toFixed(2)} / hr
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
