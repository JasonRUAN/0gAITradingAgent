'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ConnectKitButton } from 'connectkit';
import { motion } from 'framer-motion';
import {
  Bot,
  BarChart3,
  History,
  Wallet,
  Menu,
  X,
  Zap,
  Trophy,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', label: 'Arena', icon: Trophy },
  { href: '/arena', label: 'Agents', icon: Bot },
  { href: '/trade', label: 'Trade', icon: Zap },
  { href: '/history', label: 'History', icon: History },
  { href: '/my-agents', label: 'My Agents', icon: Wallet },
];

export function Header() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-strong">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
              <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600">
                <Bot className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-bold gradient-text">AI Trading Arena</h1>
              <p className="text-xs text-muted-foreground">Powered by 0G</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'text-white'
                      : 'text-muted-foreground hover:text-white hover:bg-white/5'
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeNav"
                      className="absolute inset-0 rounded-lg bg-gradient-to-r from-indigo-500/20 to-purple-500/20 neon-border"
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <Icon className={cn('h-4 w-4 relative z-10', isActive && 'text-indigo-400')} />
                  <span className="relative z-10">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Section */}
          <div className="flex items-center gap-4">
            {/* Network Status */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              <div className="h-2 w-2 rounded-full bg-emerald-500 pulse-live" />
              <span className="text-xs font-medium text-emerald-400">0G Testnet</span>
            </div>

            {/* Wallet Connect */}
            <ConnectKitButton.Custom>
              {({ isConnected, show, truncatedAddress, ensName }) => (
                <button
                  onClick={show}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200',
                    isConnected
                      ? 'bg-card border border-border hover:border-indigo-500/50'
                      : 'gradient-primary text-white hover:opacity-90'
                  )}
                >
                  <Wallet className="h-4 w-4" />
                  {isConnected ? (
                    <span>{ensName || truncatedAddress}</span>
                  ) : (
                    <span>Connect Wallet</span>
                  )}
                </button>
              )}
            </ConnectKitButton.Custom>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden flex items-center justify-center h-10 w-10 rounded-lg bg-card border border-border"
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="md:hidden absolute top-16 left-0 right-0 glass-strong border-t border-border"
        >
          <nav className="flex flex-col p-4 gap-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all',
                    isActive
                      ? 'bg-gradient-to-r from-indigo-500/20 to-purple-500/20 text-white neon-border'
                      : 'text-muted-foreground hover:text-white hover:bg-white/5'
                  )}
                >
                  <Icon className={cn('h-5 w-5', isActive && 'text-indigo-400')} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </motion.div>
      )}
    </header>
  );
}
