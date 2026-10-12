import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, ShieldCheck, Truck, RefreshCw, Award } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 mt-20 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Value Propositions */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-12 border-b border-slate-800 text-center md:text-left">
          <div className="flex items-start gap-3">
            <Truck className="w-6 h-6 text-blue-400 shrink-0 mt-1" />
            <div>
              <h4 className="font-semibold text-white text-sm">Hostel Delivery</h4>
              <p className="text-xs text-slate-400 mt-1">Direct to campus rooms within 24 hours</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <ShieldCheck className="w-6 h-6 text-blue-400 shrink-0 mt-1" />
            <div>
              <h4 className="font-semibold text-white text-sm">Verified Hardware</h4>
              <p className="text-xs text-slate-400 mt-1">100% genuine components with warranty</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <RefreshCw className="w-6 h-6 text-blue-400 shrink-0 mt-1" />
            <div>
              <h4 className="font-semibold text-white text-sm">Textbook Buyback</h4>
              <p className="text-xs text-slate-400 mt-1">50% semester-end syllabus buyback</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Award className="w-6 h-6 text-blue-400 shrink-0 mt-1" />
            <div>
              <h4 className="font-semibold text-white text-sm">Student Subsidies</h4>
              <p className="text-xs text-slate-400 mt-1">Direct academic discounts on study tools</p>
            </div>
          </div>
        </div>

        {/* Footer Links & Info */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-12 text-sm">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <span className="font-bold text-white text-base">ShopSphere Campus</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Smart Shopping for Smarter Students. Designed for University campus academic supply workflows.
            </p>
            <p className="text-[11px] text-slate-500">
              AU-R24 Full Stack Development Using Java Capstone
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-white text-sm mb-4">Categories</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><Link to="/catalog?category=laptops-computers" className="hover:text-white transition">Student Laptops</Link></li>
              <li><Link to="/catalog?category=computer-peripherals" className="hover:text-white transition">Mechanical Keyboards</Link></li>
              <li><Link to="/catalog?category=engineering-textbooks" className="hover:text-white transition">Engineering Books</Link></li>
              <li><Link to="/catalog?category=lab-hardware" className="hover:text-white transition">Arduino & IoT Kits</Link></li>
              <li><Link to="/catalog?category=stationery-study" className="hover:text-white transition">Scientific Calculators</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white text-sm mb-4">Campus Services</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><Link to="/ai-assistant" className="hover:text-white transition">AI Shopping Assistant</Link></li>
              <li><Link to="/compare" className="hover:text-white transition">Hardware Comparison</Link></li>
              <li><span className="text-slate-400">Block C Store Pickup</span></li>
              <li><span className="text-slate-400">Lab Component Testing</span></li>
              <li><span className="text-slate-400">Hostel Delivery Timings</span></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white text-sm mb-4">Demonstration Credentials</h4>
            <div className="bg-slate-800 p-3 rounded-lg text-xs space-y-1 text-slate-300">
              <p className="font-semibold text-blue-400">Test Accounts:</p>
              <p>Student: <span className="font-mono text-[11px]">student@shopsphere.edu</span></p>
              <p>Admin: <span className="font-mono text-[11px]">admin@shopsphere.edu</span></p>
              <p>Default Passwords: <span className="font-mono text-[11px]">Student@123 / Admin@123</span></p>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-8 border-t border-slate-800 text-center text-xs text-slate-500">
          <p>© 2026 ShopSphere Campus. Developed for B.Tech 3rd-Year Computer Science and Engineering.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
