"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import AuthModal from "@/features/auth/components/AuthModal";
import { LogOut, ChevronRight, Car, LayoutDashboard, ShieldCheck } from "lucide-react";

/**
 * Nav Component
 * 
 * Main navigation bar for the application. Handles responsive links,
 * user authentication state, and role-based dropdown menus.
 */
export default function Nav() {
  const { data: session } = useSession();
  const [authOpen, setAuthOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  return (
    <div className="fixed top-6 left-0 right-0 z-50 flex justify-center px-4">
      <nav className="w-full max-w-6xl bg-[#0f0f0f] text-white rounded-full px-6 py-3 flex items-center justify-between shadow-2xl">
        
        <Link href="/" className="flex items-center">
          <Image 
            src="/logo.jpeg" 
            alt="RYDEX Logo" 
            width={120} 
            height={40} 
            className="h-8 w-auto object-contain"
            priority
          />
        </Link>

        <div className="hidden md:flex items-center space-x-10 text-sm font-medium text-gray-300">
          <Link href="/" className="hover:text-white transition-colors">Home</Link>
          <Link href="/bookings" className="hover:text-white transition-colors">Bookings</Link>
          <Link href="/fleet" className="hover:text-white transition-colors">Fleet</Link>
          <Link href="/faq" className="hover:text-white transition-colors">FAQ</Link>
          <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
        </div>

        <div className="flex items-center relative">
          {session ? (
            <div>
              <button 
                onClick={() => setProfileOpen(!profileOpen)}
                className="w-9 h-9 rounded-full bg-white text-black flex items-center justify-center font-bold text-sm hover:bg-gray-200 transition-colors"
              >
                {session?.user?.name?.[0]?.toUpperCase() || "P"}
              </button>
              
              {profileOpen && (
                <div className="absolute right-0 top-12 w-64 bg-white text-black border border-gray-200 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.1)] overflow-hidden py-2 z-50">
                  
                  <div className="px-5 py-3 border-b border-gray-100">
                    <p className="text-sm font-bold text-gray-900 truncate">
                      {session?.user?.name || "User"}
                    </p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">
                      {(session?.user as { role?: string })?.role || "USER"}
                    </p>
                  </div>

                  <div className="px-3 py-2">
                    {(!((session?.user as { role?: string })?.role) || (session?.user as { role?: string })?.role === "user") && (
                      <Link 
                        href="/partner"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center justify-between w-full px-3 py-2.5 text-sm font-medium text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex -space-x-1">
                            <span className="w-5 h-5 rounded-full bg-black flex items-center justify-center text-white"><Car size={10} /></span>
                            <span className="w-5 h-5 rounded-full bg-black flex items-center justify-center text-white"><Car size={10} /></span>
                            <span className="w-5 h-5 rounded-full bg-black flex items-center justify-center text-white"><Car size={10} /></span>
                          </div>
                          <span>Become a Partner</span>
                        </div>
                        <ChevronRight size={16} className="text-gray-400" />
                      </Link>
                    )}

                    {(session?.user as { role?: string })?.role === "vendor" && (
                      <Link 
                        href="/partner"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center justify-between w-full px-3 py-2.5 text-sm font-medium text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 rounded-md bg-black flex items-center justify-center text-white">
                            <LayoutDashboard size={12} />
                          </div>
                          <span>Vendor Dashboard</span>
                        </div>
                        <ChevronRight size={16} className="text-gray-400" />
                      </Link>
                    )}

                    {(session?.user as { role?: string })?.role === "admin" && (
                      <Link 
                        href="/admin"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center justify-between w-full px-3 py-2.5 text-sm font-medium text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 rounded-md bg-black flex items-center justify-center text-white">
                            <ShieldCheck size={12} />
                          </div>
                          <span>Admin Dashboard</span>
                        </div>
                        <ChevronRight size={16} className="text-gray-400" />
                      </Link>
                    )}
                  </div>

                  <div className="px-3 pb-1">
                    <button 
                      onClick={() => {
                        setProfileOpen(false);
                        signOut();
                      }}
                      className="flex items-center gap-3 w-full px-3 py-2.5 text-sm font-medium text-gray-600 rounded-xl hover:bg-gray-100 transition-colors"
                    >
                      <LogOut size={16} className="text-gray-400" />
                      <span>Logout</span>
                    </button>
                  </div>

                </div>
              )}
            </div>
          ) : (
            <button 
              onClick={() => setAuthOpen(true)}
              className="px-6 py-1.5 rounded-full border border-white text-white text-sm font-medium hover:bg-white hover:text-black transition-colors"
            >
              Login
            </button>
          )}
        </div>
      </nav>

      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </div>
  );
}
