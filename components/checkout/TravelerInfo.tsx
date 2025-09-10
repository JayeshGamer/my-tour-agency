'use client';

import { useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '../../src/components/ui/card';
import { Input } from '../../src/components/ui/input';
import { Label } from '../../src/components/ui/label';
import { Textarea } from '../../src/components/ui/textarea';
import { Button } from '../../src/components/ui/button';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '../../src/components/ui/form';
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
  form: UseFormReturn<{specialNotes?: string; couponCode?: string}>;
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

  // Get display name
  const fullName = user.name || 
    (user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : '') ||
    user.email.split('@')[0];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="w-5 h-5" />
          Traveler Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Pre-filled User Information */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              value={fullName}
              disabled
              className="bg-gray-50"
            />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              value={user.email}
              disabled
              className="bg-gray-50"
            />
          </div>
        </div>

        {/* Mock phone number - in a real app, this would come from user profile */}
        <div>
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            id="phone"
            value="+1 555-123-4567"
            disabled
            className="bg-gray-50"
          />
          <p className="text-xs text-gray-500 mt-1">
            Update your contact details in your profile settings
          </p>
        </div>

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
            <strong>Note:</strong> Your personal information is pre-filled from your account. 
            To update your name or add a phone number, please visit your profile settings.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
