import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  MapPin, 
  Users, 
  Shield, 
  Award, 
  Globe, 
  Heart, 
  Star,
  CheckCircle,
  Calendar,
  Compass
} from "lucide-react";
import Link from "next/link";

export default function AboutPage() {
  const stats = [
    { label: "Years of Experience", value: "15+", icon: Calendar },
    { label: "Happy Travelers", value: "50,000+", icon: Users },
    { label: "Destinations", value: "120+", icon: Globe },
    { label: "Expert Guides", value: "200+", icon: Compass },
  ];

  const values = [
    {
      icon: Shield,
      title: "Safety First",
      description: "Your safety is our top priority. All our tours include comprehensive safety measures and experienced guides."
    },
    {
      icon: Heart,
      title: "Authentic Experiences",
      description: "We focus on creating genuine, immersive experiences that connect you with local culture and communities."
    },
    {
      icon: Star,
      title: "Excellence",
      description: "We maintain the highest standards in everything we do, from tour planning to customer service."
    },
    {
      icon: Globe,
      title: "Sustainable Travel",
      description: "We're committed to responsible tourism that benefits local communities and preserves our planet."
    }
  ];

  const team = [
    {
      name: "Sarah Johnson",
      role: "Founder & CEO",
      image: "/api/placeholder/150/150",
      description: "With over 20 years in travel industry, Sarah founded TravelAgency to make extraordinary travel accessible to everyone."
    },
    {
      name: "Michael Chen",
      role: "Head of Operations",
      image: "/api/placeholder/150/150", 
      description: "Michael ensures every tour runs smoothly with his extensive experience in logistics and destination management."
    },
    {
      name: "Elena Rodriguez",
      role: "Cultural Experience Director",
      image: "/api/placeholder/150/150",
      description: "Elena curates authentic cultural experiences and maintains relationships with local communities worldwide."
    },
    {
      name: "David Thompson",
      role: "Adventure Tour Specialist", 
      image: "/api/placeholder/150/150",
      description: "David leads our adventure tours with his expertise in mountaineering, trekking, and outdoor safety."
    }
  ];

  const certifications = [
    { name: "IATA Certified", description: "International Air Transport Association member" },
    { name: "ASTA Member", description: "American Society of Travel Advisors" },
    { name: "ISO 9001", description: "Quality Management System certified" },
    { name: "TripAdvisor Excellence", description: "Certificate of Excellence winner 5 years running" }
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-16">
      {/* Hero Section */}
      <section className="text-center space-y-6">
        <div className="space-y-4">
          <Badge variant="secondary" className="text-sm px-3 py-1">
            About TravelAgency
          </Badge>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Crafting Unforgettable Journeys Since 2009
          </h1>
          <p className="text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
            We believe that travel has the power to transform lives, create lasting memories, and build bridges between cultures. 
            For over 15 years, we've been dedicated to curating exceptional travel experiences that go beyond the ordinary.
          </p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="text-center p-6 hover:shadow-lg transition-shadow">
              <CardContent className="space-y-3 p-0">
                <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <div className="text-3xl font-bold text-primary">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </section>

      {/* Our Story */}
      <section className="grid lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <div>
            <h2 className="text-3xl font-bold mb-4">Our Story</h2>
            <div className="space-y-4 text-muted-foreground">
              <p>
                Founded in 2009 by Sarah Johnson, TravelAgency began as a small boutique travel company with a simple mission: 
                to create meaningful travel experiences that connect people with the world's most incredible destinations.
              </p>
              <p>
                What started as a passion for exploring hidden gems and sharing them with fellow travelers has grown into 
                a trusted global travel company. We've helped over 50,000 travelers discover the world through carefully 
                crafted tours that balance adventure, culture, and comfort.
              </p>
              <p>
                Today, our team of experienced travel experts continues to scout new destinations, build relationships with 
                local communities, and design tours that create lasting memories while respecting the places we visit.
              </p>
            </div>
          </div>
          <Button size="lg" asChild>
            <Link href="/tours">
              Explore Our Tours
            </Link>
          </Button>
        </div>
        <div className="relative">
          <img 
            src="/api/placeholder/600/400" 
            alt="Our team planning tours" 
            className="rounded-xl shadow-lg w-full"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-xl" />
        </div>
      </section>

      {/* Our Values */}
      <section className="space-y-8">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold">Our Values</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            These core principles guide everything we do, from planning your journey to ensuring you return home with incredible memories.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map((value, index) => {
            const Icon = value.icon;
            return (
              <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
                <CardContent className="space-y-4 p-0">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">{value.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {value.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Meet Our Team */}
      <section className="space-y-8">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold">Meet Our Team</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Our passionate team of travel experts brings decades of combined experience to craft your perfect journey.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {team.map((member, index) => (
            <Card key={index} className="text-center p-6 hover:shadow-lg transition-shadow">
              <CardContent className="space-y-4 p-0">
                <img 
                  src={member.image} 
                  alt={member.name}
                  className="w-24 h-24 rounded-full mx-auto object-cover"
                />
                <div>
                  <h3 className="font-semibold text-lg">{member.name}</h3>
                  <p className="text-primary text-sm font-medium mb-2">{member.role}</p>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {member.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Certifications & Awards */}
      <section className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-xl p-8 space-y-8">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold">Certifications & Awards</h2>
          <p className="text-xl text-muted-foreground">
            Recognition of our commitment to excellence and industry standards
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {certifications.map((cert, index) => (
            <Card key={index} className="p-6 bg-white/50 backdrop-blur-sm">
              <CardContent className="text-center space-y-3 p-0">
                <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <Award className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">{cert.name}</h3>
                  <p className="text-sm text-muted-foreground">{cert.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="space-y-8">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold">Why Choose TravelAgency?</h2>
        </div>
        <div className="grid lg:grid-cols-3 gap-8">
          <Card className="p-6">
            <CardContent className="space-y-4 p-0">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <div>
                <h3 className="font-semibold text-lg mb-2">Expert Local Guides</h3>
                <p className="text-muted-foreground">
                  Our certified local guides provide insider knowledge and authentic cultural insights you won't find in guidebooks.
                </p>
              </div>
            </CardContent>
          </Card>
          <Card className="p-6">
            <CardContent className="space-y-4 p-0">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <div>
                <h3 className="font-semibold text-lg mb-2">Small Group Experience</h3>
                <p className="text-muted-foreground">
                  We keep our group sizes small (max 15 people) to ensure personalized attention and a more intimate travel experience.
                </p>
              </div>
            </CardContent>
          </Card>
          <Card className="p-6">
            <CardContent className="space-y-4 p-0">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <div>
                <h3 className="font-semibold text-lg mb-2">24/7 Support</h3>
                <p className="text-muted-foreground">
                  Our support team is available around the clock to assist you before, during, and after your journey.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl p-12 text-center space-y-6">
        <h2 className="text-3xl font-bold">Ready to Start Your Adventure?</h2>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Join thousands of satisfied travelers who have trusted us to create their perfect journey.
        </p>
        <div className="flex gap-4 justify-center">
          <Button size="lg" asChild>
            <Link href="/tours">Browse Our Tours</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/contact">Contact Us</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
