"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X, Plus, MapPin, Calendar, Users, Star, Clock } from "lucide-react";
import toast from "react-hot-toast";

interface TourFormData {
  name: string;
  title: string;
  description: string;
  location: string;
  duration: string;
  pricePerPerson: string;
  category: string;
  difficulty: string;
  maxGroupSize: string;
  startDates: string[];
  included: string[];
  notIncluded: string[];
  itinerary: Array<{day: number; title: string; description: string}>;
}

export default function CreateTourForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<TourFormData>({
    name: "",
    title: "",
    description: "",
    location: "",
    duration: "",
    pricePerPerson: "",
    category: "",
    difficulty: "",
    maxGroupSize: "",
    startDates: [],
    included: [],
    notIncluded: [],
    itinerary: [{ day: 1, title: "", description: "" }]
  });

  // State for adding items
  const [newStartDate, setNewStartDate] = useState("");
  const [newIncluded, setNewIncluded] = useState("");
  const [newNotIncluded, setNewNotIncluded] = useState("");

  const handleInputChange = (field: keyof TourFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addStartDate = () => {
    if (newStartDate && !formData.startDates.includes(newStartDate)) {
      setFormData(prev => ({
        ...prev,
        startDates: [...prev.startDates, newStartDate]
      }));
      setNewStartDate("");
    }
  };

  const removeStartDate = (date: string) => {
    setFormData(prev => ({
      ...prev,
      startDates: prev.startDates.filter(d => d !== date)
    }));
  };

  const addIncluded = () => {
    if (newIncluded && !formData.included.includes(newIncluded)) {
      setFormData(prev => ({
        ...prev,
        included: [...prev.included, newIncluded]
      }));
      setNewIncluded("");
    }
  };

  const removeIncluded = (item: string) => {
    setFormData(prev => ({
      ...prev,
      included: prev.included.filter(i => i !== item)
    }));
  };

  const addNotIncluded = () => {
    if (newNotIncluded && !formData.notIncluded.includes(newNotIncluded)) {
      setFormData(prev => ({
        ...prev,
        notIncluded: [...prev.notIncluded, newNotIncluded]
      }));
      setNewNotIncluded("");
    }
  };

  const removeNotIncluded = (item: string) => {
    setFormData(prev => ({
      ...prev,
      notIncluded: prev.notIncluded.filter(i => i !== item)
    }));
  };

  const updateItinerary = (index: number, field: 'title' | 'description', value: string) => {
    setFormData(prev => ({
      ...prev,
      itinerary: prev.itinerary.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const addItineraryDay = () => {
    setFormData(prev => ({
      ...prev,
      itinerary: [...prev.itinerary, { 
        day: prev.itinerary.length + 1, 
        title: "", 
        description: "" 
      }]
    }));
  };

  const removeItineraryDay = (index: number) => {
    if (formData.itinerary.length > 1) {
      setFormData(prev => ({
        ...prev,
        itinerary: prev.itinerary.filter((_, i) => i !== index)
          .map((item, i) => ({ ...item, day: i + 1 }))
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name || !formData.description || !formData.location || !formData.duration || !formData.pricePerPerson) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (formData.startDates.length === 0) {
      toast.error("Please add at least one start date");
      return;
    }

    if (formData.included.length === 0) {
      toast.error("Please add what's included in the tour");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/tours/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          duration: parseInt(formData.duration),
          pricePerPerson: parseFloat(formData.pricePerPerson),
          maxGroupSize: parseInt(formData.maxGroupSize || '10'),
          price: parseFloat(formData.pricePerPerson), // Copy for compatibility
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create tour');
      }

      toast.success("Tour submitted successfully! You'll receive an email once it's reviewed by our team.");
      router.push('/profile');
    } catch (error) {
      console.error('Error creating tour:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create tour');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Basic Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Tour Name *</Label>
              <Input
                id="name"
                placeholder="e.g., Amazing Himalayan Trek"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location *</Label>
              <Input
                id="location"
                placeholder="e.g., Himalayas, Nepal"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Tour Title *</Label>
            <Input
              id="title"
              placeholder="Brief catchy title for your tour"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              placeholder="Detailed description of your tour, what makes it special..."
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={4}
              required
            />
          </div>
        </CardContent>
      </Card>

      {/* Tour Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Tour Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="duration">Duration (days) *</Label>
              <Input
                id="duration"
                type="number"
                min="1"
                placeholder="7"
                value={formData.duration}
                onChange={(e) => handleInputChange('duration', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pricePerPerson">Price Per Person (₹) *</Label>
              <Input
                id="pricePerPerson"
                type="number"
                min="0"
                step="0.01"
                placeholder="25000"
                value={formData.pricePerPerson}
                onChange={(e) => handleInputChange('pricePerPerson', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxGroupSize">Max Group Size</Label>
              <Input
                id="maxGroupSize"
                type="number"
                min="1"
                placeholder="10"
                value={formData.maxGroupSize}
                onChange={(e) => handleInputChange('maxGroupSize', e.target.value)}
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select onValueChange={(value) => handleInputChange('category', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Adventure">Adventure</SelectItem>
                  <SelectItem value="Cultural">Cultural</SelectItem>
                  <SelectItem value="Nature">Nature</SelectItem>
                  <SelectItem value="Beach">Beach</SelectItem>
                  <SelectItem value="Mountain">Mountain</SelectItem>
                  <SelectItem value="City">City</SelectItem>
                  <SelectItem value="Wildlife">Wildlife</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="difficulty">Difficulty</Label>
              <Select onValueChange={(value) => handleInputChange('difficulty', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Easy">Easy</SelectItem>
                  <SelectItem value="Moderate">Moderate</SelectItem>
                  <SelectItem value="Challenging">Challenging</SelectItem>
                  <SelectItem value="Difficult">Difficult</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Start Dates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Available Start Dates
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              type="date"
              value={newStartDate}
              onChange={(e) => setNewStartDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
            />
            <Button type="button" onClick={addStartDate}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.startDates.map((date) => (
              <Badge key={date} variant="secondary" className="gap-1">
                {new Date(date).toLocaleDateString()}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => removeStartDate(date)}
                />
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* What's Included */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            What's Included
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="e.g., Accommodation, Meals, Guide"
              value={newIncluded}
              onChange={(e) => setNewIncluded(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addIncluded())}
            />
            <Button type="button" onClick={addIncluded}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.included.map((item, index) => (
              <Badge key={index} variant="secondary" className="gap-1">
                {item}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => removeIncluded(item)}
                />
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* What's Not Included */}
      <Card>
        <CardHeader>
          <CardTitle>What's Not Included</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="e.g., International flights, Visa fees"
              value={newNotIncluded}
              onChange={(e) => setNewNotIncluded(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addNotIncluded())}
            />
            <Button type="button" onClick={addNotIncluded}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.notIncluded.map((item, index) => (
              <Badge key={index} variant="outline" className="gap-1">
                {item}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => removeNotIncluded(item)}
                />
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Itinerary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Daily Itinerary
            </span>
            <Button type="button" onClick={addItineraryDay} size="sm">
              <Plus className="h-4 w-4 mr-1" />
              Add Day
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {formData.itinerary.map((day, index) => (
            <div key={index} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold">Day {day.day}</h4>
                {formData.itinerary.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeItineraryDay(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <div className="grid gap-3">
                <Input
                  placeholder="Day title (e.g., Arrival in Kathmandu)"
                  value={day.title}
                  onChange={(e) => updateItinerary(index, 'title', e.target.value)}
                />
                <Textarea
                  placeholder="Day description..."
                  value={day.description}
                  onChange={(e) => updateItinerary(index, 'description', e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Submit */}
      <Card>
        <CardContent className="pt-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h4 className="font-semibold text-blue-900 mb-2">Review Process</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Your tour will be reviewed by our team within 2-3 business days</li>
              <li>• You'll receive an email notification once approved or if changes are needed</li>
              <li>• Approved tours will be available for booking with secure payment processing</li>
              <li>• You'll earn commission on each booking made through your custom tour</li>
            </ul>
          </div>

          <Button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700"
            size="lg"
            disabled={loading}
          >
            {loading ? "Submitting..." : "Submit Tour for Review"}
          </Button>
        </CardContent>
      </Card>
    </form>
  );
}
