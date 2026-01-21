import { cn } from "@/lib/utils";

interface AppTabsProps {
    tabs: { label: string; value: string; icon?: React.ReactNode }[];
    activeTab: string;
    onChange: (value: string) => void;
    className?: string;
}

export function AppTabs({ tabs, activeTab, onChange, className }: AppTabsProps) {
    return (
        <div className={cn("inline-flex items-center justify-center rounded-lg bg-gray-100 p-1 text-gray-500", className)}>
            {tabs.map((tab) => {
                const isActive = activeTab === tab.value;
                return (
                    <button
                        key={tab.value}
                        onClick={() => onChange(tab.value)}
                        className={cn(
                            "flex items-center justify-center gap-2 rounded-md px-6 py-2 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
                            isActive
                                ? "bg-white text-gray-900 shadow-sm"
                                : "text-gray-500 hover:text-gray-900 hover:bg-gray-200/50"
                        )}
                    >
                        {tab.icon && <span className={isActive ? "text-gray-900" : "text-gray-500"}>{tab.icon}</span>}
                        {tab.label}
                    </button>
                );
            })}
        </div>
    );
}
