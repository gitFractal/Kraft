import { useState, useEffect, useRef } from "react";
import { Upload, FileSpreadsheet, Trash2, TrendingUp, TrendingDown, DollarSign, PieChart as PieChartIcon, BarChart3, Moon, Sun, Loader2, AlertCircle, Plus, LogOut, Monitor } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/Card";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { parseSpreadsheet, Transaction } from "../lib/parser";
import { calculateBudgetSummary, BudgetSummary, formatCurrency } from "../lib/calculations";
import { Language, translations } from "../lib/i18n";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";

const COLORS = ['#1d1d1f', '#86868b', '#0066cc', '#34c759', '#ff3b30', '#ff9500', '#af52de', '#5856d6'];
const DIM_COLORS = ['#e0e0e0', '#9e9e9e', '#4dabf7', '#69db7c', '#ff8787', '#ffd43b', '#da77f2', '#9775fa'];
const DARK_COLORS = ['#f5f5f5', '#757575', '#339af0', '#51cf66', '#ff6b6b', '#fcc419', '#cc5de8', '#845ef7'];
const CURRENCIES = ["USD", "EUR", "CZK", "UAH"];

interface DashboardProps {
  user: string;
  onLogout: () => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  language: Language;
}

export default function Dashboard({ user, onLogout, theme, setTheme, language }: DashboardProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState<BudgetSummary | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);
  
  const [currency, setCurrency] = useState("USD");
  const [rates, setRates] = useState<Record<string, number>>({ USD: 1, EUR: 0.92, CZK: 23.5, UAH: 38.5 });
  
  const t = translations[language];

  const [newTx, setNewTx] = useState({
    date: new Date().toISOString().split('T')[0],
    description: "",
    amount: "",
    category: "General",
    type: "expense" as "income" | "expense"
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Load saved data specific to user
    const saved = localStorage.getItem(`boxybudget_data_${user}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setTransactions(parsed);
        setSummary(calculateBudgetSummary(parsed));
      } catch (e) {
        console.error("Failed to load saved data", e);
      }
    } else {
      setTransactions([]);
      setSummary(null);
    }
    
    const savedCurrency = localStorage.getItem(`boxybudget_currency_${user}`);
    if (savedCurrency && CURRENCIES.includes(savedCurrency)) {
      setCurrency(savedCurrency);
    }

    // Fetch real exchange rates
    fetch("https://open.er-api.com/v6/latest/USD")
      .then(res => res.json())
      .then(data => {
        if (data && data.rates) {
          setRates({
            USD: 1,
            EUR: data.rates.EUR || 0.92,
            CZK: data.rates.CZK || 23.5,
            UAH: data.rates.UAH || 38.5
          });
        }
      })
      .catch(err => console.error("Failed to fetch rates", err));
  }, [user]);

  const handleCurrencyChange = (newCurrency: string) => {
    setCurrency(newCurrency);
    localStorage.setItem(`boxybudget_currency_${user}`, newCurrency);
  };

  const handleFileUpload = (file: File) => {
    setIsLoading(true);
    setError(null);
    
    setTimeout(async () => {
      try {
        const data = await parseSpreadsheet(file);
        if (data.length === 0) {
          throw new Error(t.errNoValidTx);
        }
        const updated = [...data, ...transactions];
        setTransactions(updated);
        setSummary(calculateBudgetSummary(updated));
        localStorage.setItem(`boxybudget_data_${user}`, JSON.stringify(updated));
      } catch (err: any) {
        console.error("Error parsing file:", err);
        setError(err.message || t.errParseFailed);
      } finally {
        setIsLoading(false);
      }
    }, 50);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const clearData = () => {
    if (confirmClear) {
      setTransactions([]);
      setSummary(null);
      localStorage.removeItem(`boxybudget_data_${user}`);
      setConfirmClear(false);
    } else {
      setConfirmClear(true);
      setTimeout(() => setConfirmClear(false), 3000);
    }
  };

  const handleAddTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTx.description || !newTx.amount) return;
    
    const amountNum = parseFloat(newTx.amount);
    if (isNaN(amountNum)) return;

    // The user enters the amount in the currently selected currency.
    // We need to convert it back to the base currency (USD) before saving.
    const baseAmount = Math.abs(amountNum) / currentRate;

    const transaction: Transaction = {
      id: `tx-manual-${Date.now()}`,
      date: newTx.date,
      description: newTx.description,
      amount: baseAmount,
      category: newTx.category,
      type: newTx.type
    };

    const updated = [transaction, ...transactions];
    setTransactions(updated);
    setSummary(calculateBudgetSummary(updated));
    localStorage.setItem(`boxybudget_data_${user}`, JSON.stringify(updated));
    
    setNewTx({ ...newTx, description: "", amount: "" });
  };

  const handleDeleteTransaction = (id: string) => {
    const updated = transactions.filter(t => t.id !== id);
    setTransactions(updated);
    setSummary(calculateBudgetSummary(updated));
    localStorage.setItem(`boxybudget_data_${user}`, JSON.stringify(updated));
  };

  const cycleTheme = () => {
    if (theme === "light") setTheme("dim");
    else if (theme === "dim") setTheme("dark");
    else setTheme("light");
  };

  const currentRate = rates[currency] || 1;
  const activeColors = theme === "dark" ? DARK_COLORS : theme === "dim" ? DIM_COLORS : COLORS;

  const getThemeIcon = () => {
    if (theme === "light") return <Sun className="h-5 w-5" />;
    if (theme === "dim") return <Monitor className="h-5 w-5" />;
    return <Moon className="h-5 w-5" />;
  };

  return (
    <div className="mx-auto max-w-6xl p-6 space-y-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight">{t.welcome(user)}</h1>
          <p className="font-medium text-gray-500 dim:text-gray-400 dark:text-gray-400">{t.summaryDesc}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex rounded-xl bg-white dim:bg-[#2d2d2d] dark:bg-[#141414] p-1">
            {CURRENCIES.map(c => (
              <button
                key={c}
                onClick={() => handleCurrencyChange(c)}
                className={`px-3 py-1 text-sm font-bold rounded-lg transition-colors ${
                  currency === c 
                    ? "bg-gray-900 text-white dim:bg-gray-100 dim:text-gray-900 dark:bg-gray-100 dark:text-gray-900" 
                    : "text-gray-500 hover:text-gray-900 dim:text-gray-400 dim:hover:text-gray-100 dark:text-gray-400 dark:hover:text-gray-100"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
          <Button variant="outline" size="icon" onClick={cycleTheme} title={`Current theme: ${theme}`}>
            {getThemeIcon()}
          </Button>
          <Button variant="outline" onClick={onLogout} title={t.signOut}>
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </header>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-bold text-gray-500 dim:text-gray-400 dark:text-gray-400">{t.totalIncome}</CardTitle>
            <div className="rounded-lg bg-green-100 dim:bg-green-900/30 dark:bg-green-900/30 p-2">
              <TrendingUp className="h-4 w-4 text-green-600 dim:text-green-400 dark:text-green-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black tracking-tight">{formatCurrency(summary?.totalIncome || 0, currency, currentRate)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-bold text-gray-500 dim:text-gray-400 dark:text-gray-400">{t.totalExpenses}</CardTitle>
            <div className="rounded-lg bg-red-100 dim:bg-red-900/30 dark:bg-red-900/30 p-2">
              <TrendingDown className="h-4 w-4 text-red-600 dim:text-red-400 dark:text-red-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black tracking-tight">{formatCurrency(summary?.totalExpenses || 0, currency, currentRate)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-bold text-gray-500 dim:text-gray-400 dark:text-gray-400">{t.netSavings}</CardTitle>
            <div className="rounded-lg bg-blue-100 dim:bg-blue-900/30 dark:bg-blue-900/30 p-2">
              <DollarSign className="h-4 w-4 text-blue-600 dim:text-blue-400 dark:text-blue-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black tracking-tight">{formatCurrency(summary?.netSavings || 0, currency, currentRate)}</div>
            <p className="mt-1 text-sm font-bold text-gray-500 dim:text-gray-400 dark:text-gray-400">
              {t.savingsRate((summary?.savingsRate || 0).toFixed(1))}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-gray-500 dim:text-gray-400 dark:text-gray-400" />
              <CardTitle>{t.cashFlowTrend}</CardTitle>
            </div>
            <CardDescription>{t.incomeVsExpenses}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              {summary?.monthlyTrend && summary.monthlyTrend.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={summary.monthlyTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === "light" ? "#e5e5ea" : "#3f3f46"} />
                    <XAxis 
                      dataKey="month" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 12, fill: theme === "light" ? '#86868b' : '#a1a1aa', fontWeight: 600 }} 
                      dy={10}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 12, fill: theme === "light" ? '#86868b' : '#a1a1aa', fontWeight: 600 }} 
                      tickFormatter={(value) => formatCurrency(value, currency, currentRate)}
                    />
                    <Tooltip 
                      cursor={{ fill: theme === "light" ? '#f5f5f7' : '#27272a' }}
                      contentStyle={{ 
                        borderRadius: '12px', 
                        border: 'none',
                        backgroundColor: theme === "light" ? '#ffffff' : '#141414',
                        color: theme === "light" ? '#000000' : '#ffffff',
                        fontWeight: 'bold',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                      }}
                      formatter={(value: number) => formatCurrency(value, currency, currentRate)}
                    />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '20px', fontWeight: 'bold' }} />
                    <Bar dataKey="income" name={t.income} fill={theme === "light" ? "#34c759" : "#4ade80"} radius={[4, 4, 0, 0]} maxBarSize={40} />
                    <Bar dataKey="expense" name={t.expense} fill={theme === "light" ? "#ff3b30" : "#f87171"} radius={[4, 4, 0, 0]} maxBarSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-gray-400">{t.noData}</div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <PieChartIcon className="h-5 w-5 text-gray-500 dim:text-gray-400 dark:text-gray-400" />
              <CardTitle>{t.topExpenses}</CardTitle>
            </div>
            <CardDescription>{t.whereMoneyGoes}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              {summary?.expensesByCategory && Object.keys(summary.expensesByCategory).length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={Object.entries(summary.expensesByCategory).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 8)}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                      stroke="none"
                    >
                      {Object.entries(summary.expensesByCategory).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={activeColors[index % activeColors.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        borderRadius: '12px', 
                        border: 'none',
                        backgroundColor: theme === "light" ? '#ffffff' : '#141414',
                        color: theme === "light" ? '#000000' : '#ffffff',
                        fontWeight: 'bold',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                      }}
                      formatter={(value: number) => formatCurrency(value, currency, currentRate)}
                    />
                    <Legend 
                      layout="vertical" 
                      verticalAlign="middle" 
                      align="right"
                      iconType="circle"
                      wrapperStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-gray-400">{t.noData}</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t.addTransaction}</CardTitle>
            <CardDescription>{t.manualAddDesc}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddTransaction} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t.type}</label>
                  <select 
                    className="flex h-10 w-full rounded-xl bg-gray-100 dim:bg-[#3d3d3d] dark:bg-[#242424] px-3 py-2 text-[16px] md:text-sm text-gray-900 dim:text-gray-100 dark:text-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 transition-colors"
                    value={newTx.type}
                    onChange={(e) => setNewTx({...newTx, type: e.target.value as "income"|"expense"})}
                  >
                    <option value="expense">{t.expense}</option>
                    <option value="income">{t.income}</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t.date}</label>
                  <Input 
                    type="date" 
                    value={newTx.date}
                    onChange={(e) => setNewTx({...newTx, date: e.target.value})}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">{t.description}</label>
                <Input 
                  placeholder={t.descPlaceholder} 
                  value={newTx.description}
                  onChange={(e) => setNewTx({...newTx, description: e.target.value})}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t.amount} ({currency})</label>
                  <Input 
                    type="number" 
                    step="0.01"
                    placeholder="0.00" 
                    value={newTx.amount}
                    onChange={(e) => setNewTx({...newTx, amount: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t.category}</label>
                  <Input 
                    placeholder={t.catPlaceholder} 
                    value={newTx.category}
                    onChange={(e) => setNewTx({...newTx, category: e.target.value})}
                    required
                  />
                </div>
              </div>
              <Button type="submit" className="w-full">
                <Plus className="mr-2 h-4 w-4" /> {t.addTransaction}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t.importData}</CardTitle>
            <CardDescription>{t.importDesc}</CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 dim:bg-red-900/30 dark:bg-red-900/30 p-3 text-sm font-bold text-red-600 dim:text-red-400 dark:text-red-400 text-left">
                <AlertCircle className="h-5 w-5 shrink-0" />
                <p>{error}</p>
              </div>
            )}
            <div
              className={`relative flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 transition-colors ${
                isDragging ? "border-blue-500 bg-blue-50 dim:bg-blue-900/20 dark:bg-blue-900/20" : "border-gray-300 dim:border-gray-600 dark:border-gray-700 hover:bg-gray-50 dim:hover:bg-[#3d3d3d] dark:hover:bg-[#242424]"
              } ${isLoading ? "opacity-50 pointer-events-none" : ""}`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => !isLoading && fileInputRef.current?.click()}
            >
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept=".csv,.xlsx,.xls,.ods"
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    handleFileUpload(e.target.files[0]);
                  }
                }}
              />
              {isLoading ? (
                <Loader2 className="mb-4 h-8 w-8 animate-spin text-gray-900 dim:text-gray-100 dark:text-gray-100" />
              ) : (
                <Upload className="mb-4 h-8 w-8 text-gray-400 dim:text-gray-500 dark:text-gray-500" />
              )}
              <p className="text-sm font-bold text-gray-900 dim:text-gray-100 dark:text-gray-100">
                {isLoading ? t.processing : t.clickToUpload}
              </p>
            </div>
            {transactions.length > 0 && (
              <div className="mt-4">
                <Button variant="danger" className="w-full" onClick={clearData}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  {confirmClear ? t.clickToConfirmClear : t.clearAllData}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t.transactions}</CardTitle>
          <CardDescription>{t.txDesc}</CardDescription>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <div className="py-8 text-center text-gray-500 dim:text-gray-400 dark:text-gray-400">
              {t.noTxYet}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-100 dim:border-gray-700 dark:border-gray-800 text-gray-500 dim:text-gray-400 dark:text-gray-400">
                    <th className="pb-3 font-bold">{t.date}</th>
                    <th className="pb-3 font-bold">{t.description}</th>
                    <th className="pb-3 font-bold">{t.category}</th>
                    <th className="pb-3 text-right font-bold">{t.amount}</th>
                    <th className="pb-3 text-right font-bold">{t.actions}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dim:divide-gray-700 dark:divide-gray-800">
                  {transactions.slice(0, 50).map((tx) => (
                    <tr key={tx.id} className="transition-colors hover:bg-gray-50 dim:hover:bg-[#3d3d3d] dark:hover:bg-[#242424]">
                      <td className="py-3 font-medium text-gray-500 dim:text-gray-400 dark:text-gray-400">{tx.date}</td>
                      <td className="py-3 font-bold">{tx.description}</td>
                      <td className="py-3">
                        <span className="inline-flex items-center rounded-md bg-gray-100 dim:bg-[#3d3d3d] dark:bg-[#242424] px-2.5 py-0.5 text-xs font-bold text-gray-900 dim:text-gray-100 dark:text-gray-100">
                          {tx.category}
                        </span>
                      </td>
                      <td className={`py-3 text-right font-black ${tx.type === 'income' ? 'text-green-600 dim:text-green-400 dark:text-green-400' : 'text-gray-900 dim:text-gray-100 dark:text-gray-100'}`}>
                        {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount, currency, currentRate)}
                      </td>
                      <td className="py-3 text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteTransaction(tx.id)} className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 dim:hover:bg-red-900/20 dark:hover:bg-red-900/20">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {transactions.length > 50 && (
                <div className="mt-4 text-center text-sm text-gray-500 dim:text-gray-400 dark:text-gray-400">
                  {t.showingTx(50, transactions.length)}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
