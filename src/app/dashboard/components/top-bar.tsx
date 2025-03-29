"use client";

import { Sun, Moon, LogOut, Settings, User, Sun as SunIcon, Moon as MoonIcon, Sunrise, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { useUser, useClerk } from "@clerk/nextjs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";

const quotes = [
  "Turn your meetings into actionable insights",
  "Where conversations become innovations",
  "Transforming discussions into results",
  "Making every meeting count",
  "Capture the moments that matter",
  "Your meetings, smarter and more productive",
];

function DigitalClock() {
  const [time, setTime] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes().toString().padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const displayHours = (hours % 12 || 12).toString().padStart(2, '0');
      setTime(`${displayHours}:${minutes} ${ampm}`);
    };

    // Update immediately
    updateTime();

    // Update every minute
    const interval = setInterval(updateTime, 60000);

    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-primary/10 font-mono text-lg font-medium"
    >
      <Clock className="h-4 w-4" />
      <span>{time}</span>
    </motion.div>
  );
}

export function TopBar() {
  const { theme, setTheme } = useTheme();
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();
  const [greeting, setGreeting] = useState("");
  const [quote, setQuote] = useState("");

  useEffect(() => {
    // Set greeting based on time of day
    const hour = new Date().getHours();
    if (hour < 12) {
      setGreeting("Good morning");
    } else if (hour < 17) {
      setGreeting("Good afternoon");
    } else {
      setGreeting("Good evening");
    }

    // Set random quote
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    setQuote(randomQuote);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  // Get appropriate icon based on time
  const getTimeIcon = () => {
    const hour = new Date().getHours();
    if (hour < 12) {
      return <Sunrise className="h-6 w-6 text-yellow-500" />;
    } else if (hour < 17) {
      return <SunIcon className="h-6 w-6 text-orange-500" />;
    } else {
      return <MoonIcon className="h-6 w-6 text-blue-500" />;
    }
  };

  return (
    <div className="border-b bg-card">
      <div className="flex h-16 items-center px-4">
        {/* Welcome Message */}
        <div className="flex-1 flex items-center">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-4"
          >
            <motion.div
              whileHover={{ rotate: 15, scale: 1.1 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="text-primary"
            >
              {getTimeIcon()}
            </motion.div>
            <div className="flex flex-col">
              <motion.span 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="text-base font-medium"
              >
                {greeting}, {user?.firstName || user?.username || 'there'}
              </motion.span>
              <motion.span 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="text-sm text-muted-foreground font-normal tracking-wide"
              >
                {quote}
              </motion.span>
            </div>
          </motion.div>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-4">
          {/* Digital Clock */}
          <DigitalClock />

          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-2">
                {user?.imageUrl ? (
                  <Image 
                    src={user.imageUrl} 
                    alt="Profile" 
                    className="h-6 w-6 rounded-full bg-muted object-cover" 
                    width={24}
                    height={24}
                  />
                ) : (
                  <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                )}
                <span className="hidden sm:inline-block">
                  {user?.fullName || user?.firstName || user?.username || 'Anonymous User'}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push("/dashboard?tab=settings")}>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
} 