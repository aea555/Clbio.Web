"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface SettingsTabsProps {
  workspaceId: string;
}

export function SettingsTabs({ workspaceId }: SettingsTabsProps) {
  const pathname = usePathname();
  const baseUrl = `/dashboard/workspaces/${workspaceId}/settings`;

  const tabs = [
    { name: "General", href: baseUrl },
    { name: "Members", href: `${baseUrl}/members` },
    { name: "Audit Logs", href: `${baseUrl}/audit-logs` },
  ];

  return (
    <div className="border-b border-[#e8edf3] dark:border-[#2d3a4a] mb-8">
      <nav className="-mb-px flex space-x-8">
        {tabs.map((tab) => {
          // Exact match for root "General" tab, startsWith for others
          const isActive = tab.href === baseUrl 
            ? pathname === baseUrl 
            : pathname.startsWith(tab.href);

          return (
            <Link
              key={tab.name}
              href={tab.href}
              className={`
                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors
                ${isActive 
                  /* FIX: Dynamic Primary Border and Text */
                  ? "border-primary text-primary" 
                  : "border-transparent text-[#507395] dark:text-[#94a3b8] hover:text-[#0e141b] dark:hover:text-[#e8edf3] hover:border-gray-300"}
              `}
            >
              {tab.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}