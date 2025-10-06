"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, MapPin, Users, Clock, Heart, Plus, X, ArrowLeft, ArrowRight } from "lucide-react";
import { format } from "date-fns";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";

interface CustomTourRequestData {
  destination: string;
  preferredDates: Array<{start: string; end: string; flexible: boolean}>;
  alternativeDates: Array<{start: string; end: string; flexible: boolean}>;
  groupSize: number;
  groupComposition: {
    adults: number;
    children: number;
    ages: number[];
  };
  budgetRange: {
    min: number;
    max: number;
    perPerson: boolean;
    currency: string;
  };
  accommodationPreference: 'budget' | 'mid-range' | 'luxury' | '';
  activityPreferences: string[];
  transportationPreference: 'flight' | 'train' | 'car' | 'mixed' | '';
  mealPreferences: string[];
  specialRequirements: string;
  specialOccasion: string;
  previousTravelExperience: string;
  preferredContactMethod: 'email' | 'phone' | 'whatsapp';
  bestTimeToContact: string;
  additionalNotes: string;
}

const ACTIVITY_OPTIONS = [
  'Adventure Sports', 'Cultural Tours', 'Relaxation & Spa', 'Wildlife Safari',
  'Photography', 'Trekking & Hiking', 'Water Sports', 'Food & Cuisine',
  'Historical Sites', 'Shopping', 'Nightlife', 'Beach Activities',
  'Mountain Activities', 'City Tours', 'Religious/Spiritual', 'Art & Museums'
];

const MEAL_PREFERENCES = [
  'Vegetarian', 'Non-Vegetarian', 'Vegan', 'Jain Food', 'Halal',
  'Kosher', 'Gluten-Free', 'Diabetic Friendly', 'No Restrictions'
];

export default function CustomTourRequestForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 5;

  const [formData, setFormData] = useState<CustomTourRequestData>({
    destination: "",
    preferredDates: [],
    alternativeDates: [],
    groupSize: 2,
    groupComposition: {
      adults: 2,
      children: 0,
      ages: [25, 28]
    },
    budgetRange: {
      min: 50000,
      max: 150000,
      perPerson: true,
      currency: "INR"
    },
    accommodationPreference: '',
    activityPreferences: [],
    transportationPreference: '',
    mealPreferences: [],
    specialRequirements: "",
    specialOccasion: "",
    previousTravelExperience: "",
    preferredContactMethod: 'email',
    bestTimeToContact: "",
    additionalNotes: ""
  });

  // Date range state for calendar
  const [selectedDateRange, setSelectedDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: undefined,
    to: undefined
  });

  const [isFlexible, setIsFlexible] = useState(true);

  const updateFormData = (field: keyof CustomTourRequestData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addDateRange = (type: 'preferred' | 'alternative') => {
    if (!selectedDateRange.from || !selectedDateRange.to) {
      toast.error('Please select both start and end dates');
      return;
    }

    const newDateRange = {
      start: format(selectedDateRange.from, 'yyyy-MM-dd'),
      end: format(selectedDateRange.to, 'yyyy-MM-dd'),
      flexible: isFlexible
    };

    if (type === 'preferred') {
      updateFormData('preferredDates', [...formData.preferredDates, newDateRange]);
    } else {
      updateFormData('alternativeDates', [...formData.alternativeDates, newDateRange]);
    }

    setSelectedDateRange({ from: undefined, to: undefined });
  };

  const removeDateRange = (type: 'preferred' | 'alternative', index: number) => {
    if (type === 'preferred') {
      updateFormData('preferredDates', formData.preferredDates.filter((_, i) => i !== index));
    } else {
      updateFormData('alternativeDates', formData.alternativeDates.filter((_, i) => i !== index));
    }
  };

  const updateGroupComposition = (newAdults: number, newChildren: number) => {
    const totalPeople = newAdults + newChildren;

    // Generate appropriate ages array that matches exactly the total people count
    const ages = [];
    // Add adult ages (25-65 range)
    for (let i = 0; i < newAdults; i++) {
      ages.push(25 + Math.floor(Math.random() * 40));
    }
    // Add children ages (5-17 range)
    for (let i = 0; i < newChildren; i++) {
      ages.push(5 + Math.floor(Math.random() * 13));
    }

    // Update both group composition and group size simultaneously
    setFormData(prev => ({
      ...prev,
      groupSize: totalPeople,
      groupComposition: {
        adults: newAdults,
        children: newChildren,
        ages
      }
    }));
  };

  const toggleActivityPreference = (activity: string) => {
    const current = formData.activityPreferences;
    if (current.includes(activity)) {
      updateFormData('activityPreferences', current.filter(a => a !== activity));
    } else {
      updateFormData('activityPreferences', [...current, activity]);
    }
  };

  const toggleMealPreference = (meal: string) => {
    const current = formData.mealPreferences;
    if (current.includes(meal)) {
      updateFormData('mealPreferences', current.filter(m => m !== meal));
    } else {
      updateFormData('mealPreferences', [...current, meal]);
    }
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        if (!formData.destination || formData.preferredDates.length === 0) {
          toast.error('Please fill in destination and at least one preferred date');
          return false;
        }
        break;
      case 2:
        if (formData.groupSize < 1) {
          toast.error('Please specify valid group size');
          return false;
        }
        break;
      case 3:
        if (formData.budgetRange.min >= formData.budgetRange.max) {
          toast.error('Maximum budget must be greater than minimum budget');
          return false;
        }
        break;
    }
    return true;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;

    setLoading(true);
    try {
      // Ensure data consistency before submission
      const totalPeople = formData.groupComposition.adults + formData.groupComposition.children;

      // Regenerate ages to ensure exact match with current group composition
      const ages = [];
      for (let i = 0; i < formData.groupComposition.adults; i++) {
        ages.push(25 + Math.floor(Math.random() * 40));
      }
      for (let i = 0; i < formData.groupComposition.children; i++) {
        ages.push(5 + Math.floor(Math.random() * 13));
      }

      const submissionData = {
        ...formData,
        groupSize: totalPeople,
        groupComposition: {
          adults: formData.groupComposition.adults,
          children: formData.groupComposition.children,
          ages: ages
        }
      };

      // Validation check before API call
      if (submissionData.groupSize !== submissionData.groupComposition.ages.length) {
        throw new Error('Group size validation failed. Please try again.');
      }

      // Log for debugging
      console.log('Final submission data:', {
        groupSize: submissionData.groupSize,
        adults: submissionData.groupComposition.adults,
        children: submissionData.groupComposition.children,
        agesLength: submissionData.groupComposition.ages.length
      });

      const response = await fetch('/api/custom-tour-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit request');
      }

      toast.success("Your custom tour request has been submitted successfully! We'll contact you soon with a personalized quote.");
      router.push('/my-requests');
    } catch (error) {
      console.error('Error submitting request:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to submit request');
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Destination & Travel Dates
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="destination">Where would you like to travel? *</Label>
                <Input
                  id="destination"
                  value={formData.destination}
                  onChange={(e) => updateFormData('destination', e.target.value)}
                  placeholder="e.g., Japan, Switzerland, Maldives, Kerala..."
                  className="mt-2"
                />
              </div>

              <div>
                <Label>Preferred Travel Dates *</Label>
                <div className="mt-2 space-y-4">
                  <div className="flex items-center gap-4">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-[280px] justify-start text-left font-normal",
                            !selectedDateRange.from && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {selectedDateRange.from ? (
                            selectedDateRange.to ? (
                              `${format(selectedDateRange.from, "LLL dd, y")} - ${format(selectedDateRange.to, "LLL dd, y")}`
                            ) : (
                              format(selectedDateRange.from, "LLL dd, y")
                            )
                          ) : (
                            "Select date range"
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          initialFocus
                          mode="range"
                          defaultMonth={selectedDateRange.from}
                          selected={selectedDateRange}
                          onSelect={setSelectedDateRange}
                          numberOfMonths={2}
                        />
                      </PopoverContent>
                    </Popover>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="flexible"
                        checked={isFlexible}
                        onCheckedChange={setIsFlexible}
                      />
                      <Label htmlFor="flexible">Flexible dates</Label>
                    </div>

                    <Button onClick={() => addDateRange('preferred')}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add
                    </Button>
                  </div>

                  <div className="space-y-2">
                    {formData.preferredDates.map((date, index) => (
                      <div key={index} className="flex items-center justify-between bg-blue-50 p-3 rounded-lg">
                        <div>
                          <span className="font-medium">
                            {format(new Date(date.start), "MMM dd, yyyy")} - {format(new Date(date.end), "MMM dd, yyyy")}
                          </span>
                          {date.flexible && <Badge variant="secondary" className="ml-2">Flexible</Badge>}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeDateRange('preferred', index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <Label>Alternative Dates (Optional)</Label>
                <p className="text-sm text-gray-600 mb-2">
                  Backup options in case your preferred dates aren't available
                </p>
                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    onClick={() => addDateRange('alternative')}
                    disabled={!selectedDateRange.from || !selectedDateRange.to}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Alternative Date
                  </Button>
                </div>

                <div className="mt-2 space-y-2">
                  {formData.alternativeDates.map((date, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                      <div>
                        <span className="font-medium">
                          {format(new Date(date.start), "MMM dd, yyyy")} - {format(new Date(date.end), "MMM dd, yyyy")}
                        </span>
                        {date.flexible && <Badge variant="secondary" className="ml-2">Flexible</Badge>}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeDateRange('alternative', index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case 2:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Group Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label>Total Number of People *</Label>
                <div className="mt-2">
                  <Slider
                    value={[formData.groupSize]}
                    onValueChange={(value) => {
                      const newGroupSize = value[0];
                      const currentTotal = formData.groupComposition.adults + formData.groupComposition.children;

                      if (newGroupSize !== currentTotal) {
                        // Adjust composition to match new group size
                        let newAdults = formData.groupComposition.adults;
                        let newChildren = formData.groupComposition.children;

                        if (newGroupSize > currentTotal) {
                          // Add to adults
                          newAdults += (newGroupSize - currentTotal);
                        } else {
                          // Reduce children first, then adults
                          const reduction = currentTotal - newGroupSize;
                          if (newChildren >= reduction) {
                            newChildren -= reduction;
                          } else {
                            newAdults -= (reduction - newChildren);
                            newChildren = 0;
                            // Ensure at least 1 adult
                            if (newAdults < 1) {
                              newAdults = 1;
                              newChildren = newGroupSize - 1;
                            }
                          }
                        }

                        updateGroupComposition(newAdults, newChildren);
                      } else {
                        updateFormData('groupSize', newGroupSize);
                      }
                    }}
                    max={20}
                    min={1}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-gray-600 mt-1">
                    <span>1 person</span>
                    <span className="font-medium">{formData.groupSize} people</span>
                    <span>20 people</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="adults">Adults *</Label>
                  <Input
                    id="adults"
                    type="number"
                    value={formData.groupComposition.adults}
                    onChange={(e) => {
                      const adults = Math.max(1, parseInt(e.target.value) || 1); // At least 1 adult
                      const children = formData.groupComposition.children;
                      updateGroupComposition(adults, children);
                    }}
                    min={1}
                    max={19}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="children">Children</Label>
                  <Input
                    id="children"
                    type="number"
                    value={formData.groupComposition.children}
                    onChange={(e) => {
                      const children = Math.max(0, parseInt(e.target.value) || 0);
                      const adults = formData.groupComposition.adults;
                      updateGroupComposition(adults, children);
                    }}
                    min={0}
                    max={19}
                    className="mt-2"
                  />
                </div>
              </div>

              {/* Display current composition */}
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Current Group:</strong> {formData.groupComposition.adults} adults + {formData.groupComposition.children} children = {formData.groupSize} total people
                </p>
              </div>

              <div>
                <Label>Special Occasion (Optional)</Label>
                <Select value={formData.specialOccasion} onValueChange={(value) => updateFormData('specialOccasion', value)}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Is this for a special occasion?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No special occasion</SelectItem>
                    <SelectItem value="honeymoon">Honeymoon</SelectItem>
                    <SelectItem value="anniversary">Anniversary</SelectItem>
                    <SelectItem value="family_reunion">Family Reunion</SelectItem>
                    <SelectItem value="birthday">Birthday Celebration</SelectItem>
                    <SelectItem value="graduation">Graduation Trip</SelectItem>
                    <SelectItem value="retirement">Retirement Celebration</SelectItem>
                    <SelectItem value="business">Business Travel</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        );

      case 3:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Budget & Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label>Budget Range (INR) *</Label>
                <div className="mt-2 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="minBudget">Minimum Budget</Label>
                      <Input
                        id="minBudget"
                        type="number"
                        value={formData.budgetRange.min}
                        onChange={(e) => updateFormData('budgetRange', {
                          ...formData.budgetRange,
                          min: parseInt(e.target.value) || 0
                        })}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="maxBudget">Maximum Budget</Label>
                      <Input
                        id="maxBudget"
                        type="number"
                        value={formData.budgetRange.max}
                        onChange={(e) => updateFormData('budgetRange', {
                          ...formData.budgetRange,
                          max: parseInt(e.target.value) || 0
                        })}
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="perPerson"
                      checked={formData.budgetRange.perPerson}
                      onCheckedChange={(checked) => updateFormData('budgetRange', {
                        ...formData.budgetRange,
                        perPerson: checked
                      })}
                    />
                    <Label htmlFor="perPerson">Budget is per person</Label>
                  </div>
                </div>
              </div>

              <div>
                <Label>Preferred Accommodation Level</Label>
                <Select
                  value={formData.accommodationPreference}
                  onValueChange={(value) => updateFormData('accommodationPreference', value)}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select accommodation preference" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="budget">Budget (2-3 star hotels, hostels)</SelectItem>
                    <SelectItem value="mid-range">Mid-range (3-4 star hotels)</SelectItem>
                    <SelectItem value="luxury">Luxury (4-5 star hotels, resorts)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Transportation Preference</Label>
                <Select
                  value={formData.transportationPreference}
                  onValueChange={(value) => updateFormData('transportationPreference', value)}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="How would you like to travel?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="flight">Flight (fastest option)</SelectItem>
                    <SelectItem value="train">Train (scenic route)</SelectItem>
                    <SelectItem value="car">Car/Road trip</SelectItem>
                    <SelectItem value="mixed">Mixed transportation</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        );

      case 4:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5" />
                Activity & Food Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label>What activities interest you? (Select all that apply)</Label>
                <div className="mt-2 grid grid-cols-2 md:grid-cols-3 gap-3">
                  {ACTIVITY_OPTIONS.map((activity) => (
                    <div key={activity} className="flex items-center space-x-2">
                      <Checkbox
                        id={activity}
                        checked={formData.activityPreferences.includes(activity)}
                        onCheckedChange={() => toggleActivityPreference(activity)}
                      />
                      <Label htmlFor={activity} className="text-sm">{activity}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label>Food & Dietary Preferences</Label>
                <div className="mt-2 grid grid-cols-2 md:grid-cols-3 gap-3">
                  {MEAL_PREFERENCES.map((meal) => (
                    <div key={meal} className="flex items-center space-x-2">
                      <Checkbox
                        id={meal}
                        checked={formData.mealPreferences.includes(meal)}
                        onCheckedChange={() => toggleMealPreference(meal)}
                      />
                      <Label htmlFor={meal} className="text-sm">{meal}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="specialRequirements">Special Requirements or Accessibility Needs</Label>
                <Textarea
                  id="specialRequirements"
                  value={formData.specialRequirements}
                  onChange={(e) => updateFormData('specialRequirements', e.target.value)}
                  placeholder="Any special requirements, medical needs, accessibility requirements, etc."
                  className="mt-2"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="travelExperience">Previous Travel Experience (Optional)</Label>
                <Textarea
                  id="travelExperience"
                  value={formData.previousTravelExperience}
                  onChange={(e) => updateFormData('previousTravelExperience', e.target.value)}
                  placeholder="Tell us about your travel experience, places you've been, travel style preferences..."
                  className="mt-2"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        );

      case 5:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Contact Information & Final Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label>Preferred Contact Method</Label>
                <Select
                  value={formData.preferredContactMethod}
                  onValueChange={(value) => updateFormData('preferredContactMethod', value)}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="phone">Phone Call</SelectItem>
                    <SelectItem value="whatsapp">WhatsApp</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="contactTime">Best Time to Contact You</Label>
                <Input
                  id="contactTime"
                  value={formData.bestTimeToContact}
                  onChange={(e) => updateFormData('bestTimeToContact', e.target.value)}
                  placeholder="e.g., Weekday evenings, Weekend mornings, Anytime"
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="additionalNotes">Additional Notes</Label>
                <Textarea
                  id="additionalNotes"
                  value={formData.additionalNotes}
                  onChange={(e) => updateFormData('additionalNotes', e.target.value)}
                  placeholder="Any other details you'd like us to know about your dream trip..."
                  className="mt-2"
                  rows={4}
                />
              </div>

              {/* Summary */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-3">Request Summary</h3>
                <div className="space-y-2 text-sm">
                  <p><strong>Destination:</strong> {formData.destination}</p>
                  <p><strong>Group Size:</strong> {formData.groupSize} people</p>
                  <p><strong>Budget:</strong> ₹{formData.budgetRange.min.toLocaleString()} - ₹{formData.budgetRange.max.toLocaleString()} {formData.budgetRange.perPerson ? 'per person' : 'total'}</p>
                  <p><strong>Preferred Dates:</strong> {formData.preferredDates.length} date range(s) selected</p>
                  {formData.accommodationPreference && (
                    <p><strong>Accommodation:</strong> {formData.accommodationPreference}</p>
                  )}
                  {formData.activityPreferences.length > 0 && (
                    <p><strong>Activities:</strong> {formData.activityPreferences.slice(0, 3).join(', ')}{formData.activityPreferences.length > 3 ? ` +${formData.activityPreferences.length - 3} more` : ''}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );
    }
  };

  return (
    <div className="space-y-8">
      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${(currentStep / totalSteps) * 100}%` }}
        />
      </div>

      <div className="text-center">
        <span className="text-sm text-gray-600">
          Step {currentStep} of {totalSteps}
        </span>
      </div>

      {renderStep()}

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={prevStep}
          disabled={currentStep === 1}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>

        {currentStep === totalSteps ? (
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Submitting..." : "Submit Request"}
            <Heart className="h-4 w-4 ml-2" />
          </Button>
        ) : (
          <Button onClick={nextStep}>
            Next
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        )}
      </div>
    </div>
  );
}
