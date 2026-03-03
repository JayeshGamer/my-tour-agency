"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { DateInput } from "@/components/ui/date-input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Progress } from "@/components/ui/progress";
import {
  CalendarIcon,
  MapPin,
  Users,
  Heart,
  Plus,
  X,
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Sparkles,
  Globe,
  Plane,
  Mountain,
  Shield,
  Star,
  Send,
  Zap,
  DollarSign,
  Hotel,
  Car,
  Train,
  Phone,
  Mail,
  MessageCircle,
  Clock3,
  TreePine,
  Camera as PhotoIcon,
  Waves,
  Building,
  Palette,
  Compass,
  MapPinIcon,
  Target,
  AlertCircle
} from "lucide-react";
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
  {
    id: 'adventure',
    label: 'Adventure Sports',
    icon: Mountain,
    color: 'from-orange-400 to-red-500',
    bgColor: 'bg-gradient-to-br from-orange-50 to-red-50',
    description: 'Thrilling outdoor activities'
  },
  {
    id: 'cultural',
    label: 'Cultural Experiences',
    icon: Globe,
    color: 'from-purple-400 to-indigo-500',
    bgColor: 'bg-gradient-to-br from-purple-50 to-indigo-50',
    description: 'Local traditions and heritage'
  },
  {
    id: 'relaxation',
    label: 'Wellness & Spa',
    icon: Heart,
    color: 'from-pink-400 to-rose-500',
    bgColor: 'bg-gradient-to-br from-pink-50 to-rose-50',
    description: 'Rest and rejuvenation'
  },
  {
    id: 'wildlife',
    label: 'Wildlife Safari',
    icon: TreePine,
    color: 'from-green-400 to-emerald-500',
    bgColor: 'bg-gradient-to-br from-green-50 to-emerald-50',
    description: 'Nature and animal encounters'
  },
  {
    id: 'photography',
    label: 'Photography Tours',
    icon: PhotoIcon,
    color: 'from-blue-400 to-cyan-500',
    bgColor: 'bg-gradient-to-br from-blue-50 to-cyan-50',
    description: 'Capture stunning moments'
  },
  {
    id: 'trekking',
    label: 'Trekking & Hiking',
    icon: Mountain,
    color: 'from-emerald-400 to-teal-500',
    bgColor: 'bg-gradient-to-br from-emerald-50 to-teal-50',
    description: 'Mountain and trail adventures'
  },
  {
    id: 'beach',
    label: 'Beach & Water Sports',
    icon: Waves,
    color: 'from-cyan-400 to-blue-500',
    bgColor: 'bg-gradient-to-br from-cyan-50 to-blue-50',
    description: 'Ocean and coastal activities'
  },
  {
    id: 'urban',
    label: 'City Exploration',
    icon: Building,
    color: 'from-gray-400 to-slate-500',
    bgColor: 'bg-gradient-to-br from-gray-50 to-slate-50',
    description: 'Urban culture and nightlife'
  }
];

const MEAL_PREFERENCES = [
  { id: 'vegetarian', label: 'Vegetarian', icon: '🥗' },
  { id: 'non-vegetarian', label: 'Non-Vegetarian', icon: '🍖' },
  { id: 'vegan', label: 'Vegan', icon: '🌱' },
  { id: 'jain', label: 'Jain Food', icon: '🙏' },
  { id: 'halal', label: 'Halal', icon: '☪️' },
  { id: 'kosher', label: 'Kosher', icon: '✡️' },
  { id: 'gluten-free', label: 'Gluten-Free', icon: '🌾' },
  { id: 'diabetic', label: 'Diabetic Friendly', icon: '💊' },
  { id: 'no-restrictions', label: 'No Restrictions', icon: '🍽️' }
];

const ACCOMMODATION_OPTIONS = [
  {
    id: 'budget',
    label: 'Budget',
    description: 'Hostels, guesthouses, basic hotels',
    icon: Shield,
    price: '₹2,000 - ₹5,000/night'
  },
  {
    id: 'mid-range',
    label: 'Mid-Range',
    description: '3-4 star hotels, boutique stays',
    icon: Hotel,
    price: '₹5,000 - ₹15,000/night'
  },
  {
    id: 'luxury',
    label: 'Luxury',
    description: '5-star resorts, premium properties',
    icon: Star,
    price: '₹15,000+/night'
  }
];

const TRANSPORTATION_OPTIONS = [
  { id: 'flight', label: 'Flight', icon: Plane, description: 'Quick and convenient' },
  { id: 'train', label: 'Train', icon: Train, description: 'Scenic and comfortable' },
  { id: 'car', label: 'Private Car', icon: Car, description: 'Flexible and private' },
  { id: 'mixed', label: 'Mixed Transport', icon: Compass, description: 'Best of all options' }
];

const CONTACT_METHODS = [
  { id: 'email', label: 'Email', icon: Mail, description: 'Detailed communication' },
  { id: 'phone', label: 'Phone Call', icon: Phone, description: 'Direct conversation' },
  { id: 'whatsapp', label: 'WhatsApp', icon: MessageCircle, description: 'Quick messaging' }
];

const STEPS = [
  {
    id: 1,
    title: 'Destination',
    icon: MapPinIcon,
    description: 'Where and when would you like to travel?',
    color: 'from-blue-500 to-cyan-500'
  },
  {
    id: 2,
    title: 'Travelers',
    icon: Users,
    description: 'Tell us about your group',
    color: 'from-purple-500 to-pink-500'
  },
  {
    id: 3,
    title: 'Budget',
    icon: DollarSign,
    description: 'Set your budget and preferences',
    color: 'from-green-500 to-emerald-500'
  },
  {
    id: 4,
    title: 'Activities',
    icon: Palette,
    description: 'Choose your ideal experiences',
    color: 'from-orange-500 to-red-500'
  },
  {
    id: 5,
    title: 'Details',
    icon: Sparkles,
    description: 'Special requirements and contact',
    color: 'from-indigo-500 to-purple-500'
  }
];

export default function CustomTourRequestForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 5;
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

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

  const [selectedDateRange, setSelectedDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: undefined,
    to: undefined
  });

  const [isFlexible, setIsFlexible] = useState(true);

  // Auto-save functionality
  useEffect(() => {
    const savedData = localStorage.getItem('customTourRequest');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setFormData(parsed);
      } catch (error) {
        console.error('Failed to load saved data:', error);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('customTourRequest', JSON.stringify(formData));
  }, [formData]);

  const updateFormData = (field: keyof CustomTourRequestData, value: unknown) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear field error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
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
    toast.success('Date range added successfully!');
  };

  const removeDateRange = (type: 'preferred' | 'alternative', index: number) => {
    if (type === 'preferred') {
      updateFormData('preferredDates', formData.preferredDates.filter((_, i) => i !== index));
    } else {
      updateFormData('alternativeDates', formData.alternativeDates.filter((_, i) => i !== index));
    }
    toast.success('Date range removed');
  };

  const updateGroupComposition = (newAdults: number, newChildren: number) => {
    const totalPeople = newAdults + newChildren;
    const ages: number[] = [];

    // Generate realistic ages
    for (let i = 0; i < newAdults; i++) {
      ages.push(25 + Math.floor(Math.random() * 40));
    }
    for (let i = 0; i < newChildren; i++) {
      ages.push(5 + Math.floor(Math.random() * 13));
    }

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
    const errors: Record<string, string> = {};

    switch (step) {
      case 1:
        if (!formData.destination.trim()) {
          errors.destination = 'Destination is required';
        }
        if (formData.preferredDates.length === 0) {
          errors.preferredDates = 'At least one preferred date is required';
        }
        break;
      case 2:
        if (formData.groupSize < 1) {
          errors.groupSize = 'Group size must be at least 1';
        }
        if (formData.groupComposition.adults < 1) {
          errors.adults = 'At least one adult is required';
        }
        break;
      case 3:
        if (formData.budgetRange.min >= formData.budgetRange.max) {
          errors.budget = 'Maximum budget must be greater than minimum budget';
        }
        if (!formData.accommodationPreference) {
          errors.accommodation = 'Please select accommodation preference';
        }
        if (!formData.transportationPreference) {
          errors.transportation = 'Please select transportation preference';
        }
        break;
      case 4:
        if (formData.activityPreferences.length === 0) {
          errors.activities = 'Please select at least one activity preference';
        }
        if (formData.mealPreferences.length === 0) {
          errors.meals = 'Please select at least one meal preference';
        }
        break;
      case 5:
        if (!formData.preferredContactMethod) {
          errors.contact = 'Please select a contact method';
        }
        break;
    }

    setFormErrors(errors);

    if (Object.keys(errors).length > 0) {
      const firstError = Object.values(errors)[0];
      toast.error(firstError);
      return false;
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
      const totalPeople = formData.groupComposition.adults + formData.groupComposition.children;
      const ages: number[] = [];

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

      // Clear saved data on successful submission
      localStorage.removeItem('customTourRequest');

      toast.success("🎉 Your custom tour request has been submitted! We'll create your perfect itinerary within 24 hours.");
      router.push('/my-requests');
    } catch (error) {
      console.error('Error submitting request:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to submit request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative">
      {/* Background Elements - Minimized */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] opacity-30" />

      <div className="relative z-10">
        {/* Streamlined Progress Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 shadow-xl border-2 border-gray-200 dark:border-gray-800 hover:border-gray-900 dark:hover:border-gray-300 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900">
                  <Target className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    {STEPS.find(s => s.id === currentStep)?.title}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300 mt-0.5 text-sm">
                    {STEPS.find(s => s.id === currentStep)?.description}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <Badge variant="outline" className="px-3 py-1 text-sm font-semibold border-2 border-gray-900 dark:border-white">
                  {currentStep} of {totalSteps}
                </Badge>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  {Math.round((currentStep / totalSteps) * 100)}% Complete
                </p>
              </div>
            </div>

            <div className="mb-5">
              <Progress
                value={(currentStep / totalSteps) * 100}
                className="h-2 bg-gray-100 dark:bg-gray-800"
              />
            </div>

            {/* Simplified Steps */}
            <div className="flex items-center justify-between">
              {STEPS.map((step, idx) => {
                const isActive = step.id === currentStep;
                const isCompleted = step.id < currentStep;
                const isUpcoming = step.id > currentStep;

                return (
                  <div key={step.id} className="flex items-center">
                    <div className="flex flex-col items-center gap-1.5">
                      <div className={cn(
                        "w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 font-bold text-xs",
                        isActive && "bg-gray-900 dark:bg-white text-white dark:text-gray-900 scale-110",
                        isCompleted && "bg-green-600 text-white",
                        isUpcoming && "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                      )}>
                        {isCompleted ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : (
                          step.id
                        )}
                      </div>
                      <span className={cn(
                        "text-[10px] font-medium text-center whitespace-nowrap transition-colors",
                        isActive && "text-gray-900 dark:text-white font-bold",
                        isCompleted && "text-green-600 dark:text-green-400",
                        isUpcoming && "text-gray-400 dark:text-gray-500"
                      )}>
                        {step.title}
                      </span>
                    </div>
                    {idx < STEPS.length - 1 && (
                      <div className={cn(
                        "w-12 h-0.5 mx-1.5 rounded transition-colors mb-5",
                        step.id < currentStep ? "bg-green-600" : "bg-gray-200 dark:bg-gray-700"
                      )} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* Enhanced Form Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 50, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -50, scale: 0.95 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>

        {/* Streamlined Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex items-center justify-between mt-12 pt-8 border-t border-gray-200 dark:border-gray-700"
        >
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 1}
            className="flex items-center gap-3 px-8 py-4 h-auto text-lg font-medium border-2 border-gray-900 dark:border-white hover:bg-gray-900 hover:text-white dark:hover:bg-white dark:hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <ArrowLeft className="h-5 w-5" />
            Previous
          </Button>

          <div className="hidden sm:flex items-center gap-2">
            {Array.from({ length: totalSteps }, (_, i) => (
              <div
                key={i}
                className={cn(
                  "w-3 h-3 rounded-full transition-all duration-300",
                  i + 1 <= currentStep ? "bg-gray-900 dark:bg-white" : "bg-gray-200 dark:bg-gray-600"
                )}
              />
            ))}
          </div>

          <div className="flex items-center gap-4">
            {currentStep < totalSteps ? (
              <Button
                onClick={nextStep}
                className="flex items-center gap-3 px-8 py-4 h-auto text-lg font-medium bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Continue
                <ArrowRight className="h-5 w-5" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={loading}
                className="flex items-center gap-3 px-10 py-4 h-auto text-lg font-medium bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                    Creating Your Journey...
                  </>
                ) : (
                  <>
                    <Send className="h-5 w-5" />
                    Submit Request
                  </>
                )}
              </Button>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );

  function renderStep() {
    const currentStepData = STEPS.find(s => s.id === currentStep);

    return (
      <Card className="border-2 border-gray-200 dark:border-gray-800 hover:border-gray-900 dark:hover:border-gray-300 shadow-xl bg-white dark:bg-gray-900 rounded-2xl overflow-hidden transition-all duration-300">
        <CardHeader className="pb-4 bg-gradient-to-r from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-lg">
              {currentStepData && <currentStepData.icon className="h-6 w-6" />}
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                {currentStepData?.title}
              </CardTitle>
              <p className="text-gray-600 dark:text-gray-300 mt-1 text-base">
                {currentStepData?.description}
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {currentStep === 1 && renderDestinationStep()}
          {currentStep === 2 && renderGroupStep()}
          {currentStep === 3 && renderBudgetStep()}
          {currentStep === 4 && renderActivitiesStep()}
          {currentStep === 5 && renderFinalStep()}
        </CardContent>
      </Card>
    );
  }

  function renderDestinationStep() {
    return (
      <>
        {/* Clear Section Title */}
        <div className="space-y-1">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Where do you want to go?</h2>
          <p className="text-gray-600 dark:text-gray-300 text-sm">Tell us your dream destination</p>
        </div>

        {/* Destination Input - Focus User Attention */}
        <div className="space-y-2">
          <Label htmlFor="destination" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Destination *
          </Label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
            <Input
              id="destination"
              value={formData.destination}
              onChange={(e) => updateFormData('destination', e.target.value)}
              placeholder="e.g., Paris, Tokyo, Bali..."
              className={cn(
                "h-12 pl-10 text-sm border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-gray-900 dark:focus:border-white focus:ring-2 focus:ring-gray-100 dark:focus:ring-gray-800",
                formErrors.destination && "border-red-300 focus:border-red-500 focus:ring-red-100"
              )}
            />
          </div>
          {formErrors.destination && (
            <p className="text-xs text-red-600">{formErrors.destination}</p>
          )}
        </div>

        {/* Date Selection - Simplified */}
        <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Travel Dates *</Label>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">When would you like to travel?</p>
              </div>
            {formData.preferredDates.length > 0 && (
              <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
                {formData.preferredDates.length} {formData.preferredDates.length === 1 ? 'date' : 'dates'}
              </Badge>
            )}
          </div>

          {/* Date Picker */}
          <div className="bg-gray-50 rounded-xl p-6 space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-medium text-gray-700">Start Date</Label>
                <DateInput
                  date={selectedDateRange.from}
                  onDateChange={(date) => setSelectedDateRange(prev => ({ ...prev, from: date }))}
                  placeholder="Select start date"
                  minDate={new Date()}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-medium text-gray-700">End Date</Label>
                <DateInput
                  date={selectedDateRange.to}
                  onDateChange={(date) => setSelectedDateRange(prev => ({ ...prev, to: date }))}
                  placeholder="Select end date"
                  minDate={selectedDateRange.from || new Date()}
                  disabled={!selectedDateRange.from}
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="flexible"
                  checked={isFlexible}
                  onCheckedChange={(checked) => setIsFlexible(checked === true)}
                />
                <Label htmlFor="flexible" className="text-sm text-gray-600 cursor-pointer">
                  Flexible dates (±3 days)
                </Label>
              </div>

              <Button
                onClick={() => addDateRange('preferred')}
                disabled={!selectedDateRange.from || !selectedDateRange.to}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add
              </Button>
            </div>
          </div>

          {/* Selected Dates Display */}
          {formData.preferredDates.length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Selected Dates</Label>
              <div className="space-y-2">
                {formData.preferredDates.map((dateRange, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <CalendarIcon className="h-4 w-4 text-blue-600" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {format(new Date(dateRange.start), "MMM dd")} - {format(new Date(dateRange.end), "MMM dd, yyyy")}
                        </p>
                        {dateRange.flexible && (
                          <p className="text-xs text-gray-500 mt-0.5">Flexible ±3 days</p>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeDateRange('preferred', index)}
                      className="text-gray-400 hover:text-red-600 hover:bg-red-50"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {formErrors.preferredDates && (
            <p className="text-sm text-red-600">{formErrors.preferredDates}</p>
          )}
        </div>
      </>
    );
  }

  function renderGroupStep() {
    return (
      <>
        <div className="space-y-1">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Who's traveling?</h2>
          <p className="text-gray-600 dark:text-gray-300 text-sm">Tell us about your group</p>
        </div>

        {/* Group Size - Clear Visual Hierarchy */}
        <div className="grid sm:grid-cols-2 gap-6">
          <div className="space-y-4">
            <Label className="text-sm font-medium text-gray-700">Adults (18+)</Label>
            <div className="flex items-center bg-gray-50 rounded-xl p-4">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => updateGroupComposition(Math.max(1, formData.groupComposition.adults - 1), formData.groupComposition.children)}
                disabled={formData.groupComposition.adults <= 1}
                className="h-12 w-12 rounded-full border-gray-300 hover:bg-white disabled:opacity-30"
              >
                <span className="text-lg">−</span>
              </Button>
              <div className="flex-1 text-center">
                <div className="text-3xl font-semibold text-gray-900">{formData.groupComposition.adults}</div>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => updateGroupComposition(formData.groupComposition.adults + 1, formData.groupComposition.children)}
                className="h-12 w-12 rounded-full border-gray-300 hover:bg-white"
              >
                <span className="text-lg">+</span>
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <Label className="text-sm font-medium text-gray-700">Children (under 18)</Label>
            <div className="flex items-center bg-gray-50 rounded-xl p-4">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => updateGroupComposition(formData.groupComposition.adults, Math.max(0, formData.groupComposition.children - 1))}
                disabled={formData.groupComposition.children <= 0}
                className="h-12 w-12 rounded-full border-gray-300 hover:bg-white disabled:opacity-30"
              >
                <span className="text-lg">−</span>
              </Button>
              <div className="flex-1 text-center">
                <div className="text-3xl font-semibold text-gray-900">{formData.groupComposition.children}</div>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => updateGroupComposition(formData.groupComposition.adults, formData.groupComposition.children + 1)}
                className="h-12 w-12 rounded-full border-gray-300 hover:bg-white"
              >
                <span className="text-lg">+</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Summary Card */}
        <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
          <div className="flex items-center gap-2 mb-3">
            <Users className="h-5 w-5 text-blue-600" />
            <h3 className="text-sm font-medium text-blue-900">Trip Summary</h3>
          </div>
          <p className="text-2xl font-semibold text-blue-900">
            {formData.groupSize} {formData.groupSize === 1 ? 'Traveler' : 'Travelers'}
          </p>
          <p className="text-sm text-blue-700 mt-1">
            {formData.groupComposition.adults} {formData.groupComposition.adults === 1 ? 'adult' : 'adults'}
            {formData.groupComposition.children > 0 && `, ${formData.groupComposition.children} ${formData.groupComposition.children === 1 ? 'child' : 'children'}`}
          </p>
        </div>

        {/* Special Occasion - Optional */}
        <div className="space-y-3 pt-4">
          <Label className="text-sm font-medium text-gray-700">
            Special Occasion <span className="text-gray-400 font-normal">(Optional)</span>
          </Label>
          <Select
            value={formData.specialOccasion}
            onValueChange={(value) => updateFormData('specialOccasion', value)}
          >
            <SelectTrigger className="h-12 border-gray-200 bg-white">
              <SelectValue placeholder="Is this trip for a special occasion?" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="honeymoon">Honeymoon</SelectItem>
              <SelectItem value="anniversary">Anniversary</SelectItem>
              <SelectItem value="birthday">Birthday Celebration</SelectItem>
              <SelectItem value="family-reunion">Family Reunion</SelectItem>
              <SelectItem value="graduation">Graduation Trip</SelectItem>
              <SelectItem value="retirement">Retirement Celebration</SelectItem>
              <SelectItem value="other">Other Special Occasion</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </>
    );
  }

  function renderBudgetStep() {
    return (
      <>
        <div className="space-y-1">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">What's your budget?</h2>
          <p className="text-gray-600 dark:text-gray-300 text-sm">Set your comfortable spending range</p>
        </div>

        {/* Budget Display */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
          <p className="text-sm text-green-700 mb-2">Budget Range</p>
          <p className="text-3xl font-semibold text-green-900">
            ₹{formData.budgetRange.min.toLocaleString()} - ₹{formData.budgetRange.max.toLocaleString()}
          </p>
          <p className="text-sm text-green-700 mt-2">
            {formData.budgetRange.perPerson ? 'Per person' : 'Total for group'}
          </p>
        </div>

        {/* Budget Sliders */}
        <div className="space-y-8">
          <div className="space-y-4">
            <Label className="text-sm font-medium text-gray-700">
              Minimum Budget: ₹{formData.budgetRange.min.toLocaleString()}
            </Label>
            <Slider
              value={[formData.budgetRange.min]}
              onValueChange={([value]) => updateFormData('budgetRange', {...formData.budgetRange, min: value})}
              max={500000}
              min={10000}
              step={5000}
              className="w-full"
            />
          </div>

          <div className="space-y-4">
            <Label className="text-sm font-medium text-gray-700">
              Maximum Budget: ₹{formData.budgetRange.max.toLocaleString()}
            </Label>
            <Slider
              value={[formData.budgetRange.max]}
              onValueChange={([value]) => updateFormData('budgetRange', {...formData.budgetRange, max: value})}
              max={1000000}
              min={formData.budgetRange.min + 10000}
              step={5000}
              className="w-full"
            />
          </div>

          <div className="flex items-center space-x-2 pt-2">
            <Checkbox
              id="perPerson"
              checked={formData.budgetRange.perPerson}
              onCheckedChange={(checked) => updateFormData('budgetRange', {...formData.budgetRange, perPerson: checked})}
            />
            <Label htmlFor="perPerson" className="text-sm text-gray-600 cursor-pointer">
              This budget is per person
            </Label>
          </div>
        </div>

        {/* Accommodation */}
        <div className="space-y-4 pt-4">
          <Label className="text-sm font-medium text-gray-700">Accommodation Style *</Label>
          <div className="grid sm:grid-cols-3 gap-3">
            {ACCOMMODATION_OPTIONS.map((option) => {
              const isSelected = formData.accommodationPreference === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => updateFormData('accommodationPreference', option.id)}
                  className={cn(
                    "p-4 rounded-xl border-2 text-left transition-all",
                    isSelected
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 bg-white hover:border-gray-300"
                  )}
                >
                  <option.icon className={cn("h-5 w-5 mb-2", isSelected ? "text-blue-600" : "text-gray-600")} />
                  <p className="font-medium text-gray-900 text-sm">{option.label}</p>
                  <p className="text-xs text-gray-600 mt-1">{option.description}</p>
                  <p className="text-xs text-gray-500 mt-2">{option.price}</p>
                </button>
              );
            })}
          </div>
          {formErrors.accommodation && (
            <p className="text-sm text-red-600">{formErrors.accommodation}</p>
          )}
        </div>

        {/* Transportation */}
        <div className="space-y-3">
          <Label className="text-sm font-medium text-gray-700">Preferred Transportation *</Label>
          <Select
            value={formData.transportationPreference}
            onValueChange={(value) => updateFormData('transportationPreference', value)}
          >
            <SelectTrigger className="h-12 border-gray-200 bg-white">
              <SelectValue placeholder="How would you like to travel?" />
            </SelectTrigger>
            <SelectContent>
              {TRANSPORTATION_OPTIONS.map((option) => (
                <SelectItem key={option.id} value={option.id}>
                  <div className="flex items-center gap-2">
                    <option.icon className="h-4 w-4" />
                    <span>{option.label}</span>
                    <span className="text-xs text-gray-500">- {option.description}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {formErrors.transportation && (
            <p className="text-sm text-red-600">{formErrors.transportation}</p>
          )}
        </div>
      </>
    );
  }

  function renderActivitiesStep() {
    return (
      <>
        <div className="space-y-1">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">What experiences do you want?</h2>
          <p className="text-gray-600 dark:text-gray-300 text-sm">Select all activities that interest you</p>
        </div>

        {/* Activity Selection - Grid Layout */}
        <div className="space-y-4">
          {formData.activityPreferences.length > 0 && (
            <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
              {formData.activityPreferences.length} selected
            </Badge>
          )}

          <div className="grid sm:grid-cols-2 gap-3">
            {ACTIVITY_OPTIONS.map((activity) => {
              const isSelected = formData.activityPreferences.includes(activity.id);
              return (
                <button
                  key={activity.id}
                  type="button"
                  onClick={() => toggleActivityPreference(activity.id)}
                  className={cn(
                    "p-4 rounded-xl border-2 text-left transition-all relative",
                    isSelected
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 bg-white hover:border-gray-300"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      "p-2 rounded-lg shrink-0",
                      isSelected ? "bg-blue-100" : "bg-gray-100"
                    )}>
                      <activity.icon className={cn("h-5 w-5", isSelected ? "text-blue-600" : "text-gray-600")} />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 text-sm">{activity.label}</p>
                      <p className="text-xs text-gray-600 mt-0.5">{activity.description}</p>
                    </div>
                    {isSelected && (
                      <CheckCircle className="h-5 w-5 text-blue-600 shrink-0" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
          {formErrors.activities && (
            <p className="text-sm text-red-600">{formErrors.activities}</p>
          )}
        </div>

        {/* Meal Preferences */}
        <div className="space-y-3 pt-4">
          <Label className="text-sm font-medium text-gray-700">Dietary Preferences *</Label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {MEAL_PREFERENCES.map((meal) => {
              const isSelected = formData.mealPreferences.includes(meal.id);
              return (
                <button
                  key={meal.id}
                  type="button"
                  onClick={() => toggleMealPreference(meal.id)}
                  className={cn(
                    "p-3 rounded-lg border text-center transition-all text-sm",
                    isSelected
                      ? "border-green-500 bg-green-50 text-green-900"
                      : "border-gray-200 bg-white hover:border-gray-300 text-gray-700"
                  )}
                >
                  <span className="text-lg mb-1 block">{meal.icon}</span>
                  {meal.label}
                </button>
              );
            })}
          </div>
          {formErrors.meals && (
            <p className="text-sm text-red-600">{formErrors.meals}</p>
          )}
        </div>
      </>
    );
  }

  function renderFinalStep() {
    return (
      <>
        <div className="space-y-1">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Almost done!</h2>
          <p className="text-gray-600 dark:text-gray-300 text-sm">Add any final details</p>
        </div>

        {/* Special Requirements */}
        <div className="space-y-3">
          <Label className="text-sm font-medium text-gray-700">
            Special Requirements <span className="text-gray-400 font-normal">(Optional)</span>
          </Label>
          <Textarea
            value={formData.specialRequirements}
            onChange={(e) => updateFormData('specialRequirements', e.target.value)}
            placeholder="Any medical conditions, accessibility needs, or special accommodations..."
            className="min-h-[100px] border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 resize-none"
          />
        </div>

        {/* Contact Preferences */}
        <div className="space-y-4 pt-4">
          <Label className="text-sm font-medium text-gray-700">How should we contact you? *</Label>
          <div className="grid sm:grid-cols-3 gap-3">
            {CONTACT_METHODS.map((method) => {
              const isSelected = formData.preferredContactMethod === method.id;
              return (
                <button
                  key={method.id}
                  type="button"
                  onClick={() => updateFormData('preferredContactMethod', method.id)}
                  className={cn(
                    "p-4 rounded-xl border-2 text-center transition-all",
                    isSelected
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 bg-white hover:border-gray-300"
                  )}
                >
                  <method.icon className={cn("h-5 w-5 mx-auto mb-2", isSelected ? "text-blue-600" : "text-gray-600")} />
                  <p className="font-medium text-gray-900 text-sm">{method.label}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Additional Notes */}
        <div className="space-y-3">
          <Label className="text-sm font-medium text-gray-700">
            Additional Notes <span className="text-gray-400 font-normal">(Optional)</span>
          </Label>
          <Textarea
            value={formData.additionalNotes}
            onChange={(e) => updateFormData('additionalNotes', e.target.value)}
            placeholder="Anything else you'd like us to know about your ideal trip..."
            className="min-h-[100px] border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 resize-none"
          />
        </div>

        {/* Summary */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200 mt-8">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <h3 className="text-sm font-medium text-green-900">Your Request Summary</h3>
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-green-700">Destination:</span>
              <span className="text-green-900 font-medium">{formData.destination || 'Not specified'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-green-700">Travelers:</span>
              <span className="text-green-900 font-medium">{formData.groupSize} people</span>
            </div>
            <div className="flex justify-between">
              <span className="text-green-700">Budget:</span>
              <span className="text-green-900 font-medium">
                ₹{formData.budgetRange.min.toLocaleString()} - ₹{formData.budgetRange.max.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-green-700">Activities:</span>
              <span className="text-green-900 font-medium">{formData.activityPreferences.length} selected</span>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-green-200">
            <p className="text-sm text-green-800 font-medium mb-2">What happens next?</p>
            <ul className="text-xs text-green-700 space-y-1.5">
              <li className="flex items-start gap-2">
                <CheckCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                <span>We'll review your request within 24 hours</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                <span>Our experts will create a personalized itinerary</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                <span>You'll receive a detailed proposal via your preferred method</span>
              </li>
            </ul>
          </div>
        </div>
      </>
    );
  }
}
