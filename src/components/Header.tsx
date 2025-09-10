import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Menu, X, MapPin, BarChart3, Download, Users, Info } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { label: 'About', href: '/about', icon: Info },
    { label: 'Network', href: '/network', icon: MapPin },
    { label: 'Analytics', href: '/analytics', icon: BarChart3 },
    { label: 'Data Download', href: '/download', icon: Download },
    { label: 'Research', href: '/research', icon: Users }
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200/50 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <Link 
            to="/"
            className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-green-700 to-green-600 rounded-lg flex items-center justify-center">
              <img 
                src="/lovable-uploads/d19c9c85-6a6b-4115-bc8e-2ed5fd432891.png" 
                alt="University of Vermont" 
                className="w-8 h-8 object-contain filter brightness-0 invert"
              />
            </div>
            <div className="text-xl font-bold text-gray-900">
              Summit-to-Shore
              <div className="text-xs font-normal">
                <span className="text-green-700">University of Vermont</span> × CRREL
              </div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.label}
                  to={item.href}
                  className={`flex items-center space-x-1 transition-colors duration-200 font-medium ${
                    isActive(item.href) 
                      ? 'text-primary' 
                      : 'text-gray-700 hover:text-primary'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* CTA Button */}
          <div className="hidden md:block">
            <Button className="bg-primary hover:bg-primary/90 text-white">
              Access Live Data
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200/50 bg-white/95 backdrop-blur-sm">
            <nav className="py-4 space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.label}
                    to={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className={`flex items-center space-x-3 px-4 py-3 transition-colors rounded-lg mx-2 font-medium ${
                      isActive(item.href)
                        ? 'text-primary bg-primary/10'
                        : 'text-gray-700 hover:text-primary hover:bg-primary/5'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
              <div className="px-6 pt-4">
                <Button className="w-full bg-primary hover:bg-primary/90 text-white">
                  Access Live Data
                </Button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;