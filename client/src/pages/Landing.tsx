import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, User, Building } from "lucide-react";

export default function Landing() {
  const handleGeneralLogin = () => {
    window.location.href = "/api/login";
  };

  const handleBusinessLogin = () => {
    window.location.href = "/api/login-business";
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

          <div className="space-y-3 mb-4">
            <Button 
              onClick={handleGeneralLogin}
              className="w-full sms-blue flex items-center justify-center"
            >
              <User size={20} className="mr-2" />
              Continue as Visitor
            </Button>
            
            <Button 
              onClick={handleBusinessLogin}
              variant="outline"
              className="w-full border-[hsl(var(--sms-green))] text-[hsl(var(--sms-green))] hover:bg-[hsl(var(--sms-green))] hover:text-white flex items-center justify-center"
            >
              <Building size={20} className="mr-2" />
              Business Owner Login
            </Button>
          </div>

          <div className="bg-gray-50 rounded-lg p-3 text-xs">
            <div className="font-medium text-gray-700 mb-1">Development Mode</div>
            <div className="text-gray-500">
              Click either button above to test the app with sample accounts
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
