"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

const navLinks: { label: string; href: string; badge?: string }[] = [
  { label: "Atölyeler",   href: "/atolyeler" },
  { label: "İçerikler",   href: "/icerikler" },
  { label: "Testler",     href: "/testler" },
  { label: "Etkinlikler", href: "#etkinlikler" },
  { label: "Harita",      href: "/harita",     badge: "Yeni" },
  { label: "Hakkımızda",  href: "/hakkimizda" },
];

function getInitials(email: string) {
  return email.slice(0, 2).toUpperCase();
}

export default function Navbar() {
  const [scrolled,  setScrolled]  = useState(false);
  const [menuOpen,  setMenuOpen]  = useState(false);
  const [logoError, setLogoError] = useState(false);
  const [user,      setUser]      = useState<User | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const supabase = createClient();
    // İlk session kontrolü
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
    });
    // Auth değişikliklerini dinle
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/95 backdrop-blur-md shadow-sm shadow-warm-900/5"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">

        {/* Logo */}
        <a href="/" className="flex items-center opacity-90 hover:opacity-100 transition-opacity">
          {logoError ? (
            <span className="text-xl font-bold tracking-tight text-warm-900">klemens</span>
          ) : (
            <Image
              src="/logos/logo-wide-dark.PNG"
              alt="Klemens"
              width={160}
              height={48}
              priority
              onError={() => setLogoError(true)}
            />
          )}
        </a>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-sm font-medium text-warm-900/60 hover:text-warm-900 transition-colors flex items-center gap-1.5"
            >
              {link.label}
              {link.badge && (
                <span className="px-1.5 py-0.5 text-[9px] font-bold bg-coral text-white rounded-full animate-pulse leading-none">
                  {link.badge}
                </span>
              )}
            </a>
          ))}
        </div>

        {/* Desktop right side: auth + CTA */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            /* Giriş yapılmış → avatar */
            <Link
              href="/club/profil"
              title={user.email}
              className="w-9 h-9 rounded-full bg-coral flex items-center justify-center text-white text-xs font-bold hover:opacity-85 active:scale-95 transition-all duration-150"
            >
              {getInitials(user.email ?? "KL")}
            </Link>
          ) : (
            /* Giriş yapılmamış → link */
            <Link
              href="/club/giris"
              className="text-sm font-medium text-warm-900/60 hover:text-warm-900 transition-colors"
            >
              Giriş Yap
            </Link>
          )}

          <a
            href="#bulten"
            className="inline-flex items-center px-5 py-2 bg-coral text-white text-sm font-semibold rounded-full hover:opacity-90 active:scale-95 transition-all duration-150"
          >
            Bültene Katıl
          </a>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 -mr-2 text-warm-900"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Menüyü aç"
        >
          {menuOpen ? (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          ) : (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-warm-200 px-6 py-5 flex flex-col gap-4">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-sm font-medium text-warm-900/70 py-1 flex items-center gap-1.5"
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
              {link.badge && (
                <span className="px-1.5 py-0.5 text-[9px] font-bold bg-coral text-white rounded-full animate-pulse leading-none">
                  {link.badge}
                </span>
              )}
            </a>
          ))}

          {/* Mobile auth */}
          {user ? (
            <Link
              href="/club/profil"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-3 py-1"
            >
              <div className="w-8 h-8 rounded-full bg-coral flex items-center justify-center text-white text-xs font-bold">
                {getInitials(user.email ?? "KL")}
              </div>
              <span className="text-sm font-medium text-warm-900/70">{user.email}</span>
            </Link>
          ) : (
            <Link
              href="/club/giris"
              onClick={() => setMenuOpen(false)}
              className="text-sm font-medium text-warm-900/70 py-1"
            >
              Giriş Yap
            </Link>
          )}

          <a
            href="#bulten"
            className="mt-2 px-5 py-3 bg-coral text-white text-sm font-semibold rounded-full text-center"
            onClick={() => setMenuOpen(false)}
          >
            Bültene Katıl
          </a>
        </div>
      )}
    </nav>
  );
}
