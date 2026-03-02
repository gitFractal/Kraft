/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import Dashboard from "./components/Dashboard";
import Auth from "./components/Auth";
import { Language } from "./lib/i18n";

export type Theme = "light" | "dim" | "dark";

export default function App() {
  const [user, setUser] = useState<string | null>(null);
  const [theme, setTheme] = useState<Theme>("light");
  const [language, setLanguage] = useState<Language>("EN");

  useEffect(() => {
    const savedLang = localStorage.getItem("boxybudget_lang") as Language;
    if (savedLang && ["EN", "CZ", "UA"].includes(savedLang)) {
      setLanguage(savedLang);
    }

    const savedUser = localStorage.getItem("boxybudget_user");
    if (savedUser) {
      setUser(savedUser);
      const savedTheme = localStorage.getItem(`boxybudget_theme_${savedUser}`) as Theme;
      if (savedTheme) {
        setTheme(savedTheme);
      }
    }
  }, []);

  useEffect(() => {
    document.documentElement.classList.remove("theme-dim", "theme-dark");
    if (theme === "dim") document.documentElement.classList.add("theme-dim");
    if (theme === "dark") document.documentElement.classList.add("theme-dark");
    
    if (user) {
      localStorage.setItem(`boxybudget_theme_${user}`, theme);
    }
  }, [theme, user]);

  const handleLanguageChange = (newLang: Language) => {
    setLanguage(newLang);
    localStorage.setItem("boxybudget_lang", newLang);
  };

  const handleLogin = (username: string) => {
    setUser(username);
    localStorage.setItem("boxybudget_user", username);
    const savedTheme = localStorage.getItem(`boxybudget_theme_${username}`) as Theme;
    if (savedTheme) {
      setTheme(savedTheme);
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("boxybudget_user");
  };

  if (!user) {
    return <Auth onLogin={handleLogin} language={language} setLanguage={handleLanguageChange} />;
  }

  return (
    <div className="min-h-screen transition-colors duration-300">
      <Dashboard user={user} onLogout={handleLogout} theme={theme} setTheme={setTheme} language={language} />
    </div>
  );
}
