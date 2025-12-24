"use client";

import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

export function PasswordRequirements({ value }: { value: string }) {
  const t = useTranslations("PasswordRequirements");

  if (!value) return null; 

  const requirements = [
    { label: t("length"), met: value.length >= 6 },
    { label: t("uppercase"), met: /[A-Z]/.test(value) },
    { label: t("lowercase"), met: /[a-z]/.test(value) },
    { label: t("number"), met: /\d/.test(value) },
  ];

  return (
    <div className="mt-2 space-y-1.5 px-1 animate-in fade-in slide-in-from-top-1 duration-200">
      {requirements.map((req, i) => (
        <div key={i} className="flex items-center gap-2 text-[11px]">
          <span className={cn(
            "size-1.5 rounded-full transition-colors",
            req.met ? "bg-green-500" : "bg-gray-300 dark:bg-gray-600"
          )} />
          <span className={req.met ? "text-green-600 dark:text-green-400 font-medium" : "text-[#507395]"}>
            {req.label}
          </span>
        </div>
      ))}
    </div>
  );
}