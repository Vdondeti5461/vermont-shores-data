import Header from '@/components/Header';
import Hero from '@/components/Hero';
import Footer from '@/components/Footer';
import DatabaseStatus from '@/components/DatabaseStatus';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, MapPin, BarChart3, Download, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

const Home = () => {
  const quickLinks = [
    {
      title: 'Data Network',
      description: 'Explore monitoring stations across Vermont',
      icon: MapPin,
      href: '/network',
      color: 'bg-green-500'
    },
    {
      title: 'Download Data',
      description: 'Access research datasets and APIs',
      icon: Download,
      href: '/download',
      color: 'bg-orange-500'
    },
    {
      title: 'Snow Analytics',
      description: 'Interactive snow depth time series analysis',
      icon: BarChart3,
      href: '/analytics/snow-depth',
      color: 'bg-blue-500'
    },
    {
      title: 'Live Analytics',
      description: 'Real-time environmental data visualization',
      icon: BarChart3,
      href: '/analytics',
      color: 'bg-purple-500'
    }
  ];

  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <Hero />

        {/* Quick Access Section */}
        <section className="py-8 xs:py-12 md:py-16 bg-muted/30">
          <div className="container mx-auto px-4 xs:px-3">
            <div className="text-center mb-8 xs:mb-10 md:mb-12">
              <Badge variant="outline" className="mb-3 xs:mb-4">
                Quick Access
              </Badge>
              <h2 className="scientific-heading text-2xl xs:text-3xl md:text-4xl mb-3 xs:mb-4">
                Explore Our <span className="text-primary">Research Platform</span>
              </h2>
              <p className="text-sm xs:text-base md:text-lg text-muted-foreground max-w-2xl mx-auto px-2">
                Access real-time environmental data, explore monitoring networks, and download research datasets
              </p>
            </div>

            <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-4 xs:gap-6">
              {quickLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.title}
                    to={link.href}
                    className="group p-4 xs:p-6 data-card hover:border-primary/20 hover:shadow-lg transition-all duration-300 touch:active:scale-98 min-h-[120px] xs:min-h-[140px]"
                  >
                    <div className={`w-10 h-10 xs:w-12 xs:h-12 ${link.color} rounded-lg flex items-center justify-center mb-3 xs:mb-4 group-hover:scale-110 transition-transform`}>
                      <Icon className="h-5 w-5 xs:h-6 xs:w-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-base xs:text-lg mb-2 group-hover:text-primary transition-colors leading-tight">
                      {link.title}
                    </h3>
                    <p className="text-muted-foreground text-xs xs:text-sm mb-3 xs:mb-4 leading-relaxed">
                      {link.description}
                    </p>
                    <div className="flex items-center text-primary text-xs xs:text-sm font-medium group-hover:translate-x-1 transition-transform">
                      Explore <ArrowRight className="h-3 w-3 xs:h-4 xs:w-4 ml-1" />
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        {/* Latest Updates */}
        <section className="py-8 xs:py-12 md:py-16 pb-safe-bottom">
          <div className="container mx-auto px-4 xs:px-3">
            <div className="text-center mb-8 xs:mb-10 md:mb-12">
              <Badge variant="outline" className="mb-3 xs:mb-4">
                Latest Updates
              </Badge>
              <h2 className="scientific-heading text-2xl xs:text-3xl md:text-4xl mb-3 xs:mb-4">
                Recent <span className="text-primary">Developments</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 xs:gap-8">
              <div className="data-card p-4 xs:p-6 touch:active:scale-98 transition-transform">
                <div className="text-xs xs:text-sm text-muted-foreground mb-2">Current</div>
                <h3 className="font-semibold text-base xs:text-lg mb-3">Real-Time Data & Analytics</h3>
                <p className="text-muted-foreground text-sm xs:text-base mb-4 leading-relaxed">
                  Developing snow depth analytics platform with real-time data streaming from data loggers and API development.
                </p>
                <Link to="/analytics/snow-depth" className="text-primary font-medium hover:underline text-sm xs:text-base">
                  View Analytics →
                </Link>
              </div>

              <div className="data-card p-4 xs:p-6 touch:active:scale-98 transition-transform">
                <div className="text-xs xs:text-sm text-muted-foreground mb-2">2024</div>
                <h3 className="font-semibold text-base xs:text-lg mb-3">Unified Network Collaboration</h3>
                <p className="text-muted-foreground text-sm xs:text-base mb-4 leading-relaxed">
                  Partnered with Whiteface Mountain and Mount Washington Observatory to build a unified environmental monitoring network.
                </p>
                <Link to="/network" className="text-primary font-medium hover:underline text-sm xs:text-base">
                  View Network →
                </Link>
              </div>

              <div className="data-card p-4 xs:p-6 touch:active:scale-98 transition-transform">
                <div className="text-xs xs:text-sm text-muted-foreground mb-2">2023-2024</div>
                <h3 className="font-semibold text-base xs:text-lg mb-3">Data Standardization & Cleaning</h3>
                <p className="text-muted-foreground text-sm xs:text-base mb-4 leading-relaxed">
                  Implemented multi-stage data cleaning pipeline with calibration and vegetation correction for snow depth measurements.
                </p>
                <Link to="/download" className="text-primary font-medium hover:underline text-sm xs:text-base">
                  Access Data →
                </Link>
              </div>

              <div className="data-card p-4 xs:p-6 touch:active:scale-98 transition-transform">
                <div className="text-xs xs:text-sm text-muted-foreground mb-2">2022-2024</div>
                <h3 className="font-semibold text-base xs:text-lg mb-3">Network Expansion</h3>
                <p className="text-muted-foreground text-sm xs:text-base mb-4 leading-relaxed">
                  Deployed 22+ monitoring stations across Vermont with custom database architecture for environmental data collection.
                </p>
                <Link to="/network" className="text-primary font-medium hover:underline text-sm xs:text-base">
                  Explore Locations →
                </Link>
              </div>

              <div className="data-card p-4 xs:p-6 touch:active:scale-98 transition-transform">
                <div className="text-xs xs:text-sm text-muted-foreground mb-2">November 2022</div>
                <h3 className="font-semibold text-base xs:text-lg mb-3">Project Launch</h3>
                <p className="text-muted-foreground text-sm xs:text-base mb-4 leading-relaxed">
                  Summit2Shore environmental data collection initiative launched with custom database schema development.
                </p>
                <Link to="/about" className="text-primary font-medium hover:underline text-sm xs:text-base">
                  Learn More →
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Home;