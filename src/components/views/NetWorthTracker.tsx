import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Plus, Trash2 } from 'lucide-react';
import { useCurrency, CURRENCIES } from '../../lib/CurrencyContext';

interface Item {
  id: string;
  name: string;
  amount: number;
  currency: string;
}

export default function NetWorthTracker() {
  const { convert, format, baseCurrency, displayCurrency } = useCurrency();
  const [assets, setAssets] = useState<Item[]>([
    { id: '1', name: 'Checking Account', amount: 5000, currency: 'USD' },
    { id: '2', name: 'Savings Account', amount: 15000, currency: 'USD' },
    { id: '3', name: 'Investment Portfolio', amount: 45000, currency: 'USD' },
  ]);
  
  const [liabilities, setLiabilities] = useState<Item[]>([
    { id: '4', name: 'Credit Card', amount: 1200, currency: 'USD' },
    { id: '5', name: 'Car Loan', amount: 12500, currency: 'USD' },
  ]);

  const [newAsset, setNewAsset] = useState({ name: '', amount: '', currency: displayCurrency });
  const [newLiability, setNewLiability] = useState({ name: '', amount: '', currency: displayCurrency });

  const totalAssets = assets.reduce((sum, item) => sum + convert(item.amount, item.currency, displayCurrency), 0);
  const totalLiabilities = liabilities.reduce((sum, item) => sum + convert(item.amount, item.currency, displayCurrency), 0);
  const netWorth = totalAssets - totalLiabilities;

  const handleAddAsset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAsset.name || !newAsset.amount) return;
    setAssets([...assets, { id: Date.now().toString(), name: newAsset.name, amount: parseFloat(newAsset.amount), currency: newAsset.currency || displayCurrency }]);
    setNewAsset({ name: '', amount: '', currency: displayCurrency });
  };

  const handleAddLiability = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLiability.name || !newLiability.amount) return;
    setLiabilities([...liabilities, { id: Date.now().toString(), name: newLiability.name, amount: parseFloat(newLiability.amount), currency: newLiability.currency || displayCurrency }]);
    setNewLiability({ name: '', amount: '', currency: displayCurrency });
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-blue-500 to-blue-700 text-white border-none">
        <CardContent className="p-8 text-center">
          <h2 className="text-blue-100 text-lg font-medium mb-2">Total Net Worth</h2>
          <div className="text-5xl font-bold">{format(netWorth, displayCurrency)}</div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Assets Column */}
        <Card>
          <CardHeader>
            <CardTitle className="text-green-600 dark:text-green-400">Assets</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddAsset} className="flex gap-2 mb-6">
              <Input 
                placeholder="Asset name" 
                value={newAsset.name} 
                onChange={e => setNewAsset({...newAsset, name: e.target.value})} 
                className="flex-1"
              />
              <div className="flex w-32 md:w-40 shrink-0">
                <select 
                  value={newAsset.currency} 
                  onChange={e => setNewAsset({...newAsset, currency: e.target.value})}
                  className="bg-gray-100 dim:bg-[#3d3d3d] dark:bg-[#242424] border-r border-gray-200 dim:border-gray-700 dark:border-gray-700 rounded-l-xl px-2 text-sm focus:outline-none"
                >
                  {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <Input 
                  type="number" 
                  placeholder="Amount" 
                  value={newAsset.amount} 
                  onChange={e => setNewAsset({...newAsset, amount: e.target.value})} 
                  className="rounded-l-none w-full"
                />
              </div>
              <Button type="submit" size="icon" className="shrink-0"><Plus className="h-4 w-4" /></Button>
            </form>

            <div className="space-y-3">
              {assets.map(asset => (
                <div key={asset.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dim:bg-[#3d3d3d] dark:bg-[#242424]">
                  <span className="font-medium">{asset.name}</span>
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col items-end">
                      <span className="text-xs text-gray-500">{format(asset.amount, asset.currency)}</span>
                      <span className="font-bold text-green-600 dark:text-green-400">{format(convert(asset.amount, asset.currency, displayCurrency), displayCurrency)}</span>
                    </div>
                    <button onClick={() => setAssets(assets.filter(a => a.id !== asset.id))} className="text-gray-400 hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </div>
              ))}
              <div className="flex items-center justify-between p-3 border-t border-gray-200 dim:border-gray-700 dark:border-gray-800 mt-4">
                <span className="font-bold">Total Assets</span>
                <span className="font-bold text-green-600 dark:text-green-400">{format(totalAssets, displayCurrency)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Liabilities Column */}
        <Card>
          <CardHeader>
            <CardTitle className="text-red-600 dark:text-red-400">Liabilities</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddLiability} className="flex gap-2 mb-6">
              <Input 
                placeholder="Liability name" 
                value={newLiability.name} 
                onChange={e => setNewLiability({...newLiability, name: e.target.value})} 
                className="flex-1"
              />
              <div className="flex w-32 md:w-40 shrink-0">
                <select 
                  value={newLiability.currency} 
                  onChange={e => setNewLiability({...newLiability, currency: e.target.value})}
                  className="bg-gray-100 dim:bg-[#3d3d3d] dark:bg-[#242424] border-r border-gray-200 dim:border-gray-700 dark:border-gray-700 rounded-l-xl px-2 text-sm focus:outline-none"
                >
                  {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <Input 
                  type="number" 
                  placeholder="Amount" 
                  value={newLiability.amount} 
                  onChange={e => setNewLiability({...newLiability, amount: e.target.value})} 
                  className="rounded-l-none w-full"
                />
              </div>
              <Button type="submit" size="icon" variant="danger" className="shrink-0"><Plus className="h-4 w-4" /></Button>
            </form>

            <div className="space-y-3">
              {liabilities.map(liability => (
                <div key={liability.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dim:bg-[#3d3d3d] dark:bg-[#242424]">
                  <span className="font-medium">{liability.name}</span>
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col items-end">
                      <span className="text-xs text-gray-500">{format(liability.amount, liability.currency)}</span>
                      <span className="font-bold text-red-600 dark:text-red-400">{format(convert(liability.amount, liability.currency, displayCurrency), displayCurrency)}</span>
                    </div>
                    <button onClick={() => setLiabilities(liabilities.filter(l => l.id !== liability.id))} className="text-gray-400 hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </div>
              ))}
              <div className="flex items-center justify-between p-3 border-t border-gray-200 dim:border-gray-700 dark:border-gray-800 mt-4">
                <span className="font-bold">Total Liabilities</span>
                <span className="font-bold text-red-600 dark:text-red-400">{format(totalLiabilities, displayCurrency)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
