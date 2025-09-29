"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "react-hot-toast";

const TourSchema = z.object({
  name: z.string().min(2),
  title: z.string().min(2),
  description: z.string().min(10),
  location: z.string().min(2),
  duration: z.coerce.number().int().positive(),
  pricePerPerson: z.coerce.number().positive(),
  price: z.coerce.number().positive(),
  category: z.string().min(2),
  difficulty: z.string().min(2),
  maxGroupSize: z.coerce.number().int().positive(),
  imageUrl: z.string().url().optional().nullable(),
  images: z.string().optional(),
  status: z.enum(["Active", "Inactive"]).default("Active"),
  startDates: z.string().optional(),
  included: z.string().optional(),
  notIncluded: z.string().optional(),
  itinerary: z.string().optional(),
  featured: z.boolean().default(false),
});

export default function TourForm({ initialData }: { initialData?: any }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof TourSchema>>({
    resolver: zodResolver(TourSchema),
    defaultValues: initialData || {
      name: "",
      title: "",
      description: "",
      location: "",
      duration: 1,
      pricePerPerson: 0,
      price: 0,
      category: "",
      difficulty: "",
      maxGroupSize: 1,
      imageUrl: "",
      images: "",
      status: "Active",
      startDates: "",
      included: "",
      notIncluded: "",
      itinerary: "",
      featured: false,
    },
  });

  const onSubmit = async (values: z.infer<typeof TourSchema>) => {
    setIsSubmitting(true);
    try {
      const payload = {
        ...values,
        images: values.images ? values.images.split(",").map(s => s.trim()) : [],
        startDates: values.startDates ? values.startDates.split(",").map(s => s.trim()) : [],
        included: values.included ? values.included.split(",").map(s => s.trim()) : [],
        notIncluded: values.notIncluded ? values.notIncluded.split(",").map(s => s.trim()) : [],
        itinerary: values.itinerary ? values.itinerary.split("\n").map((line, i) => ({ day: i + 1, title: `Day ${i + 1}`, description: line.trim() })) : [],
      };

      const method = initialData ? "PUT" : "POST";
      const url = initialData ? `/api/admin/tours/${initialData.id}` : "/api/admin/tours";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Unknown error" }));
        throw new Error(err.error || "Failed to save tour");
      }

      toast.success(`Tour ${initialData ? "updated" : "created"} successfully`);
      router.push("/admin/tours");
      router.refresh();
    } catch (e: any) {
      toast.error(e.message || "Failed to save tour");
    } finally {
      setIsSubmitting(false);
    }
  };

  const { formState: { errors } } = form;

  return (
    <Card>
      <CardContent className="p-6 space-y-4">
        {Object.keys(errors).length > 0 && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4">
            <div className="text-sm text-red-800">
              <p className="font-medium">Please fix the following errors:</p>
              <ul className="mt-2 list-disc list-inside">
                {Object.entries(errors).map(([key, error]) => (
                  <li key={key}>{error?.message}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
        
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <Label>Name</Label>
              <Input {...form.register("name")} />
            </div>
            <div>
              <Label>Title</Label>
              <Input {...form.register("title")} />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea rows={6} {...form.register("description")} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Location</Label>
                <Input {...form.register("location")} />
              </div>
              <div>
                <Label>Category</Label>
                <Input {...form.register("category")} />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Duration (days)</Label>
                <Input type="number" {...form.register("duration")} />
              </div>
              <div>
                <Label>Max Group Size</Label>
                <Input type="number" {...form.register("maxGroupSize")} />
              </div>
              <div>
                <Label>Difficulty</Label>
                <Input {...form.register("difficulty")} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Price Per Person</Label>
                <Input type="number" step="0.01" {...form.register("pricePerPerson")} />
              </div>
              <div>
                <Label>Base Price</Label>
                <Input type="number" step="0.01" {...form.register("price")} />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label>Image URL</Label>
              <Input {...form.register("imageUrl")} />
            </div>
            <div>
              <Label>Images (comma-separated URLs)</Label>
              <Textarea rows={3} {...form.register("images")} />
            </div>
            <div>
              <Label>Start Dates (comma-separated yyyy-mm-dd)</Label>
              <Textarea rows={2} {...form.register("startDates")} />
            </div>
            <div>
              <Label>Included (comma-separated)</Label>
              <Textarea rows={2} {...form.register("included")} />
            </div>
            <div>
              <Label>Not Included (comma-separated)</Label>
              <Textarea rows={2} {...form.register("notIncluded")} />
            </div>
            <div>
              <Label>Itinerary (line per day)</Label>
              <Textarea rows={4} {...form.register("itinerary")} />
            </div>
            <div className="grid grid-cols-2 gap-4 items-center">
              <div>
                <Label>Status</Label>
                <Controller
                  name="status"
                  control={form.control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              <div className="flex items-center space-x-2 mt-6">
                <Controller
                  name="featured"
                  control={form.control}
                  render={({ field }) => (
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  )}
                />
                <Label>Featured</Label>
              </div>
            </div>
            <div className="pt-2">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : initialData ? "Save Changes" : "Create Tour"}
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

