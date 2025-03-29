"use client";

import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  FileAudio,
  CheckSquare,
  Settings,
  BarChart2,
} from "lucide-react";
import { useUser, UserButton } from "@clerk/nextjs";

export type TabType = "overview" | "meetings" | "tasks" | "settings";

const navigation = [
  { name: "Overview", tab: "overview" as TabType, icon: BarChart2 },
  { name: "Meetings", tab: "meetings" as TabType, icon: FileAudio },
  { name: "Tasks", tab: "tasks" as TabType, icon: CheckSquare },
  { name: "Settings", tab: "settings" as TabType, icon: Settings },
];

interface SidebarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const { user, isLoaded } = useUser();

  return (
    <div className="flex h-screen w-64 flex-col border-r bg-card px-3 py-4">
      {/* Logo */}
      <div className="flex items-center px-3 py-4">
        <span className="text-xl font-bold">IRIS</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-2">
        {navigation.map((item) => {
          const isActive = activeTab === item.tab;
          return (
            <button
              key={item.name}
              onClick={() => onTabChange(item.tab)}
              className={cn(
                "group flex w-full items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <item.icon className="mr-3 h-5 w-5" />
              {item.name}
            </button>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className="mt-auto border-t px-3 py-4">
        <div className="flex items-center gap-3">
          <UserButton afterSignOutUrl="/" />
          <div className="flex flex-col">
            <span className="text-sm font-medium">
              {user?.fullName || user?.firstName || user?.username || 'Anonymous User'}
            </span>
            <span className="text-xs text-muted-foreground">
              {user?.primaryEmailAddress?.emailAddress || ''}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
} 