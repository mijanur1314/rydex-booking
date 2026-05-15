import Link from "next/link";
import { Facebook, Instagram, Twitter, Linkedin } from "lucide-react";

/**
 * Footer Component
 * 
 * Displays the main site footer including brand information,
 * social links, company links, services, and newsletter subscription.
 */
export default function Footer() {
  return (
    <footer className="w-full bg-black text-white py-16 mt-20 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-6">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div>
            <h2 className="text-2xl font-bold mb-4 tracking-wide">RYDEX</h2>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              Book any vehicle — from bikes to trucks.<br />
              Trusted owners. Transparent pricing.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="w-8 h-8 rounded-full border border-gray-600 flex items-center justify-center text-gray-400 hover:text-white hover:border-white transition-colors">
                <Facebook size={16} />
              </a>
              <a href="#" className="w-8 h-8 rounded-full border border-gray-600 flex items-center justify-center text-gray-400 hover:text-white hover:border-white transition-colors">
                <Instagram size={16} />
              </a>
              <a href="#" className="w-8 h-8 rounded-full border border-gray-600 flex items-center justify-center text-gray-400 hover:text-white hover:border-white transition-colors">
                <Twitter size={16} />
              </a>
              <a href="#" className="w-8 h-8 rounded-full border border-gray-600 flex items-center justify-center text-gray-400 hover:text-white hover:border-white transition-colors">
                <Linkedin size={16} />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold mb-6 tracking-wider uppercase text-gray-200">Company</h3>
            <ul className="space-y-4 text-sm text-gray-400">
              <li><Link href="/about" className="hover:text-white transition-colors">About</Link></li>
              <li><Link href="/careers" className="hover:text-white transition-colors">Careers</Link></li>
              <li><Link href="/blog" className="hover:text-white transition-colors">Blog</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold mb-6 tracking-wider uppercase text-gray-200">Services</h3>
            <ul className="space-y-4 text-sm text-gray-400">
              <li><Link href="/fleet/bikes" className="hover:text-white transition-colors">Bike Rental</Link></li>
              <li><Link href="/fleet/cars" className="hover:text-white transition-colors">Car Rental</Link></li>
              <li><Link href="/fleet/suvs" className="hover:text-white transition-colors">SUV & Van</Link></li>
              <li><Link href="/fleet/trucks" className="hover:text-white transition-colors">Truck Booking</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold mb-6 tracking-wider uppercase text-gray-200">Stay Updated</h3>
            <p className="text-gray-400 text-sm mb-4">
              Subscribe for updates
            </p>
            <div className="flex">
              <input 
                type="email" 
                placeholder="Enter email" 
                className="bg-transparent border border-gray-600 rounded-l-md px-4 py-2 text-sm w-full focus:outline-none focus:border-gray-400 text-white placeholder-gray-500"
              />
              <button className="bg-transparent border border-l-0 border-gray-600 rounded-r-md px-4 py-2 text-gray-400 hover:text-white hover:border-gray-400 transition-colors">
                →
              </button>
            </div>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center text-xs text-gray-500">
          <p>&copy; {new Date().getFullYear()} RYDEX. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
            <Link href="/legal" className="hover:text-white transition-colors">Legal</Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
