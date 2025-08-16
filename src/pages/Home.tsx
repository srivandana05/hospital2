import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Calendar, Users, Clock, Award, Heart, Shield, Stethoscope } from 'lucide-react';

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-2xl p-12 mb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-5xl font-bold mb-6 leading-tight">
              Your Health, Our Priority
            </h1>
            <p className="text-xl mb-8 text-blue-100">
              Experience world-class healthcare with our expert doctors and modern facilities.
              Book your appointment today and take the first step towards better health.
            </p>
            <div className="flex flex-wrap gap-4">
              {user ? (
                user.role === 'patient' ? (
                  <Link
                    to="/book-appointment"
                    className="btn-primary px-8 py-4 rounded-xl text-lg font-semibold text-white"
                  >
                    Book Appointment
                  </Link>
                ) : (
                  <Link
                    to={`/${user.role}`}
                    className="btn-primary px-8 py-4 rounded-xl text-lg font-semibold text-white"
                  >
                    Go to Dashboard
                  </Link>
                )
              ) : (
                <>
                  <Link
                    to="/register"
                    className="btn-primary px-8 py-4 rounded-xl text-lg font-semibold text-white"
                  >
                    Get Started
                  </Link>
                  <Link
                    to="/login"
                    className="px-8 py-4 rounded-xl text-lg font-semibold border-2 border-white text-white hover:bg-white hover:text-blue-600 transition-all"
                  >
                    Login
                  </Link>
                </>
              )}
            </div>
          </div>
          <div className="relative">
            <img
              src="https://images.pexels.com/photos/4386467/pexels-photo-4386467.jpeg?auto=compress&cs=tinysrgb&w=600"
              alt="Healthcare"
              className="rounded-2xl shadow-2xl"
            />
            <div className="absolute -bottom-6 -left-6 bg-white text-blue-600 p-6 rounded-2xl shadow-lg">
              <div className="flex items-center space-x-2">
                <Heart className="h-6 w-6" />
                <span className="font-semibold">24/7 Emergency Care</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="mb-16">
        <h2 className="text-4xl font-bold text-center text-gray-800 mb-12">
          Why Choose MediCare?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: <Calendar className="h-12 w-12 text-blue-600" />,
              title: "Easy Booking",
              description: "Book appointments online 24/7 with our user-friendly system."
            },
            {
              icon: <Users className="h-12 w-12 text-green-600" />,
              title: "Expert Doctors",
              description: "Our team of specialist doctors provide the best care possible."
            },
            {
              icon: <Clock className="h-12 w-12 text-purple-600" />,
              title: "Quick Service",
              description: "Minimal waiting times and efficient healthcare delivery."
            },
            {
              icon: <Award className="h-12 w-12 text-orange-600" />,
              title: "Quality Care",
              description: "Award-winning healthcare services with proven results."
            },
            {
              icon: <Shield className="h-12 w-12 text-red-600" />,
              title: "Safe Environment",
              description: "Maintaining the highest standards of safety and hygiene."
            },
            {
              icon: <Stethoscope className="h-12 w-12 text-teal-600" />,
              title: "Advanced Technology",
              description: "State-of-the-art medical equipment and modern facilities."
            }
          ].map((feature, index) => (
            <div key={index} className="bg-white p-8 rounded-2xl shadow-lg card-hover">
              <div className="mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-4 text-gray-800">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Statistics Section */}
      <section className="bg-white rounded-2xl p-12 mb-16 shadow-lg">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
          {[
            { number: "50+", label: "Expert Doctors" },
            { number: "10,000+", label: "Happy Patients" },
            { number: "15+", label: "Years of Service" },
            { number: "24/7", label: "Emergency Care" }
          ].map((stat, index) => (
            <div key={index} className="p-6">
              <div className="text-4xl font-bold text-blue-600 mb-2">{stat.number}</div>
              <div className="text-gray-600 text-lg">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="text-center bg-gradient-to-r from-green-500 to-green-600 text-white rounded-2xl p-12">
        <h2 className="text-4xl font-bold mb-4">Ready to Take Care of Your Health?</h2>
        <p className="text-xl mb-8 text-green-100">
          Join thousands of satisfied patients who trust MediCare for their healthcare needs.
        </p>
        {!user && (
          <Link
            to="/register"
            className="btn-secondary px-8 py-4 rounded-xl text-lg font-semibold text-white"
          >
            Join MediCare Today
          </Link>
        )}
      </section>
    </div>
  );
}