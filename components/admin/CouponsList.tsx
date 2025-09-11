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
  type: "percentage" | "fixed";
  value: number;
  isActive: boolean;
  usageCount: number;
  usageLimit: number | null;
  validFrom: Date;
  validUntil: Date | null;
  minOrderAmount: number | null;
  maxDiscountAmount: number | null;
  createdAt: Date;
}

interface CouponsListProps {
  coupons: CouponData[];
}

const getStatusBadge = (isActive: boolean, validUntil: Date | null) => {
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
    : `$${value} off`;
};

const getUsagePercentage = (used: number, limit: number | null) => {
  if (!limit) return 0;
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
    <Card>
      <CardHeader>
        <CardTitle>All Coupons ({coupons.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {coupons.length > 0 ? (
            coupons.map((coupon) => (
              <div key={coupon.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-4">
                  {/* Coupon Icon */}
                  <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    {coupon.type === "percentage" ? (
                      <Percent className="h-6 w-6 text-primary" />
                    ) : (
                      <DollarSign className="h-6 w-6 text-primary" />
                    )}
                  </div>

                  {/* Coupon Details */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-bold text-lg font-mono">{coupon.code}</h3>
                      {getStatusBadge(coupon.isActive, coupon.validUntil)}
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        {coupon.type === "percentage" ? (
                          <Percent className="h-3 w-3" />
                        ) : (
                          <DollarSign className="h-3 w-3" />
                        )}
                        <span>{getDiscountDisplay(coupon.type, coupon.value)}</span>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        <span>
                          {coupon.usageCount} / {coupon.usageLimit || '∞'} uses
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>
                          {coupon.validUntil 
                            ? `Expires ${new Date(coupon.validUntil).toLocaleDateString()}`
                            : 'No expiry'
                          }
                        </span>
                      </div>
                    </div>

                    {/* Usage Progress */}
                    {coupon.usageLimit && (
                      <div className="mt-2">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-gray-500">Usage</span>
                          <span className="text-xs text-gray-500">
                            {Math.round(getUsagePercentage(coupon.usageCount, coupon.usageLimit))}%
                          </span>
                        </div>
                        <Progress 
                          value={getUsagePercentage(coupon.usageCount, coupon.usageLimit)} 
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
