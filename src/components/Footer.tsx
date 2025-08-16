import React from 'react';
import { Heart, Phone, Mail, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 text-2xl font-bold mb-4">
              <Heart className="h-8 w-8 text-blue-400" />
              <span>MediCare</span>
            </div>
            <p className="text-gray-400">
              Providing quality healthcare with compassion and excellence.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Services</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Doctors</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Emergency</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Departments</h3>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-white transition-colors">Cardiology</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Orthopedics</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Pediatrics</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Dermatology</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Info</h3>
            <div className="space-y-2 text-gray-400">
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4" />
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4" />
                <span>admin@medicare.com</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4" />
                <span>123 Healthcare St, Medical City</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2024 MediCare Hospital. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}