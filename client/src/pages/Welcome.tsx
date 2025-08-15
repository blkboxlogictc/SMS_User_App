import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  MapPin,
  Calendar,
  Gift,
  Star,
  Users,
  Smartphone,
  ArrowRight,
  CheckCircle,
} from "lucide-react";
export default function Welcome() {
  const [, setLocation] = useLocation();

  const handleGetStarted = () => {
    setLocation("/signup");
  };

  const features = [
    {
      icon: <MapPin className="w-6 h-6" />,
      title: "Discover Local Businesses",
      description:
        "Find restaurants, shops, and services in downtown Stuart with real-time information and reviews.",
    },
    {
      icon: <Calendar className="w-6 h-6" />,
      title: "Upcoming Events",
      description:
        "Stay updated on festivals, markets, art walks, and community events happening on Main Street.",
    },
    {
      icon: <Gift className="w-6 h-6" />,
      title: "Exclusive Promotions",
      description:
        "Access special deals, discounts, and promotions available only to app users.",
    },
    {
      icon: <Star className="w-6 h-6" />,
      title: "Rewards Program",
      description:
        "Earn points by checking in, attending events, and supporting local businesses.",
    },
  ];

  const benefits = [
    "Real-time business hours and wait times",
    "Interactive map with business locations",
    "Event RSVP and calendar integration",
    "Points-based rewards system",
    "Exclusive member promotions",
    "Community engagement features",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img
            src="/Sailfish-1.jpg"
            alt="Stuart Main Street"
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/30 to-green-600/30"></div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 px-4 py-16 sm:py-24">
          <div className="max-w-4xl mx-auto text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-[hsl(var(--sms-green))] to-[hsl(var(--sms-blue))] rounded-full mx-auto mb-6 flex items-center justify-center shadow-lg">
              <MapPin className="text-white" size={40} />
            </div>

            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              Welcome to
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-green-600">
                Stuart Main Street
              </span>
            </h1>

            <p className="text-xl text-gray-700 mb-8 max-w-2xl mx-auto leading-relaxed">
              Your gateway to downtown Stuart, Florida. Discover local
              businesses, exciting events, and exclusive rewards all in one
              beautiful mobile app.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
              <Button
                onClick={handleGetStarted}
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white px-8 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Get Started
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>

              <div className="flex items-center text-gray-600">
                <Smartphone className="w-5 h-5 mr-2" />
                <span className="text-sm">Mobile-optimized experience</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Everything You Need to Explore Stuart
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our app brings the vibrant downtown Stuart community right to your
              fingertips
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-green-100 rounded-full mx-auto mb-4 flex items-center justify-center text-blue-600">
                    {feature.icon}
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="py-16 px-4 bg-gradient-to-r from-blue-50 to-green-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose Stuart Main Street App?
            </h2>
            <p className="text-lg text-gray-600">
              Join our growing community and unlock the full potential of
              downtown Stuart
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-4 h-4 text-white" />
                </div>
                <span className="text-gray-700 font-medium">{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Community Section */}
      <div className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-yellow-100 rounded-full mx-auto mb-6 flex items-center justify-center">
            <Users className="text-orange-600" size={32} />
          </div>

          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Join the Stuart Community
          </h2>

          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Connect with local business owners, discover hidden gems, and be
            part of the vibrant downtown Stuart experience. Your adventure
            starts here!
          </p>

          <Button
            onClick={handleGetStarted}
            size="lg"
            className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white px-8 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
          >
            Start Exploring Today
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Footer */}
      <div className="py-8 px-4 bg-gray-50 border-t">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-gray-500 text-sm">
            © 2025 Stuart Main Street App. Connecting community, one business at
            a time.
          </p>
        </div>
      </div>
    </div>
  );
}
