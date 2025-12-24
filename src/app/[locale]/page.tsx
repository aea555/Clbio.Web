"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";

export default function LandingPage() {
  const t = useTranslations("Landing");

  return (
    <div className="min-h-screen bg-background flex flex-col selection:bg-primary selection:text-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-border-base bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 text-primary">
            <span className="material-symbols-outlined text-3xl fill-1">grid_view</span>
            <span className="text-xl font-black tracking-tighter text-foreground uppercase">Clbio</span>
          </div>
          
          <div className="flex items-center gap-4">
            <Link href="/auth/login" className="text-sm font-bold text-muted-foreground hover:text-foreground transition-colors px-4 py-2">
              {t("nav.sign_in")}
            </Link>
            <Link href="/auth/register" className="bg-primary text-white text-sm font-bold px-5 py-2.5 rounded-xl hover:opacity-90 transition-all shadow-lg shadow-primary/20">
              {t("nav.get_started")}
            </Link>
          </div>
        </div>
      </nav>

      <main className="flex-1 pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-6">
          
          {/* Hero Section */}
          <div className="max-w-4xl mb-24">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-light border border-primary/10 text-primary text-xs font-bold uppercase tracking-widest mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              {t("hero.badge")}
            </div>
            
            <h1 className="text-5xl md:text-7xl font-black text-foreground tracking-tightest leading-[1.1] mb-8">
              {t("hero.title_part1")} <br /> 
              <span className="text-primary italic">{t("hero.title_part2")}</span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-10 max-w-2xl">
              {t("hero.description")}
            </p>

            {/* Source Code Links */}
            <div className="flex flex-wrap gap-4 mb-12">
              <Link href="/auth/login" className="flex items-center justify-center gap-2 bg-primary text-white px-8 py-4 rounded-2xl font-bold text-lg hover:opacity-90 transition-all shadow-lg shadow-primary/25 group">
                {t("hero.live_demo")}
                <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
              </Link>
              
              <a href="https://github.com/aea555/Clbio.Web/tree/dev" target="_blank" className="flex items-center justify-center gap-3 border border-border-base bg-card px-6 py-4 rounded-2xl font-bold text-lg hover:bg-background transition-all group">
                 <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                 {t("hero.frontend_code")}
              </a>

              <a href="https://github.com/aea555/Clbio.Backend/tree/dev" target="_blank" className="flex items-center justify-center gap-3 border border-border-base bg-card px-6 py-4 rounded-2xl font-bold text-lg hover:bg-background transition-all group">
                 <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                 {t("hero.backend_code")}
              </a>
            </div>
          </div>

          {/* Core Technical Pillar Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-32">
            {[
              { icon: "hub", title: t("features.signalr.title"), desc: t("features.signalr.desc") },
              { icon: "layers", title: t("features.architecture.title"), desc: t("features.architecture.desc") },
              { icon: "security", title: t("features.security.title"), desc: t("features.security.desc") },
            ].map((feature, i) => (
              <div key={i} className="group p-8 rounded-3xl border border-border-base bg-card hover:border-primary/30 transition-all">
                <div className="w-12 h-12 rounded-xl bg-background border border-border-base flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined">{feature.icon}</span>
                </div>
                <h4 className="text-xl font-bold text-foreground mb-3">{feature.title}</h4>
                <p className="text-muted-foreground leading-relaxed text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>

          {/* Portfolio Disclaimer Card */}
          <div className="bg-primary/5 border border-primary/10 rounded-3xl p-8 mb-32 flex flex-col md:flex-row items-center gap-8">
            <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center text-white shrink-0">
              <span className="material-symbols-outlined text-3xl">terminal</span>
            </div>
            <div>
              <h3 className="text-xl font-bold text-foreground mb-1">{t("portfolio_note.title")}</h3>
              <p className="text-muted-foreground text-sm">
                {t("portfolio_note.desc")}
              </p>
            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border-base bg-card py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <div>
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <span className="material-symbols-outlined text-2xl fill-1">grid_view</span>
              <span className="text-lg font-black uppercase tracking-tighter">Clbio</span>
            </div>
            <p className="text-xs text-muted-foreground">{t("footer.copy")}</p>
          </div>

          <div className="flex items-center gap-8">
            <a href="https://github.com/aea555" target="_blank" className="flex items-center gap-2 text-foreground font-bold hover:text-primary transition-colors">
              <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
              GitHub
            </a>
            <a href="https://www.linkedin.com/in/aea555/" target="_blank" className="flex items-center gap-2 text-foreground font-bold hover:text-primary transition-colors">
              <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
              LinkedIn
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}