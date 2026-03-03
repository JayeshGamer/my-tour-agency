"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, User, LogOut, Search, Settings, FileText, Compass } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useSession, signOut } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { RainbowButton } from "@/components/ui/rainbow-button";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { data: session, isPending } = useSession();

  const handleSignOut = async () => {
    await signOut();
    window.location.href = "/";
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[color:var(--card)] border-b border-gray-200 dark:border-gray-800 shadow-lg backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <Compass className="h-8 w-8 text-[color:var(--primary)] dark:text-[color:var(--primary)] group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-all group-hover:rotate-12 duration-300" />
              <div className="absolute inset-0 blur-lg bg-[color:var(--primary)]/20 dark:bg-[color:var(--primary)]/20 group-hover:bg-[color:var(--primary)]/30 dark:group-hover:bg-[color:var(--primary)]/30 transition-all" />
            </div>
            <span className="text-2xl font-bold text-[color:var(--primary)]">TravelCo</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-2">
            <Link
              href="/"
              className={cn(
                buttonVariants({ variant: "ghost", size: "default" }),
                "h-10 px-4 text-sm font-medium border border-gray-300 dark:border-gray-700 hover:border-[color:var(--primary)] dark:hover:border-gray-500 rounded-md transition-all"
              )}
            >
              Home
            </Link>
            <Link
              href="/tours"
              className={cn(
                buttonVariants({ variant: "ghost", size: "default" }),
                "h-10 px-4 text-sm font-medium border border-gray-300 dark:border-gray-700 hover:border-[color:var(--primary)] dark:hover:border-gray-500 rounded-md transition-all"
              )}
            >
              Tours
            </Link>
            <Link
              href="/destinations"
              className={cn(
                buttonVariants({ variant: "ghost", size: "default" }),
                "h-10 px-4 text-sm font-medium border border-gray-300 dark:border-gray-700 hover:border-[color:var(--primary)] dark:hover:border-gray-500 rounded-md transition-all"
              )}
            >
              Destinations
            </Link>
            <Link
              href="/deals"
              className={cn(
                buttonVariants({ variant: "ghost", size: "default" }),
                "h-10 px-4 text-sm font-medium border border-gray-300 dark:border-gray-700 hover:border-[color:var(--primary)] dark:hover:border-gray-500 rounded-md transition-all"
              )}
            >
              Deals
            </Link>
            <Link
              href="/about"
              className={cn(
                buttonVariants({ variant: "ghost", size: "default" }),
                "h-10 px-4 text-sm font-medium border border-gray-300 dark:border-gray-700 hover:border-[color:var(--primary)] dark:hover:border-gray-500 rounded-md transition-all"
              )}
            >
              About
            </Link>
            <Link
              href="/contact"
              className={cn(
                buttonVariants({ variant: "ghost", size: "default" }),
                "h-10 px-4 text-sm font-medium border border-gray-300 dark:border-gray-700 hover:border-[color:var(--primary)] dark:hover:border-gray-500 rounded-md transition-all"
              )}
            >
              Contact
            </Link>
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-3">
            {/* Search */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="hidden sm:inline-flex h-10 w-10 text-[color:var(--primary)] hover:bg-gray-100 dark:hover:bg-gray-800">
                  <Search className="h-5 w-5" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-4 bg-[color:var(--card)] border-gray-200 dark:border-gray-800">
                <div className="space-y-4">
                  <h4 className="font-medium text-[color:var(--primary)]">Search Tours</h4>
                  <Input
                    placeholder="Search destinations, activities..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-[#0a0f1a] border-gray-300 dark:border-gray-700 text-[color:var(--primary)]"
                  />
                  <div className="flex justify-end">
                    <Link
                      href={`/tours?search=${encodeURIComponent(searchQuery)}`}
                      className={cn(
                        buttonVariants({ size: "sm" }),
                        "bg-[color:var(--primary)] dark:bg-[color:var(--primary-foreground)] text-[color:var(--primary-foreground)] dark:text-[color:var(--primary)] hover:bg-gray-800 dark:hover:bg-gray-100"
                      )}
                    >
                      Search
                    </Link>
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            {/* User Authentication */}
            {!isPending && (
              <>
                {session?.user ? (
                  <>
                    {/* User Profile Dropdown */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 ring-2 ring-gray-300 dark:ring-gray-700 hover:ring-[color:var(--primary)] dark:hover:ring-white transition-all">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={session.user.image || ""} alt={session.user.name || ""} />
                            <AvatarFallback className="bg-[color:var(--primary)] text-[color:var(--primary-foreground)] font-bold">
                              {session.user.name?.charAt(0).toUpperCase() || "U"}
                            </AvatarFallback>
                          </Avatar>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-56 bg-[color:var(--card)] border-gray-200 dark:border-gray-800" align="end" forceMount>
                        <DropdownMenuLabel className="font-normal">
                          <div className="flex flex-col space-y-1">
                            <p className="text-sm font-medium leading-none text-[color:var(--primary)]">{session.user.name}</p>
                            <p className="text-xs leading-none text-gray-600 dark:text-gray-400">
                              {session.user.email}
                            </p>
                          </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-800" />
                        {(session.user as any).role === 'Admin' && (
                          <>
                            <DropdownMenuItem className="text-[color:var(--primary)] focus:bg-gray-100 dark:focus:bg-gray-800 focus:text-[color:var(--primary)] dark:focus:text-[color:var(--primary)]">
                              <Link href="/admin" className="flex items-center w-full">
                                <Settings className="mr-2 h-4 w-4" />
                                Dashboard
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-800" />
                          </>
                        )}
                        <DropdownMenuItem className="text-[color:var(--primary)] focus:bg-gray-100 dark:focus:bg-gray-800 focus:text-[color:var(--primary)] dark:focus:text-[color:var(--primary)]">
                          <Link href="/profile" className="flex items-center w-full">
                            <User className="mr-2 h-4 w-4" />
                            Profile
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-[color:var(--primary)] focus:bg-gray-100 dark:focus:bg-gray-800 focus:text-[color:var(--primary)] dark:focus:text-[color:var(--primary)]">
                          <Link href="/my-requests" className="flex items-center w-full">
                            <FileText className="mr-2 h-4 w-4" />
                            My Requests
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-[color:var(--primary)] focus:bg-gray-100 dark:focus:bg-gray-800 focus:text-[color:var(--primary)] dark:focus:text-[color:var(--primary)]">
                          <Link href="/bookings" className="flex items-center w-full">
                            <User className="mr-2 h-4 w-4" />
                            My Bookings
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-800" />
                        <DropdownMenuItem onClick={handleSignOut} className="text-red-600 dark:text-red-400 focus:bg-red-50 dark:focus:bg-red-900/30 focus:text-red-600 dark:focus:text-red-400">
                          <LogOut className="mr-2 h-4 w-4" />
                          Sign out
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </>
                ) : (
                  <>
                    <RainbowButton asChild variant="white" className="h-10 px-6">
                      <Link href="/login">Log In</Link>
                    </RainbowButton>
                    <RainbowButton asChild variant="black" className="h-10 px-6">
                      <Link href="/signup">Sign Up</Link>
                    </RainbowButton>
                  </>
                )}
              </>
            )}

            {/* Mobile Menu */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden h-10 w-10 text-[color:var(--primary)] hover:bg-gray-100 dark:hover:bg-gray-800">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="bg-[color:var(--card)] border-gray-200 dark:border-gray-800">
                <SheetHeader>
                  <SheetTitle className="text-[color:var(--primary)]">Menu</SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col space-y-4 mt-6">
                  <Link href="/" className="text-lg font-medium text-[color:var(--primary)] hover:text-gray-700 dark:hover:text-gray-300">
                    Home
                  </Link>
                  <Link href="/tours" className="text-lg font-medium text-[color:var(--primary)] hover:text-gray-700 dark:hover:text-gray-300">
                    Tours
                  </Link>
                  <Link href="/destinations" className="text-lg font-medium text-[color:var(--primary)] hover:text-gray-700 dark:hover:text-gray-300">
                    Destinations
                  </Link>
                  <Link href="/deals" className="text-lg font-medium text-[color:var(--primary)] hover:text-gray-700 dark:hover:text-gray-300">
                    Deals
                  </Link>
                  <Link href="/about" className="text-lg font-medium text-[color:var(--primary)] hover:text-gray-700 dark:hover:text-gray-300">
                    About Us
                  </Link>
                  <Link href="/contact" className="text-lg font-medium text-[color:var(--primary)] hover:text-gray-700 dark:hover:text-gray-300">
                    Contact
                  </Link>
                  <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
                    {session?.user ? (
                      <div className="space-y-4">
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={session.user.image || ""} alt={session.user.name || ""} />
                            <AvatarFallback className="bg-[color:var(--primary)] text-[color:var(--primary-foreground)] font-bold">
                              {session.user.name?.charAt(0).toUpperCase() || "U"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium text-[color:var(--primary)]">{session.user.name}</p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">{session.user.email}</p>
                          </div>
                        </div>
                        {(session.user as any).role === 'Admin' && (
                          <Link href="/admin" className="block text-sm text-[color:var(--primary)] hover:text-gray-700 dark:hover:text-gray-300">
                            <Settings className="inline mr-2 h-4 w-4" />
                            Dashboard
                          </Link>
                        )}
                        <Link href="/profile" className="block text-sm text-[color:var(--primary)] hover:text-gray-700 dark:hover:text-gray-300">
                          Profile
                        </Link>
                        <Link href="/my-requests" className="block text-sm text-[color:var(--primary)] hover:text-gray-700 dark:hover:text-gray-300">
                          My Requests
                        </Link>
                        <Link href="/bookings" className="block text-sm text-[color:var(--primary)] hover:text-gray-700 dark:hover:text-gray-300">
                          My Bookings
                        </Link>
                        <Button variant="outline" className="w-full bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-700 text-[color:var(--primary)] dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800" onClick={handleSignOut}>
                          <LogOut className="mr-2 h-4 w-4" />
                          Sign out
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <RainbowButton asChild variant="white" className="w-full h-10">
                          <Link href="/login">Log In</Link>
                        </RainbowButton>
                        <RainbowButton asChild variant="black" className="w-full h-10">
                          <Link href="/signup">Sign Up</Link>
                        </RainbowButton>
                      </div>
                    )}
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
