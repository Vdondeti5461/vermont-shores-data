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
      color: 'bg-blue-500'
    },
    {
      title: 'Live Analytics',
      description: 'Real-time environmental data visualization',
      icon: BarChart3,
      href: '/analytics',
      color: 'bg-green-500'
    },
    {
      title: 'Download Data',
      description: 'Access research datasets and APIs',
      icon: Download,
      href: '/download',
      color: 'bg-purple-500'
    },
    {
      title: 'Research Team',
      description: 'Meet our scientists and collaborators',
      icon: Users,
      href: '/research',
      color: 'bg-orange-500'
    }
  ];

  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <Hero />

        {/* Quick Access Section */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <Badge variant="outline" className="mb-4">
                Quick Access
              </Badge>
              <h2 className="scientific-heading text-3xl md:text-4xl mb-4">
                Explore Our <span className="text-primary">Research Platform</span>
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Access real-time environmental data, explore monitoring networks, and download research datasets
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {quickLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.title}
                    to={link.href}
                    className="group p-6 bg-white rounded-xl border hover:border-primary/20 hover:shadow-lg transition-all duration-300"
                  >
                    <div className={`w-12 h-12 ${link.color} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
                      {link.title}
                    </h3>
                    <p className="text-muted-foreground text-sm mb-4">
                      {link.description}
                    </p>
                    <div className="flex items-center text-primary text-sm font-medium group-hover:translate-x-1 transition-transform">
                      Explore <ArrowRight className="h-4 w-4 ml-1" />
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        {/* Latest Updates */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <Badge variant="outline" className="mb-4">
                Latest Updates
              </Badge>
              <h2 className="scientific-heading text-3xl md:text-4xl mb-4">
                Recent <span className="text-primary">Developments</span>
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white rounded-xl border p-6">
                <div className="text-sm text-muted-foreground mb-2">January 2024</div>
                <h3 className="font-semibold text-lg mb-3">New Monitoring Stations</h3>
                <p className="text-muted-foreground mb-4">
                  Added 5 new environmental monitoring stations across Vermont's high-elevation regions.
                </p>
                <Link to="/network" className="text-primary font-medium hover:underline">
                  View Network →
                </Link>
              </div>

              <div className="bg-white rounded-xl border p-6">
                <div className="text-sm text-muted-foreground mb-2">December 2023</div>
                <h3 className="font-semibold text-lg mb-3">Enhanced Analytics</h3>
                <p className="text-muted-foreground mb-4">
                  New machine learning models for climate pattern analysis and forecasting.
                </p>
                <Link to="/analytics/advanced" className="text-primary font-medium hover:underline">
                  Explore Analytics →
                </Link>
              </div>

              <div className="bg-white rounded-xl border p-6">
                <div className="text-sm text-muted-foreground mb-2">November 2023</div>
                <h3 className="font-semibold text-lg mb-3">Open Data Initiative</h3>
                <p className="text-muted-foreground mb-4">
                  All research data now available through our new API and download portal.
                </p>
                <Link to="/download" className="text-primary font-medium hover:underline">
                  Access Data →
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