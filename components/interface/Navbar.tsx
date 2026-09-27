"use client";

import { User } from "firebase/auth";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { UserCircle, CarTaxiFront } from "lucide-react";
import { useState } from "react";

interface NavbarProps {
  user: User | null;
  onLogout: () => void;
  actions?: React.ReactNode;
}

export default function Navbar({ user, onLogout, actions }: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  const initials = user?.displayName
    ? user.displayName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : user?.email?.[0]?.toUpperCase() ?? "?";

  const displayName = user?.displayName || user?.email || "Usuario";

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md dark:bg-zinc-950/80">
      <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-4 md:px-8">
        {/* Logo */}
        <button
          onClick={() => window.location.reload()}
          className="flex items-center gap-2 text-xl font-bold tracking-tight hover:opacity-80 transition-opacity"
        >
          <CarTaxiFront className="w-6 h-6 text-yellow-500" />
          TaxiFinanzas
        </button>

        {/* Avatar */}
        <Popover key="navbar-menu" open={menuOpen} onOpenChange={setMenuOpen}>
          <PopoverTrigger
            render={
              <button className="flex items-center justify-center w-9 h-9 rounded-full bg-zinc-900 text-zinc-50 dark:bg-zinc-100 dark:text-zinc-900 text-sm font-semibold hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:ring-offset-2" />
            }
          >
            {user?.photoURL ? (
              <img
                src={user.photoURL}
                alt="Avatar"
                className="w-9 h-9 rounded-full object-cover"
              />
            ) : (
              initials
            )}
          </PopoverTrigger>
          <PopoverContent
            className="w-56 p-0"
            align="end"
            sideOffset={8}
          >
            <div className="p-3">
              <p className="text-sm font-medium truncate">{displayName}</p>
              {user?.email && user.displayName && (
                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
              )}
            </div>
            <Separator />
            <div className="p-2 flex flex-col gap-1">
              {actions}
            </div>
            <Separator />
            <div className="p-2">
              <Button
                variant="destructive"
                className="w-full"
                onClick={() => {
                  setMenuOpen(false);
                  onLogout();
                }}
              >
                Cerrar sesión
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </nav>
  );
}
