import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/Card";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { Wallet, AlertCircle } from "lucide-react";
import { Language, translations } from "../lib/i18n";

interface UserRecord {
  passwordHash: string;
  attempts: number;
  lastAttemptDate: string;
}

interface AuthProps {
  onLogin: (username: string) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
}

export default function Auth({ onLogin, language, setLanguage }: AuthProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const t = translations[language];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    const trimmedUser = username.trim();
    if (!trimmedUser) {
      setError(t.errUsernameReq);
      return;
    }
    
    if (password.length < 4) {
      setError(t.errPassMin);
      return;
    }

    const usersStr = localStorage.getItem("boxybudget_users");
    const users: Record<string, UserRecord> = usersStr ? JSON.parse(usersStr) : {};
    
    const today = new Date().toISOString().split('T')[0];
    let userRecord = users[trimmedUser];

    if (userRecord) {
      // Existing user
      if (userRecord.lastAttemptDate !== today) {
        userRecord.attempts = 0;
        userRecord.lastAttemptDate = today;
      }

      if (userRecord.attempts >= 5) {
        setError(t.errLocked);
        users[trimmedUser] = userRecord;
        localStorage.setItem("boxybudget_users", JSON.stringify(users));
        return;
      }

      if (userRecord.passwordHash === password) {
        // Success
        userRecord.attempts = 0;
        users[trimmedUser] = userRecord;
        localStorage.setItem("boxybudget_users", JSON.stringify(users));
        onLogin(trimmedUser);
      } else {
        // Wrong password
        userRecord.attempts += 1;
        users[trimmedUser] = userRecord;
        localStorage.setItem("boxybudget_users", JSON.stringify(users));
        
        if (userRecord.attempts >= 5) {
          setError(t.errLocked);
        } else {
          setError(t.errWrongPass(5 - userRecord.attempts));
        }
      }
    } else {
      // New user registration
      users[trimmedUser] = {
        passwordHash: password,
        attempts: 0,
        lastAttemptDate: today
      };
      localStorage.setItem("boxybudget_users", JSON.stringify(users));
      onLogin(trimmedUser);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center p-4">
      <div className="absolute top-4 right-4">
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value as Language)}
          className="rounded-lg bg-gray-100 dim:bg-[#3d3d3d] dark:bg-[#242424] px-3 py-1.5 text-sm font-bold text-gray-900 dim:text-gray-100 dark:text-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 cursor-pointer transition-colors"
        >
          <option value="EN">EN</option>
          <option value="CZ">CZ</option>
          <option value="UA">UA</option>
        </select>
      </div>
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-500 text-white">
            <Wallet className="h-8 w-8" />
          </div>
          <CardTitle className="text-2xl">Kraft</CardTitle>
          <CardDescription>{t.signInDesc}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 rounded-lg bg-red-50 dim:bg-red-900/30 dark:bg-red-900/30 p-3 text-sm font-bold text-red-600 dim:text-red-400 dark:text-red-400 text-left">
                <AlertCircle className="h-5 w-5 shrink-0" />
                <p>{error}</p>
              </div>
            )}
            <div className="space-y-2 text-left">
              <label className="text-sm font-medium">{t.username}</label>
              <Input 
                type="text" 
                placeholder={t.usernamePlaceholder} 
                value={username} 
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2 text-left">
              <label className="text-sm font-medium">{t.password}</label>
              <Input 
                type="password" 
                placeholder={t.passwordPlaceholder} 
                value={password} 
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={4}
              />
            </div>
            <Button type="submit" className="w-full">{t.signInBtn}</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
