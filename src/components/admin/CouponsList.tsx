"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  ToggleLeft,
  ToggleRight,
  Percent,
  DollarSign,
  Calendar,
  Users
} from "lucide-react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

interface CouponData {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  discountType: string;
  discountValue: string;
  minimumAmount?: string | null;
  maximumDiscount?: string | null;
  usageLimit?: number | null;
  usedCount?: number;
  validFrom: Date;
  validUntil?: Date | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  [key: string]: any;
}

interface CouponsListProps {
  coupons: CouponData[];
}

const getStatusBadge = (isActive: boolean, validUntil: Date | null | undefined) => {
  const now = new Date();
  
  if (!isActive) {
    return <Badge variant="secondary">Inactive</Badge>;
  }
  
  if (validUntil && validUntil < now) {
    return <Badge variant="destructive">Expired</Badge>;
  }
  
  return <Badge variant="default">Active</Badge>;
};

const getDiscountDisplay = (type: string, value: number) => {
  return type === "percentage" 
    ? `${value}% off`
    : `₹${value.toLocaleString('en-IN')} off`;
};

const getUsagePercentage = (used: number | undefined, limit: number | null) => {
  if (!limit || !used) return 0;
  return Math.min((used / limit) * 100, 100);
};

export default function CouponsList({ coupons }: CouponsListProps) {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  const handleToggleStatus = async (couponId: string, currentStatus: boolean) => {
    setIsProcessing(couponId);
    try {
      const response = await fetch(`/api/admin/coupons/${couponId}/toggle`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update coupon status');
      }

      toast.success(`Coupon ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
      router.refresh();
    } catch (error: any) {
      console.error('Error updating coupon status:', error);
      toast.error(error.message || 'Failed to update coupon status');
    } finally {
      setIsProcessing(null);
    }
  };

  const handleDeleteCoupon = async (couponId: string) => {
    if (!confirm('Are you sure you want to delete this coupon? This action cannot be undone.')) {
      return;
    }

    setIsProcessing(couponId);
    try {
      const response = await fetch(`/api/admin/coupons/${couponId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete coupon');
      }

      toast.success('Coupon deleted successfully');
      router.refresh();
    } catch (error: any) {
      console.error('Error deleting coupon:', error);
      toast.error(error.message || 'Failed to delete coupon');
    } finally {
      setIsProcessing(null);
    }
  };

  return (
    <Card className="overflow-hidden border-border/50 shadow-sm">
      <CardHeader className="bg-gradient-to-r from-muted/50 to-transparent border-b">
        <CardTitle className="text-xl font-bold">All Coupons ({coupons.length})</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          {coupons.length > 0 ? (
            coupons.map((coupon) => (
              <div key={coupon.id} className="group relative flex items-center justify-between p-5 border rounded-xl hover:shadow-md hover:border-primary/20 transition-all duration-300 bg-gradient-to-r from-muted/20 to-transparent">
                {/* Hover effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 rounded-xl transition-opacity" />

                <div className="flex items-center gap-4 relative z-10 flex-1">
                  {/* Coupon Icon with gradient */}
                  <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl flex items-center justify-center border border-primary/10 shadow-sm">
                    {coupon.discountType === "percentage" ? (
                      <Percent className="h-7 w-7 text-primary" />
                    ) : (
                      <DollarSign className="h-7 w-7 text-primary" />
                    )}
                  </div>

                  {/* Coupon Details */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-bold text-xl font-mono tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                        {coupon.code}
                      </h3>
                      {getStatusBadge(coupon.isActive, coupon.validUntil)}
                    </div>
                    
                    {coupon.name && (
                      <p className="text-sm text-muted-foreground font-medium mb-3">{coupon.name}</p>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                      <div className="flex items-center gap-2 text-foreground">
                        {coupon.discountType === "percentage" ? (
                          <div className="p-1.5 rounded-lg bg-blue-500/10">
                            <Percent className="h-4 w-4 text-blue-600" />
                          </div>
                        ) : (
                          <div className="p-1.5 rounded-lg bg-green-500/10">
                            <DollarSign className="h-4 w-4 text-green-600" />
                          </div>
                        )}
                        <span className="font-semibold">{getDiscountDisplay(coupon.discountType, Number(coupon.discountValue))}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <div className="p-1.5 rounded-lg bg-muted">
                          <Users className="h-4 w-4" />
                        </div>
                        <span>
                          <span className="font-semibold text-foreground">{coupon.usedCount}</span> / {coupon.usageLimit || '∞'} uses
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <div className="p-1.5 rounded-lg bg-muted">
                          <Calendar className="h-4 w-4" />
                        </div>
                        <span className="text-xs">
                          {coupon.validUntil
                            ? `Expires ${new Date(coupon.validUntil).toLocaleDateString('en-IN')}`
                            : 'No expiry'
                          }
                        </span>
                      </div>
                    </div>

                    {/* Usage Progress */}
                    {coupon.usageLimit && (
                      <div className="mt-3">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-medium text-muted-foreground">Usage Progress</span>
                          <span className="text-xs font-semibold text-foreground">
                            {Math.round(getUsagePercentage(coupon.usedCount || 0, coupon.usageLimit))}%
                          </span>
                        </div>
                        <Progress 
                          value={getUsagePercentage(coupon.usedCount || 0, coupon.usageLimit)}
                          className="h-2"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        disabled={isProcessing === coupon.id}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                      
                      <DropdownMenuItem>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Coupon
                      </DropdownMenuItem>
                      
                      <DropdownMenuItem 
                        onClick={() => handleToggleStatus(coupon.id, coupon.isActive)}
                      >
                        {coupon.isActive ? (
                          <>
                            <ToggleLeft className="mr-2 h-4 w-4" />
                            Deactivate
                          </>
                        ) : (
                          <>
                            <ToggleRight className="mr-2 h-4 w-4" />
                            Activate
                          </>
                        )}
                      </DropdownMenuItem>
                      
                      <DropdownMenuItem 
                        className="text-red-600"
                        onClick={() => handleDeleteCoupon(coupon.id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Coupon
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 text-gray-500">
              <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600">No coupons found</h3>
              <p className="text-gray-500 mt-2">Create your first discount coupon to get started.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
