"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Send,
  MessageCircle,
  Users,
  CreditCard,
  AlertTriangle,
  Facebook,
  Twitter,
  Instagram,
  Youtube
} from "lucide-react";
import { toast } from "react-hot-toast";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
    inquiryType: "general"
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const contactInfo = [
    {
      icon: MapPin,
      title: "Visit Our Office",
      details: [
        "123 Travel Street, Suite 456",
        "New York, NY 10001",
        "United States"
      ]
    },
    {
      icon: Phone,
      title: "Call Us",
      details: [
        "Sales: +1 (555) 123-4567",
        "Support: +1 (555) 123-4568",
        "Emergency: +1 (555) 911-HELP"
      ]
    },
    {
      icon: Mail,
      title: "Email Us",
      details: [
        "info@travelagency.com",
        "bookings@travelagency.com",
        "support@travelagency.com"
      ]
    },
    {
      icon: Clock,
      title: "Business Hours",
      details: [
        "Monday - Friday: 9:00 AM - 7:00 PM",
        "Saturday: 10:00 AM - 5:00 PM",
        "Sunday: 11:00 AM - 4:00 PM"
      ]
    }
  ];

  const inquiryTypes = [
    { value: "general", label: "General Inquiry", icon: MessageCircle },
    { value: "booking", label: "New Booking", icon: Users },
    { value: "support", label: "Booking Support", icon: CreditCard },
    { value: "emergency", label: "Travel Emergency", icon: AlertTriangle }
  ];

  const faqs = [
    {
      question: "How far in advance should I book my tour?",
      answer: "We recommend booking at least 30-60 days in advance for popular destinations. For peak seasons or special events, booking 90+ days ahead is ideal to ensure availability."
    },
    {
      question: "What is your cancellation policy?",
      answer: "Free cancellation up to 14 days before departure. Cancellations 7-14 days before incur a 50% charge. Within 7 days, tours are non-refundable except in emergencies."
    },
    {
      question: "Do you offer travel insurance?",
      answer: "Yes, we partner with leading travel insurance providers to offer comprehensive coverage options. We highly recommend travel insurance for all international trips."
    },
    {
      question: "What's included in the tour price?",
      answer: "Tour prices typically include accommodation, meals as specified, transportation, guided activities, and entrance fees. International flights are usually separate unless specified."
    },
    {
      question: "Can I customize a tour?",
      answer: "Absolutely! We offer custom tour planning services. Contact us to discuss your preferences, and we'll create a personalized itinerary just for you."
    },
    {
      question: "What if I have dietary restrictions?",
      answer: "We accommodate various dietary needs including vegetarian, vegan, gluten-free, and religious dietary requirements. Please inform us during booking."
    }
  ];

  const socialLinks = [
    { name: "Facebook", icon: Facebook, href: "#", color: "text-blue-600" },
    { name: "Twitter", icon: Twitter, href: "#", color: "text-blue-400" },
    { name: "Instagram", icon: Instagram, href: "#", color: "text-pink-600" },
    { name: "YouTube", icon: Youtube, href: "#", color: "text-red-600" }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success(result.message);
        setFormData({
          name: "",
          email: "",
          phone: "",
          subject: "",
          message: "",
          inquiryType: "general"
        });
      } else {
        toast.error(result.error || "Failed to send message. Please try again.");
      }
    } catch (error) {
      console.error('Contact form error:', error);
      toast.error("Failed to send message. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-16">
      {/* Hero Section */}
      <section className="text-center space-y-6">
        <div className="space-y-4">
          <Badge variant="secondary" className="text-sm px-3 py-1">
            Contact TravelAgency
          </Badge>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Get in Touch with Our Travel Experts
          </h1>
          <p className="text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
            Have questions about your next adventure? Need help planning the perfect trip? 
            Our experienced travel consultants are here to help you every step of the way.
          </p>
        </div>
      </section>

      {/* Contact Form & Info */}
      <section className="grid lg:grid-cols-3 gap-12">
        {/* Contact Form */}
        <div className="lg:col-span-2">
          <Card className="p-8">
            <CardHeader className="p-0 mb-6">
              <CardTitle className="text-2xl">Send us a Message</CardTitle>
              <p className="text-muted-foreground">
                Fill out the form below and we'll get back to you within 24 hours.
              </p>
            </CardHeader>
            <CardContent className="p-0">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Inquiry Type */}
                <div className="space-y-3">
                  <Label>Type of Inquiry</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {inquiryTypes.map((type) => {
                      const Icon = type.icon;
                      return (
                        <label
                          key={type.value}
                          className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                            formData.inquiryType === type.value
                              ? 'border-primary bg-primary/5'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <input
                            type="radio"
                            value={type.value}
                            checked={formData.inquiryType === type.value}
                            onChange={(e) => handleInputChange('inquiryType', e.target.value)}
                            className="sr-only"
                          />
                          <Icon className={`h-4 w-4 ${formData.inquiryType === type.value ? 'text-primary' : 'text-gray-400'}`} />
                          <span className={`text-sm ${formData.inquiryType === type.value ? 'text-primary font-medium' : 'text-gray-600'}`}>
                            {type.label}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Name & Email */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                </div>

                {/* Phone & Subject */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="Enter your phone number"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject *</Label>
                    <Input
                      id="subject"
                      value={formData.subject}
                      onChange={(e) => handleInputChange('subject', e.target.value)}
                      placeholder="Brief subject of your inquiry"
                      required
                    />
                  </div>
                </div>

                {/* Message */}
                <div className="space-y-2">
                  <Label htmlFor="message">Message *</Label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => handleInputChange('message', e.target.value)}
                    placeholder="Tell us about your travel plans, questions, or how we can help you..."
                    rows={5}
                    required
                  />
                </div>

                {/* Submit Button */}
                <Button type="submit" size="lg" disabled={isSubmitting} className="w-full">
                  {isSubmitting ? (
                    <>Sending...</>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Send Message
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Contact Information */}
        <div className="space-y-6">
          {contactInfo.map((info, index) => {
            const Icon = info.icon;
            return (
              <Card key={index} className="p-6">
                <CardContent className="p-0 space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="font-semibold text-lg">{info.title}</h3>
                  </div>
                  <div className="ml-13 space-y-1">
                    {info.details.map((detail, idx) => (
                      <p key={idx} className="text-muted-foreground">
                        {detail}
                      </p>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {/* Social Media */}
          <Card className="p-6">
            <CardContent className="p-0 space-y-4">
              <h3 className="font-semibold text-lg">Follow Us</h3>
              <div className="flex space-x-4">
                {socialLinks.map((social) => {
                  const Icon = social.icon;
                  return (
                    <a
                      key={social.name}
                      href={social.href}
                      className={`w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center transition-colors hover:border-gray-300 ${social.color} hover:bg-gray-50`}
                      aria-label={`Follow us on ${social.name}`}
                    >
                      <Icon className="h-5 w-5" />
                    </a>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="space-y-8">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold">Frequently Asked Questions</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Find quick answers to common questions about our tours and services.
          </p>
        </div>
        <div className="grid lg:grid-cols-2 gap-6">
          {faqs.map((faq, index) => (
            <Card key={index} className="p-6">
              <CardContent className="p-0 space-y-3">
                <h3 className="font-semibold text-lg">{faq.question}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {faq.answer}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Emergency Contact */}
      <section className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-xl p-8">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-red-800">Travel Emergency Support</h2>
            <p className="text-red-700 max-w-2xl mx-auto">
              If you're currently traveling and need immediate assistance, please contact our 24/7 emergency hotline.
            </p>
          </div>
          <div className="space-y-2">
            <p className="text-xl font-semibold text-red-800">Emergency Hotline: +1 (555) 911-HELP</p>
            <p className="text-red-600">Available 24 hours a day, 7 days a week</p>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="space-y-8">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold">Visit Our Office</h2>
          <p className="text-xl text-muted-foreground">
            Stop by our office for personalized travel planning assistance.
          </p>
        </div>
        <Card className="overflow-hidden">
          <div className="h-96 bg-gradient-to-r from-gray-100 to-gray-200 flex items-center justify-center">
            <div className="text-center space-y-2">
              <MapPin className="h-12 w-12 text-primary mx-auto" />
              <div>
                <p className="font-semibold">Interactive Map</p>
                <p className="text-sm text-muted-foreground">123 Travel Street, Suite 456, New York, NY 10001</p>
              </div>
            </div>
          </div>
        </Card>
      </section>
    </div>
  );
}
