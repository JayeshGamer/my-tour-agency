import Link from "next/link";
import { MapPin, Mail, Phone, Facebook, Twitter, Instagram, Youtube, Linkedin } from "lucide-react";
import { Button } from "../../src/components/ui/button";
import { Input } from "../../src/components/ui/input";
import { Separator } from "../../src/components/ui/separator";

export default function Footer() {
  return (
    <footer className="bg-black text-white border-t border-gray-800 mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <MapPin className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold text-white">TravelAgency</span>
            </div>
            <p className="text-sm text-gray-400">
              Discover amazing destinations and create unforgettable memories with our expertly crafted tours around the world.
            </p>
            <div className="flex space-x-3">
              <Button variant="ghost" size="icon" className="hover:bg-gray-800 text-white" asChild>
                <Link href="https://facebook.com" target="_blank" rel="noopener noreferrer">
                  <Facebook className="h-4 w-4" />
                </Link>
              </Button>
              <Button variant="ghost" size="icon" className="hover:bg-gray-800 text-white" asChild>
                <Link href="https://twitter.com" target="_blank" rel="noopener noreferrer">
                  <Twitter className="h-4 w-4" />
                </Link>
              </Button>
              <Button variant="ghost" size="icon" className="hover:bg-gray-800 text-white" asChild>
                <Link href="https://instagram.com" target="_blank" rel="noopener noreferrer">
                  <Instagram className="h-4 w-4" />
                </Link>
              </Button>
              <Button variant="ghost" size="icon" className="hover:bg-gray-800 text-white" asChild>
                <Link href="https://youtube.com" target="_blank" rel="noopener noreferrer">
                  <Youtube className="h-4 w-4" />
                </Link>
              </Button>
              <Button variant="ghost" size="icon" className="hover:bg-gray-800 text-white" asChild>
                <Link href="https://linkedin.com" target="_blank" rel="noopener noreferrer">
                  <Linkedin className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg text-white">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/tours" className="text-sm text-gray-400 hover:text-white transition-colors">
                  All Tours
                </Link>
              </li>
              <li>
                <Link href="/destinations" className="text-sm text-gray-400 hover:text-white transition-colors">
                  Destinations
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-sm text-gray-400 hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-sm text-gray-400 hover:text-white transition-colors">
                  Travel Blog
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-sm text-gray-400 hover:text-white transition-colors">
                  FAQs
                </Link>
              </li>
              <li>
                <Link href="/reviews" className="text-sm text-gray-400 hover:text-white transition-colors">
                  Customer Reviews
                </Link>
              </li>
            </ul>
          </div>

          {/* Support & Legal */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg text-white">Support & Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/contact" className="text-sm text-gray-400 hover:text-white transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/help" className="text-sm text-gray-400 hover:text-white transition-colors">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-sm text-gray-400 hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-sm text-gray-400 hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/cookies" className="text-sm text-gray-400 hover:text-white transition-colors">
                  Cookie Policy
                </Link>
              </li>
              <li>
                <Link href="/cancellation" className="text-sm text-gray-400 hover:text-white transition-colors">
                  Cancellation Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact & Newsletter */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg text-white">Get in Touch</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-sm text-gray-400">
                <Mail className="h-4 w-4" />
                <a href="mailto:info@travelagency.com" className="hover:text-white transition-colors">
                  info@travelagency.com
                </a>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-400">
                <Phone className="h-4 w-4" />
                <a href="tel:+1234567890" className="hover:text-white transition-colors">
                  +1 (234) 567-890
                </a>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-400">
                <MapPin className="h-4 w-4" />
                <span>123 Travel Street, Adventure City, AC 12345</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium text-sm text-white">Subscribe to Newsletter</h4>
              <p className="text-xs text-gray-400">Get exclusive deals and travel tips!</p>
              <form className="flex space-x-2">
                <Input 
                  type="email" 
                  placeholder="Enter your email" 
                  className="flex-1 bg-gray-900 border-gray-700 text-white placeholder:text-gray-500"
                />
                <Button type="submit" size="sm" className="bg-primary hover:bg-primary/90">
                  Subscribe
                </Button>
              </form>
            </div>
          </div>
        </div>

        <Separator className="my-8 bg-gray-800" />

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <p className="text-sm text-gray-400">
            © 2024 TravelAgency. All rights reserved.
          </p>
          <div className="flex items-center space-x-4">
            <Link href="/sitemap" className="text-sm text-gray-400 hover:text-white transition-colors">
              Sitemap
            </Link>
            <Link href="/accessibility" className="text-sm text-gray-400 hover:text-white transition-colors">
              Accessibility
            </Link>
            <Link href="/partners" className="text-sm text-gray-400 hover:text-white transition-colors">
              Partners
            </Link>
            <Link href="/careers" className="text-sm text-gray-400 hover:text-white transition-colors">
              Careers
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
