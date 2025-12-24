"use client";

import Link from "next/link";
import { useTranslations } from "next-intl"; ///dashboard/settings/page.tsx]

export default function SettingsHubPage() {
  const t = useTranslations("SettingsHub"); ///dashboard/settings/page.tsx]

  const settingsMenu = [
    {
      title: t("menu.account.title"),
      description: t("menu.account.description"),
      href: "/dashboard/settings/account",
      icon: "person",
    },
    {
      title: t("menu.appearance.title"),
      description: t("menu.appearance.description"),
      href: "/dashboard/settings/theme",
      icon: "palette",
    },
    {
      title: t("menu.notifications.title"),
      description: t("menu.notifications.description"),
      href: "/dashboard/settings/notifications", 
      icon: "notifications",
    },
  ];

  return (
    <div className="max-w-4xl mx-auto w-full py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#0e141b] dark:text-[#e8edf3]">{t("title")}</h1>
        <p className="text-[#507395] dark:text-[#94a3b8] mt-1">
          {t("subtitle")}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {settingsMenu.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="group flex items-start gap-4 p-6 bg-white dark:bg-[#1a2430] rounded-xl border border-[#e8edf3] dark:border-[#2d3a4a] hover:border-primary/50 hover:shadow-md transition-all duration-200 hover:cursor-pointer"
          >
            <div className="w-12 h-12 rounded-full bg-primary-light flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-primary text-[24px]">
                {item.icon}
              </span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-[#0e141b] dark:text-[#e8edf3] group-hover:text-primary transition-colors">
                {item.title}
              </h3>
              <p className="text-sm text-[#507395] dark:text-[#94a3b8] mt-1 leading-relaxed">
                {item.description}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}