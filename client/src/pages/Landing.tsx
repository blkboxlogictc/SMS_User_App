import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin } from "lucide-react";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6 text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-[hsl(var(--sms-green))] to-[hsl(var(--sms-blue))] rounded-full mx-auto mb-4 flex items-center justify-center">
            <MapPin className="text-white" size={32} />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Stuart Main Street
          </h1>
          
          <p className="text-gray-600 mb-6">
            Discover local businesses, events, and exclusive promotions in downtown Stuart, FL
          </p>

          <Button 
            onClick={handleLogin}
            className="w-full sms-blue mb-4"
          >
            Get Started
          </Button>

          <div className="bg-gray-50 rounded-lg p-4 text-sm">
            <div className="font-medium text-gray-700 mb-2">Development Test Accounts:</div>
            <div className="text-gray-600 space-y-1">
              <div><strong>General User:</strong> user@test.com / password123</div>
              <div><strong>Business Owner:</strong> owner@test.com / password123</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
