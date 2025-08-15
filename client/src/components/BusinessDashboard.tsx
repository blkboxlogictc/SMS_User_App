import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  TrendingUp,
  TrendingDown,
  Users,
  Eye,
  Gift,
  Calendar,
  MapPin,
  Star,
  Clock,
  DollarSign,
  Target,
  Activity,
  BarChart3,
  PieChart,
  Settings,
  Edit,
  Plus,
} from "lucide-react";

interface BusinessDashboardProps {
  businessId: number;
  businessName: string;
}

export default function BusinessDashboard({
  businessId,
  businessName,
}: BusinessDashboardProps) {
  // Fetch business analytics data
  const { data: analytics } = useQuery({
    queryKey: ["/api/business-analytics", businessId],
    queryFn: async () => {
      // For now, return mock data until we implement the API endpoint
      return {
        // Today's metrics
        todayVisitors: 127,
        todayVisitorsChange: 15.2,
        todayRedemptions: 8,
        todayRedemptionsChange: -5.1,
        todayPromotionViews: 45,
        todayPromotionViewsChange: 22.3,

        // Weekly metrics
        weeklyVisitors: 892,
        weeklyRedemptions: 34,
        weeklyPromotionViews: 267,
        weeklyEventRsvps: 12,

        // Monthly metrics
        monthlyRevenue: 4250,
        monthlyRevenueChange: 8.7,
        monthlyCustomers: 156,
        monthlyCustomersChange: 12.4,

        // Engagement metrics
        averageRating: 4.6,
        totalReviews: 23,
        promotionClickRate: 12.8,
        eventAttendanceRate: 78.5,

        // Recent activity
        recentRedemptions: [
          {
            id: 1,
            customerName: "Sarah M.",
            item: "Free Coffee",
            points: 50,
            time: "2 hours ago",
          },
          {
            id: 2,
            customerName: "Mike R.",
            item: "10% Discount",
            points: 25,
            time: "4 hours ago",
          },
          {
            id: 3,
            customerName: "Lisa K.",
            item: "Free Appetizer",
            points: 75,
            time: "6 hours ago",
          },
        ],

        // Top performing promotions
        topPromotions: [
          {
            id: 1,
            title: "Happy Hour Special",
            views: 89,
            redemptions: 12,
            conversionRate: 13.5,
          },
          {
            id: 2,
            title: "Weekend Brunch",
            views: 67,
            redemptions: 8,
            conversionRate: 11.9,
          },
          {
            id: 3,
            title: "Student Discount",
            views: 45,
            redemptions: 6,
            conversionRate: 13.3,
          },
        ],

        // Customer demographics
        customerAgeGroups: [
          { group: "18-25", percentage: 28 },
          { group: "26-35", percentage: 35 },
          { group: "36-45", percentage: 22 },
          { group: "46+", percentage: 15 },
        ],

        // Peak hours
        peakHours: [
          { hour: "11 AM", visitors: 23 },
          { hour: "12 PM", visitors: 45 },
          { hour: "1 PM", visitors: 38 },
          { hour: "6 PM", visitors: 31 },
          { hour: "7 PM", visitors: 28 },
        ],
      };
    },
  });

  // Downtown visitors data (mock data for now)
  const { data: downtownStats } = useQuery({
    queryKey: ["/api/downtown-visitors"],
    queryFn: async () => {
      return {
        totalVisitorsToday: 1247,
        totalVisitorsChange: 18.5,
        peakTime: "12:30 PM",
        currentVisitors: 89,
        averageStayTime: "2.3 hours",
        popularAreas: [
          { area: "Main Street", visitors: 456 },
          { area: "Waterfront", visitors: 312 },
          { area: "Arts District", visitors: 289 },
          { area: "Shopping Plaza", visitors: 190 },
        ],
      };
    },
  });

  if (!analytics || !downtownStats) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const MetricCard = ({
    title,
    value,
    change,
    icon: Icon,
    trend = "up",
    suffix = "",
    prefix = "",
  }: {
    title: string;
    value: string | number;
    change?: number;
    icon: any;
    trend?: "up" | "down" | "neutral";
    suffix?: string;
    prefix?: string;
  }) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900">
              {prefix}
              {value}
              {suffix}
            </p>
            {change !== undefined && (
              <div className="flex items-center mt-1">
                {trend === "up" ? (
                  <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                ) : trend === "down" ? (
                  <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                ) : null}
                <span
                  className={`text-sm ${
                    trend === "up"
                      ? "text-green-600"
                      : trend === "down"
                      ? "text-red-600"
                      : "text-gray-600"
                  }`}
                >
                  {change > 0 ? "+" : ""}
                  {change.toFixed(1)}%
                </span>
                <span className="text-xs text-gray-500 ml-1">vs yesterday</span>
              </div>
            )}
          </div>
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <Icon className="w-6 h-6 text-blue-600" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Business Dashboard
          </h2>
          <p className="text-gray-600">
            Analytics and insights for {businessName}
          </p>
        </div>
        <Badge variant="outline" className="text-green-600 border-green-200">
          <Activity className="w-4 h-4 mr-1" />
          Live Data
        </Badge>
      </div>

      {/* Downtown Visitors Section */}
      <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MapPin className="w-5 h-5 text-blue-600" />
            <span>Downtown Stuart Visitors Today</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">
                {downtownStats.totalVisitorsToday.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Total Visitors</div>
              <div className="flex items-center justify-center mt-1">
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-green-600 text-sm">
                  +{downtownStats.totalVisitorsChange}%
                </span>
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-indigo-600">
                {downtownStats.currentVisitors}
              </div>
              <div className="text-sm text-gray-600">Currently Downtown</div>
              <div className="text-xs text-gray-500 mt-1">Live count</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {downtownStats.peakTime}
              </div>
              <div className="text-sm text-gray-600">Peak Time Today</div>
              <div className="text-xs text-gray-500 mt-1">Busiest hour</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {downtownStats.averageStayTime}
              </div>
              <div className="text-sm text-gray-600">Avg. Stay Time</div>
              <div className="text-xs text-gray-500 mt-1">Per visitor</div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-blue-200">
            <h4 className="font-medium text-gray-900 mb-2">
              Popular Areas Today
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {downtownStats.popularAreas.map((area, index) => (
                <div
                  key={index}
                  className="bg-white rounded-lg p-3 text-center"
                >
                  <div className="font-semibold text-gray-900">
                    {area.visitors}
                  </div>
                  <div className="text-xs text-gray-600">{area.area}</div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Today's Visitors"
          value={analytics.todayVisitors}
          change={analytics.todayVisitorsChange}
          icon={Users}
          trend={analytics.todayVisitorsChange > 0 ? "up" : "down"}
        />
        <MetricCard
          title="Reward Redemptions"
          value={analytics.todayRedemptions}
          change={analytics.todayRedemptionsChange}
          icon={Gift}
          trend={analytics.todayRedemptionsChange > 0 ? "up" : "down"}
        />
        <MetricCard
          title="Promotion Views"
          value={analytics.todayPromotionViews}
          change={analytics.todayPromotionViewsChange}
          icon={Eye}
          trend={analytics.todayPromotionViewsChange > 0 ? "up" : "down"}
        />
        <MetricCard
          title="Average Rating"
          value={analytics.averageRating}
          icon={Star}
          suffix="/5"
        />
      </div>

      {/* Weekly Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Weekly Visitors"
          value={analytics.weeklyVisitors}
          icon={Users}
        />
        <MetricCard
          title="Weekly Redemptions"
          value={analytics.weeklyRedemptions}
          icon={Gift}
        />
        <MetricCard
          title="Event RSVPs"
          value={analytics.weeklyEventRsvps}
          icon={Calendar}
        />
        <MetricCard
          title="Promotion Click Rate"
          value={analytics.promotionClickRate}
          icon={Target}
          suffix="%"
        />
      </div>

      {/* Monthly Performance */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              <span>Monthly Performance</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Revenue</span>
                <div className="text-right">
                  <div className="font-semibold">
                    ${analytics.monthlyRevenue.toLocaleString()}
                  </div>
                  <div className="flex items-center text-sm">
                    <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                    <span className="text-green-600">
                      +{analytics.monthlyRevenueChange}%
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">New Customers</span>
                <div className="text-right">
                  <div className="font-semibold">
                    {analytics.monthlyCustomers}
                  </div>
                  <div className="flex items-center text-sm">
                    <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                    <span className="text-green-600">
                      +{analytics.monthlyCustomersChange}%
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Event Attendance</span>
                <div className="text-right">
                  <div className="font-semibold">
                    {analytics.eventAttendanceRate}%
                  </div>
                  <div className="text-xs text-gray-500">of RSVPs attended</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              <span>Peak Hours Today</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.peakHours.map((hour, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-gray-600">{hour.hour}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${(hour.visitors / 45) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium w-8">
                      {hour.visitors}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity & Top Promotions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-orange-600" />
              <span>Recent Redemptions</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.recentRedemptions.map((redemption) => (
                <div
                  key={redemption.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <div className="font-medium text-gray-900">
                      {redemption.customerName}
                    </div>
                    <div className="text-sm text-gray-600">
                      {redemption.item}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-blue-600">
                      {redemption.points} pts
                    </div>
                    <div className="text-xs text-gray-500">
                      {redemption.time}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <PieChart className="w-5 h-5 text-purple-600" />
              <span>Top Performing Promotions</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.topPromotions.map((promotion) => (
                <div key={promotion.id} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium text-gray-900">
                      {promotion.title}
                    </div>
                    <Badge variant="outline">{promotion.conversionRate}%</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>{promotion.views} views</span>
                    <span>{promotion.redemptions} redemptions</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Customer Demographics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-green-600" />
            <span>Customer Demographics</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {analytics.customerAgeGroups.map((group, index) => (
              <div
                key={index}
                className="text-center p-4 bg-gray-50 rounded-lg"
              >
                <div className="text-2xl font-bold text-gray-900">
                  {group.percentage}%
                </div>
                <div className="text-sm text-gray-600">{group.group} years</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
