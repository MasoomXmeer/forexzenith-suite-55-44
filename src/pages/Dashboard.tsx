
import { HeroSection } from "@/components/Layout/HeroSection";
import { XMCard } from "@/components/UI/XMCard";
import { XMButton } from "@/components/UI/XMButton";
import { Award, Shield, TrendingUp, Star, Users, Globe, CheckCircle } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { DashboardHome } from "@/components/Dashboard/DashboardHome";
import { NavLink } from "react-router-dom";
import { platformConfig } from "@/config/platform";

const Dashboard = () => {
  const isMobile = useIsMobile();

  // Awards/Trust indicators
  const awards = [
    { 
      icon: Award, 
      title: "Best Trading Platform 2024", 
      organization: "Global Finance Awards",
      color: "from-yellow-400 to-orange-500"
    },
    { 
      icon: Shield, 
      title: "Best Security & Regulation", 
      organization: "Trading Excellence Awards",
      color: "from-blue-400 to-blue-600"
    },
    { 
      icon: TrendingUp, 
      title: "Best Execution Speed", 
      organization: "FX Industry Awards",
      color: "from-green-400 to-green-600"
    },
  ];

  // Why choose us features
  const features = [
    {
      icon: Shield,
      title: "Regulated & Secure",
      description: "Licensed by top-tier financial authorities with client funds segregated and protected",
      gradient: "from-[#E31E24] to-[#B71C1C]"
    },
    {
      icon: TrendingUp,
      title: "Ultra-Low Spreads",
      description: "Start trading with spreads from 0.0 pips and enjoy competitive commission rates",
      gradient: "from-[#1A1A1A] to-[#000000]"
    },
    {
      icon: Star,
      title: "Award-Winning Platform",
      description: "Trade on our advanced platform with professional tools and lightning-fast execution",
      gradient: "from-[#FFD700] to-[#FFA500]"
    },
    {
      icon: Users,
      title: "24/7 Support",
      description: "Get dedicated support from our team of trading experts whenever you need help",
      gradient: "from-[#00C851] to-[#00A142]"
    },
    {
      icon: Globe,
      title: "Global Markets",
      description: "Access 1,000+ instruments including Forex, Indices, Commodities, and Stocks",
      gradient: "from-[#4285F4] to-[#3367D6]"
    },
    {
      icon: CheckCircle,
      title: "Instant Execution",
      description: "Experience lightning-fast order execution with no requotes and minimal slippage",
      gradient: "from-[#9C27B0] to-[#7B1FA2]"
    }
  ];

  if (isMobile) {
    return (
      <div className="space-y-4">
        <DashboardHome />
      </div>
    );
  }

  // Desktop Layout - AonePrimeFX style
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <HeroSection />
      
      {/* Awards Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Award-Winning Excellence</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Recognized globally for our commitment to providing the best trading experience, security, and customer service in the industry
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {awards.map((award, index) => (
              <XMCard key={index} className="text-center group" hover>
                <div className="space-y-6">
                  <div className={`w-20 h-20 bg-gradient-to-r ${award.color} rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300`}>
                    <award.icon className="h-10 w-10 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xl text-gray-900 mb-2">{award.title}</h3>
                    <p className="text-gray-600 font-medium">{award.organization}</p>
                  </div>
                </div>
              </XMCard>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose {platformConfig.platform.name}?</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Join millions of traders who trust our platform for their trading success
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <XMCard key={index} className="group" hover>
                <div className="space-y-4">
                  <div className={`w-12 h-12 bg-gradient-to-r ${feature.gradient} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-bold text-xl text-gray-900 group-hover:text-[#E31E24] transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </XMCard>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-[#E31E24] to-[#B71C1C] text-white">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto space-y-8">
            <h2 className="text-4xl lg:text-5xl font-bold">
              Ready to Start Your Trading Journey?
            </h2>
            <p className="text-xl opacity-90 max-w-2xl mx-auto">
              Join thousands of successful traders who have chosen {platformConfig.platform.name} as their preferred trading platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <NavLink to="/signup">
                <XMButton 
                  variant="secondary" 
                  size="lg" 
                  className="text-lg px-8 py-4 bg-white text-[#E31E24] hover:bg-gray-100"
                >
                  Open Live Account
                </XMButton>
              </NavLink>
              <NavLink to="/trading">
                <XMButton 
                  variant="outline" 
                  size="lg" 
                  className="text-lg px-8 py-4 border-white text-white hover:bg-white hover:text-[#E31E24]"
                >
                  Try Demo First
                </XMButton>
              </NavLink>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
