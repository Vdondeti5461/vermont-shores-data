import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Menu, X, MapPin, BarChart3, Download, Users, Info } from 'lucide-react';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { label: 'About', href: '#about', icon: Info },
    { label: 'Network', href: '#map', icon: MapPin },
    { label: 'Analytics', href: '#analytics', icon: BarChart3 },
    { label: 'Data Download', href: '#download', icon: Download },
    { label: 'Team', href: '#team', icon: Users }
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200/50 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
              <img 
                src="/src/assets/summit2shore-logo.png" 
                alt="Summit 2 Shore" 
                className="w-8 h-8 object-contain filter brightness-0 invert"
              />
            </div>
            <div className="text-xl font-bold text-gray-900">
              Summit-to-Shore
              <div className="text-xs text-gray-600 font-normal">Snow Observatory Network</div>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <a
                  key={item.label}
                  href={item.href}
                  className="flex items-center space-x-1 text-gray-700 hover:text-primary transition-colors duration-200 font-medium"
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </a>
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
                  <a
                    key={item.label}
                    href={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:text-primary hover:bg-primary/5 transition-colors rounded-lg mx-2"
                  >
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{item.label}</span>
                  </a>
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