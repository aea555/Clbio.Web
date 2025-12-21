import { cn } from "@/lib/utils";

export function PasswordRequirements({ value }: { value: string }) {
  if (!value) return null; // Don't show if input is empty

  const requirements = [
    { label: "At least 6 characters", met: value.length >= 6 },
    { label: "At least one uppercase letter", met: /[A-Z]/.test(value) },
    { label: "At least one lowercase letter", met: /[a-z]/.test(value) },
    { label: "At least one number", met: /\d/.test(value) },
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