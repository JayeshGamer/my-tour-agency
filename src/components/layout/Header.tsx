"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, MapPin, User, LogOut, Search } from "lucide-react";
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

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { data: session, isPending } = useSession();


  const handleSignOut = async () => {
    await signOut();
    window.location.href = "/";
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-800 bg-black/95 backdrop-blur supports-[backdrop-filter]:bg-black/90">
      <div className="max-w-7xl mx-auto px-6 flex h-16 items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <MapPin className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold text-white">TravelAgency</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <Link href="/" className="text-sm font-medium text-white transition-colors hover:bg-gray-800 hover:text-white px-3 py-2 rounded-md">
            Home
          </Link>
          <Link href="/tours" className="text-sm font-medium text-white transition-colors hover:bg-gray-800 hover:text-white px-3 py-2 rounded-md">
            Tours
          </Link>
          <Link href="/deals" className="text-sm font-medium text-white transition-colors hover:bg-gray-800 hover:text-white px-3 py-2 rounded-md">
            Deals
          </Link>
          <Link href="/about" className="text-sm font-medium text-white transition-colors hover:bg-gray-800 hover:text-white px-3 py-2 rounded-md">
            About Us
          </Link>
          <Link href="/contact" className="text-sm font-medium text-white transition-colors hover:bg-gray-800 hover:text-white px-3 py-2 rounded-md">
            Contact
          </Link>
        </nav>

        {/* Right Side Actions */}
        <div className="flex items-center space-x-4">
          {/* Search */}
          <div className="hidden md:block">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="text-white hover:bg-gray-800 hover:text-white">
                  <Search className="h-5 w-5" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80" align="end">
                <div className="space-y-4">
                  <h4 className="font-medium">Search Tours</h4>
                  <Input
                    placeholder="Search destinations, activities..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full"
                  />
                  <div className="flex justify-end">
                    <Button size="sm" asChild>
                      <Link href={`/tours?search=${encodeURIComponent(searchQuery)}`}>
                        Search
                      </Link>
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* Auth Actions */}
          {!isPending && (
            <>
              {session?.user ? (
                <>
                  {/* User Profile Dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="relative h-8 w-8 rounded-full hover:bg-gray-800">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={session.user.image || ""} alt={session.user.name || ""} />
                          <AvatarFallback>
                            {session.user.name?.charAt(0).toUpperCase() || "U"}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end" forceMount>
                      <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-medium leading-none">{session.user.name}</p>
                          <p className="text-xs leading-none text-muted-foreground">
                            {session.user.email}
                          </p>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/profile">
                          <User className="mr-2 h-4 w-4" />
                          Profile
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/bookings">
                          <User className="mr-2 h-4 w-4" />
                          My Bookings
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleSignOut} className="text-red-600">
                        <LogOut className="mr-2 h-4 w-4" />
                        Sign out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <>
                  <Button variant="outline" className="bg-white text-black border-white hover:bg-gray-100 hover:text-black" asChild>
                    <Link href="/login">Log In</Link>
                  </Button>
                  <Button className="bg-white text-black hover:bg-gray-100 hover:text-black" asChild>
                    <Link href="/signup">Sign Up</Link>
                  </Button>
                </>
              )}
            </>
          )}
          
          {/* Mobile Menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" className="text-white hover:bg-gray-800 hover:text-white">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col space-y-4 mt-6">
                <Link href="/" className="text-lg font-medium text-gray-900 hover:text-primary">
                  Home
                </Link>
                <Link href="/tours" className="text-lg font-medium text-gray-900 hover:text-primary">
                  Tours
                </Link>
                <Link href="/deals" className="text-lg font-medium text-gray-900 hover:text-primary">
                  Deals
                </Link>
                <Link href="/about" className="text-lg font-medium text-gray-900 hover:text-primary">
                  About Us
                </Link>
                <Link href="/contact" className="text-lg font-medium text-gray-900 hover:text-primary">
                  Contact
                </Link>
                <div className="pt-4 border-t">
                  {session?.user ? (
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={session.user.image || ""} alt={session.user.name || ""} />
                          <AvatarFallback>
                            {session.user.name?.charAt(0).toUpperCase() || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{session.user.name}</p>
                          <p className="text-xs text-muted-foreground">{session.user.email}</p>
                        </div>
                      </div>
                      <Link href="/profile" className="block text-sm">
                        Profile
                      </Link>
                      <Link href="/bookings" className="block text-sm">
                        My Bookings
                      </Link>
                      <Button variant="outline" className="w-full" onClick={handleSignOut}>
                        <LogOut className="mr-2 h-4 w-4" />
                        Sign out
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Button variant="outline" className="w-full bg-white text-black border-gray-300 hover:bg-gray-100" asChild>
                        <Link href="/login">Log In</Link>
                      </Button>
                      <Button className="w-full bg-primary hover:bg-primary/90" asChild>
                        <Link href="/signup">Sign Up</Link>
                      </Button>
                    </div>
                  )}
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
