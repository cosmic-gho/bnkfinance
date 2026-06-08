"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { usePathname } from "next/navigation";

export function CredixNavbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [savingsOpen, setSavingsOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleDarkMode = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const isActive = (path: string) => {
    if (path === "/" && pathname === "/") return true;
    if (path !== "/" && pathname?.startsWith(path)) return true;
    return false;
  };

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/services", label: "Personal" },
    { href: "/about", label: "Corporate" },
    { href: "/contact", label: "Insurance" },
    { href: "/grants", label: "Mortgages" },
  ];

  return (
    <>
      {/* Top Announcement Bar */}
      <div className="bg-accent text-accent-foreground text-center py-2 px-4 text-sm font-medium hidden sm:block">
        <div className="flex items-center justify-center gap-2">
          <i className="fa-solid fa-globe text-primary-700"></i>
          <span>World class service from your true international community bank</span>
        </div>
      </div>

      {/* Main Navigation */}
      <nav
        className={`sticky top-0 z-50 bg-white dark:bg-gray-900 transition-shadow duration-300 ${
          scrolled ? "shadow-lg" : "shadow-sm"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 lg:h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center group-hover:bg-primary-700 transition-colors">
                <i className="fa-solid fa-shield text-white text-lg"></i>
              </div>
              <div className="leading-tight">
                <span className="block text-lg font-extrabold text-primary-800 dark:text-white tracking-tight">
                  BNK Finance
                </span>
                <span className="block text-xs font-bold text-primary-600 dark:text-primary-400 tracking-widest">
                  BANK
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                    isActive(link.href)
                      ? "text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30"
                      : "text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                  }`}
                >
                  {link.label}
                </Link>
              ))}

              {/* Savings Dropdown */}
              <div className="relative group">
                <button
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 flex items-center gap-1 ${
                    isActive("/chart")
                      ? "text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30"
                      : "text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                  }`}
                >
                  Savings
                  <i className="fa-solid fa-chevron-down text-[10px] group-hover:rotate-180 transition-transform duration-300"></i>
                </button>
                <div className="absolute top-full left-0 mt-1 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-100 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="p-2">
                    <Link
                      href="/chart"
                      className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
                    >
                      <i className="fa-solid fa-piggy-bank text-primary-500 w-4"></i>
                      High Yield Savings
                    </Link>
                    <Link
                      href="/alerts"
                      className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
                    >
                      <i className="fa-solid fa-certificate text-primary-500 w-4"></i>
                      Certificates
                    </Link>
                    <Link
                      href="/send-money"
                      className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
                    >
                      <i className="fa-solid fa-vault text-primary-500 w-4"></i>
                      Money Market
                    </Link>
                  </div>
                </div>
              </div>

              {/* Login */}
              <Link
                href="/login"
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
              >
                Login
              </Link>
            </div>

            {/* Desktop CTA */}
            <div className="hidden lg:flex items-center gap-3">
              <button
                onClick={toggleDarkMode}
                className="p-2.5 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                {mounted && theme === "dark" ? (
                  <i className="fa-solid fa-sun text-base"></i>
                ) : (
                  <i className="fa-solid fa-moon text-base"></i>
                )}
              </button>

              <Link
                href="/signup"
                className="px-6 py-2.5 bg-accent hover:bg-accent-600 text-accent-foreground font-semibold text-sm rounded-full transition-all duration-300 shadow-md hover:shadow-lg hover:-translate-y-0.5"
              >
                Open An Account
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2.5 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              {mobileMenuOpen ? (
                <i className="fa-solid fa-times text-xl"></i>
              ) : (
                <i className="fa-solid fa-bars text-xl"></i>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 shadow-xl">
            <div className="px-4 py-4 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                    isActive(link.href)
                      ? "text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                  }`}
                >
                  {link.label}
                </Link>
              ))}

              {/* Savings Submenu */}
              <div>
                <button
                  onClick={() => setSavingsOpen(!savingsOpen)}
                  className="flex items-center justify-between w-full px-4 py-3 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <span>Savings</span>
                  <i
                    className={`fa-solid fa-chevron-down text-xs transition-transform duration-300 ${
                      savingsOpen ? "rotate-180" : ""
                    }`}
                  ></i>
                </button>
                {savingsOpen && (
                  <div className="ml-4 space-y-1 mt-1">
                    <Link
                      href="/chart"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 rounded-lg transition-colors"
                    >
                      <i className="fa-solid fa-piggy-bank text-primary-500 w-4 text-xs"></i>
                      High Yield Savings
                    </Link>
                    <Link
                      href="/alerts"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 rounded-lg transition-colors"
                    >
                      <i className="fa-solid fa-certificate text-primary-500 w-4 text-xs"></i>
                      Certificates
                    </Link>
                    <Link
                      href="/send-money"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 rounded-lg transition-colors"
                    >
                      <i className="fa-solid fa-vault text-primary-500 w-4 text-xs"></i>
                      Money Market
                    </Link>
                  </div>
                )}
              </div>

              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center px-4 py-3 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Login
              </Link>

              {/* Mobile Dark Mode Toggle */}
              <button
                onClick={toggleDarkMode}
                className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                {mounted && theme === "dark" ? (
                  <>
                    <i className="fa-solid fa-sun text-amber-500"></i>
                    Light Mode
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-moon text-indigo-500"></i>
                    Dark Mode
                  </>
                )}
              </button>

              {/* Mobile CTA */}
              <div className="pt-3 mt-3 border-t border-gray-100 dark:border-gray-800">
                <Link
                  href="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center w-full px-6 py-3 bg-accent hover:bg-accent-600 text-accent-foreground font-semibold text-sm rounded-full transition-colors"
                >
                  Open An Account
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Mobile Fixed Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 flex lg:hidden">
        <Link
          href="/login"
          className="flex-1 px-6 py-3 bg-white dark:bg-gray-800 text-primary-600 dark:text-primary-400 font-semibold shadow-top text-center text-sm border-t border-gray-200 dark:border-gray-700"
        >
          <i className="fa-solid fa-sign-in-alt mr-2"></i>
          Login
        </Link>
        <Link
          href="/signup"
          className="flex-1 px-6 py-3 bg-accent text-accent-foreground font-semibold shadow-top text-center text-sm"
        >
          <i className="fa-solid fa-user-plus mr-2"></i>
          Register
        </Link>
      </div>
    </>
  );
}
