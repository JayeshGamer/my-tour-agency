"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  AlertTriangle,
  Search,
  RefreshCw,
  Download,
  MoreHorizontal,
  CheckCircle,
  Archive,
  Eye,
  XCircle
} from "lucide-react";

interface ErrorEntry {
  id: string;
  type: string;
  message: string;
  severity: "low" | "medium" | "high" | "critical";
  resolved: boolean;
  category: string;
  stack?: string;
  userId?: string;
  userEmail?: string;
  ipAddress?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  resolvedAt?: Date;
}

interface ErrorsListProps {
  errors: ErrorEntry[];
  onRefresh?: () => void;
}

const getSeverityBadge = (severity: string) => {
  const variants = {
    "low": { variant: "secondary" as const, color: "text-gray-600" },
    "medium": { variant: "default" as const, color: "text-blue-600" },
    "high": { variant: "destructive" as const, color: "text-orange-600" },
    "critical": { variant: "destructive" as const, color: "text-red-600" }
  };
  
  const config = variants[severity as keyof typeof variants] || variants.medium;
  
  return (
    <Badge variant={config.variant}>
      {severity.charAt(0).toUpperCase() + severity.slice(1)}
    </Badge>
  );
};

const getStatusBadge = (resolved: boolean) => {
  return (
    <Badge variant={resolved ? "default" : "secondary"}>
      {resolved ? "Resolved" : "Open"}
    </Badge>
  );
};

export default function ErrorsList({ errors, onRefresh }: ErrorsListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const filteredErrors = errors.filter(error => {
    const matchesSearch = !searchTerm || 
      error.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      error.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      error.userEmail?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSeverity = severityFilter === "all" || error.severity === severityFilter;
    const matchesStatus = statusFilter === "all" || 
      (statusFilter === "resolved" ? error.resolved : !error.resolved);
    const matchesCategory = categoryFilter === "all" || 
      error.category.toLowerCase() === categoryFilter.toLowerCase();
    
    return matchesSearch && matchesSeverity && matchesStatus && matchesCategory;
  });

  const categories = [...new Set(errors.map(error => error.category))];

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search errors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            
            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger className="w-full md:w-32">
                <SelectValue placeholder="Severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severity</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category.toLowerCase()}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button variant="outline" onClick={onRefresh}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Errors Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            System Errors ({filteredErrors.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Message</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Timestamp</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredErrors.length > 0 ? (
                filteredErrors.map((error) => (
                  <TableRow key={error.id} className={error.severity === 'critical' ? 'bg-red-50' : ''}>
                    <TableCell className="font-medium">
                      {error.type}
                    </TableCell>
                    <TableCell>
                      <div className="max-w-md">
                        <p className="text-sm">{error.message}</p>
                        {error.userEmail && (
                          <p className="text-xs text-gray-500 mt-1">
                            User: {error.userEmail}
                          </p>
                        )}
                        {error.stack && (
                          <details className="mt-1">
                            <summary className="text-xs text-gray-500 cursor-pointer">
                              View stack trace
                            </summary>
                            <pre className="text-xs bg-gray-50 p-2 rounded mt-1 overflow-auto max-h-32">
                              {error.stack}
                            </pre>
                          </details>
                        )}
                        {error.metadata && (
                          <details className="mt-1">
                            <summary className="text-xs text-gray-500 cursor-pointer">
                              View metadata
                            </summary>
                            <pre className="text-xs bg-gray-50 p-2 rounded mt-1 overflow-auto">
                              {JSON.stringify(error.metadata, null, 2)}
                            </pre>
                          </details>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {getSeverityBadge(error.severity)}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(error.resolved)}
                    </TableCell>
                    <TableCell className="capitalize">
                      {error.category}
                    </TableCell>
                    <TableCell className="text-sm">
                      <div>
                        {new Date(error.createdAt).toLocaleDateString()}
                      </div>
                      <div className="text-gray-500 text-xs">
                        {new Date(error.createdAt).toLocaleTimeString()}
                      </div>
                      {error.resolvedAt && (
                        <div className="text-green-600 text-xs">
                          Resolved: {new Date(error.resolvedAt).toLocaleDateString()}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          
                          {!error.resolved ? (
                            <DropdownMenuItem>
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Mark as Resolved
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem>
                              <XCircle className="mr-2 h-4 w-4" />
                              Reopen
                            </DropdownMenuItem>
                          )}
                          
                          <DropdownMenuItem>
                            <Archive className="mr-2 h-4 w-4" />
                            Archive
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-gray-500">
                    <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-600">No errors found</h3>
                    <p className="text-gray-500 mt-2">
                      {searchTerm || severityFilter !== "all" || statusFilter !== "all" || categoryFilter !== "all"
                        ? "Try adjusting your filters."
                        : "Great! No system errors detected."
                      }
                    </p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
