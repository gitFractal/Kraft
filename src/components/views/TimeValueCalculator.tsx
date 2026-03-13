import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/Card';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Calculator } from 'lucide-react';
import { useCurrency } from '../../lib/CurrencyContext';

export default function TimeValueCalculator() {
  const { format, displayCurrency } = useCurrency();
  const [initialAmount, setInitialAmount] = useState('10000');
  const [monthlyContribution, setMonthlyContribution] = useState('500');
  const [interestRate, setInterestRate] = useState('7');
  const [years, setYears] = useState('10');
  const [futureValue, setFutureValue] = useState<number | null>(null);

  const calculateFV = (e: React.FormEvent) => {
    e.preventDefault();
    const P = parseFloat(initialAmount) || 0;
    const PMT = parseFloat(monthlyContribution) || 0;
    const r = (parseFloat(interestRate) || 0) / 100 / 12; // monthly interest rate
    const n = (parseFloat(years) || 0) * 12; // total months

    let fv = 0;
    if (r === 0) {
      fv = P + (PMT * n);
    } else {
      fv = P * Math.pow(1 + r, n) + PMT * ((Math.pow(1 + r, n) - 1) / r);
    }
    
    setFutureValue(fv);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Time Value of Money</CardTitle>
          <CardDescription>Calculate the future value of your investments</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={calculateFV} className="space-y-6">
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Initial Amount ({displayCurrency})</label>
                <Input type="number" value={initialAmount} onChange={e => setInitialAmount(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Monthly Contribution ({displayCurrency})</label>
                <Input type="number" value={monthlyContribution} onChange={e => setMonthlyContribution(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Annual Interest Rate (%)</label>
                <Input type="number" step="0.1" value={interestRate} onChange={e => setInterestRate(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Years to Grow</label>
                <Input type="number" value={years} onChange={e => setYears(e.target.value)} required />
              </div>
            </div>
            
            <Button type="submit" className="w-full">
              <Calculator className="mr-2 h-4 w-4" /> Calculate Future Value
            </Button>
          </form>

          {futureValue !== null && (
            <div className="mt-8 p-6 rounded-xl bg-blue-50 dim:bg-blue-900/20 dark:bg-blue-900/20 border border-blue-100 dim:border-blue-800 dark:border-blue-800 text-center">
              <h3 className="text-sm font-medium text-blue-800 dim:text-blue-300 dark:text-blue-300 mb-2">Estimated Future Value</h3>
              <div className="text-4xl font-bold text-blue-900 dim:text-blue-100 dark:text-blue-100">
                {format(futureValue, displayCurrency)}
              </div>
              <p className="text-sm text-blue-600 dim:text-blue-400 dark:text-blue-400 mt-2">
                Total Contributions: {format(parseFloat(initialAmount) + (parseFloat(monthlyContribution) * parseFloat(years) * 12), displayCurrency)}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
