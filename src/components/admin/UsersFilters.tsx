"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Filter, X, Shield, User } from "lucide-react";

export default function UsersFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [role, setRole] = useState(searchParams.get("role") || "all");
  const [status, setStatus] = useState(searchParams.get("status") || "all");

  const handleFilter = () => {
    const params = new URLSearchParams();
    
    if (search) params.set("search", search);
    if (role && role !== "all") params.set("role", role);
    if (status && status !== "all") params.set("status", status);
    
    const queryString = params.toString();
    router.push(queryString ? `/admin/users?${queryString}` : "/admin/users");
  };

  const clearFilters = () => {
    setSearch("");
    setRole("all");
    setStatus("all");
    router.push("/admin/users");
  };

  const hasActiveFilters = search || (role && role !== "all") || (status && status !== "all");

  return (
    <Card className="border-border overflow-hidden">
      <CardContent className="p-4">
        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-3">
          {/* Filter Label */}
          <div className="flex items-center gap-2 lg:min-w-[140px]">
            <div className="bg-primary/10 p-1.5 rounded-md border border-primary/20">
              <Filter className="h-4 w-4 text-primary" />
            </div>
            <span className="text-sm font-semibold text-foreground">Filter & Search</span>
          </div>

          {/* Filter Inputs - Horizontal Layout */}
          <div className="flex-1 w-full">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              {/* Search */}
              <div className="relative group">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                  placeholder="Search users..."
                  className="pl-8 h-9 text-sm border-border focus:border-primary transition-colors"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleFilter()}
                />
              </div>

              {/* Role Filter */}
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger className="h-9 text-sm border-border focus:border-primary transition-colors">
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="Admin">
                    <div className="flex items-center gap-2">
                      <Shield className="h-3.5 w-3.5 text-red-500" />
                      Admin
                    </div>
                  </SelectItem>
                  <SelectItem value="User">
                    <div className="flex items-center gap-2">
                      <User className="h-3.5 w-3.5 text-blue-500" />
                      User
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>

              {/* Status Filter */}
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="h-9 text-sm border-border focus:border-primary transition-colors">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-green-500" />
                      Active
                    </div>
                  </SelectItem>
                  <SelectItem value="inactive">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-gray-400" />
                      Inactive
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <Button
              onClick={handleFilter}
              size="sm"
              className="h-9 gap-1.5 bg-primary hover:bg-primary/90 transition-all hover:shadow-md"
            >
              <Filter className="h-3.5 w-3.5" />
              Apply
            </Button>

            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="h-9 gap-1.5 hover:bg-destructive/10 hover:text-destructive transition-all"
              >
                <X className="h-3.5 w-3.5" />
                Clear
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
