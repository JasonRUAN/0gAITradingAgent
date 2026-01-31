'use client';

import Link from 'next/link';
import { Github, Twitter, FileText, ExternalLink } from 'lucide-react';

const footerLinks = {
  product: [
    { label: 'Arena', href: '/' },
    { label: 'Agents', href: '/arena' },
    { label: 'Trade', href: '/trade' },
    { label: 'Documentation', href: '/docs' },
  ],
  resources: [
    { label: '0G Docs', href: 'https://docs.0g.ai', external: true },
    { label: '0G Chain Scan', href: 'https://chainscan-galileo.0g.ai', external: true },
    { label: 'Faucet', href: 'https://faucet.0g.ai', external: true },
  ],
  community: [
    { label: 'Discord', href: 'https://discord.gg/0gLabs', external: true },
    { label: 'Twitter', href: 'https://twitter.com/0aboratory', external: true },
    { label: 'GitHub', href: 'https://github.com/0gfoundation', external: true },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-border bg-card/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">AI</span>
              </div>
              <span className="font-bold text-lg">Trading Arena</span>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              去中心化 AI 交易竞技场，让 AI 交易告别黑盒，实现全链路透明可验证。
            </p>
            <div className="flex items-center gap-3">
              <a
                href="https://github.com/0gfoundation"
                target="_blank"
                rel="noopener noreferrer"
                className="h-9 w-9 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground hover:text-white hover:bg-secondary/80 transition-colors"
              >
                <Github className="h-4 w-4" />
              </a>
              <a
                href="https://twitter.com/0gLabs"
                target="_blank"
                rel="noopener noreferrer"
                className="h-9 w-9 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground hover:text-white hover:bg-secondary/80 transition-colors"
              >
                <Twitter className="h-4 w-4" />
              </a>
              <a
                href="https://docs.0g.ai"
                target="_blank"
                rel="noopener noreferrer"
                className="h-9 w-9 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground hover:text-white hover:bg-secondary/80 transition-colors"
              >
                <FileText className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="font-semibold mb-4">Product</h4>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Links */}
          <div>
            <h4 className="font-semibold mb-4">Resources</h4>
            <ul className="space-y-3">
              {footerLinks.resources.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-muted-foreground hover:text-white transition-colors inline-flex items-center gap-1"
                  >
                    {link.label}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Community Links */}
          <div>
            <h4 className="font-semibold mb-4">Community</h4>
            <ul className="space-y-3">
              {footerLinks.community.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-muted-foreground hover:text-white transition-colors inline-flex items-center gap-1"
                  >
                    {link.label}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="py-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} AI Trading Arena. Built on{' '}
            <a
              href="https://0g.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-400 hover:text-indigo-300"
            >
              0G
            </a>
          </p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className="h-2 w-2 rounded-full bg-emerald-500 pulse-live" />
            <span>All systems operational</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
