'use client';

import React, { useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { User, Tag } from 'lucide-react';

interface User {
  id: string;
  name?: string | null;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
}

interface TravelerInfoProps {
  user: User;
  form: UseFormReturn<{
    fullName: string;
    email: string;
    phone: string;
    specialNotes?: string;
    couponCode?: string;
  }>;
  onCouponApply: (couponCode: string) => void;
  couponApplied: string;
}

export default function TravelerInfo({ user, form, onCouponApply, couponApplied }: TravelerInfoProps) {
  const [couponCode, setCouponCode] = useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    
    setIsApplyingCoupon(true);
    try {
      await onCouponApply(couponCode);
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="w-5 h-5" />
          Traveler Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Editable User Information */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name *</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Enter your full name"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email *</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="email"
                    placeholder="Enter your email"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Editable Phone Number */}
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone Number *</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Special Notes */}
        <FormField
          control={form.control}
          name="specialNotes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Special Notes (optional)</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="Any special requests, dietary requirements, or additional information..."
                  className="min-h-[80px]"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Coupon Code */}
        <div className="space-y-2">
          <Label htmlFor="coupon" className="flex items-center gap-2">
            <Tag className="w-4 h-4" />
            Coupon Code
          </Label>
          <div className="flex gap-2">
            <Input
              id="coupon"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              placeholder="Enter coupon code"
              disabled={!!couponApplied}
              className={couponApplied ? 'bg-green-50 border-green-200' : ''}
            />
            <Button
              type="button"
              variant={couponApplied ? "secondary" : "outline"}
              onClick={handleApplyCoupon}
              disabled={!couponCode.trim() || !!couponApplied || isApplyingCoupon}
            >
              {isApplyingCoupon ? 'Applying...' : couponApplied ? 'Applied' : 'Apply'}
            </Button>
          </div>
          {couponApplied && (
            <p className="text-xs text-green-600">
              ✓ Coupon &quot;{couponApplied}&quot; applied successfully
            </p>
          )}
        </div>

        {/* Information Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> Please verify your contact information is correct for booking confirmations and travel updates.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
