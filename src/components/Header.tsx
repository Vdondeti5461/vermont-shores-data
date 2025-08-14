import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Menu, X, Download, BarChart3, MapPin, Users } from 'lucide-react';
import logo from '@/assets/summit2shore-logo.png';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navigationItems = [
    { name: 'About Project', href: '#about', icon: Users },
    { name: 'Data Map', href: '#map', icon: MapPin },
    { name: 'Analytics', href: '#analytics', icon: BarChart3 },
    { name: 'Download Data', href: '#download', icon: Download },
  ];

  return (
    <header className="fixed top-0 w-full bg-background/80 backdrop-blur-md border-b border-border z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo and title */}
          <div className="flex items-center space-x-3">
            <img src={logo} alt="Summit 2 Shore" className="h-10 w-10" />
            <div>
              <h1 className="text-lg font-bold text-primary">Summit 2 Shore</h1>
              <p className="text-xs text-muted-foreground">University of Vermont Research Portal</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.name}
                  variant="ghost"
                  size="sm"
                  className="text-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                  asChild
                >
                  <a href={item.href} className="flex items-center space-x-2">
                    <Icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </a>
                </Button>
              );
            })}
          </nav>

          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <nav className="flex flex-col space-y-2">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Button
                    key={item.name}
                    variant="ghost"
                    size="sm"
                    className="justify-start text-foreground hover:text-primary hover:bg-primary/10"
                    asChild
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <a href={item.href} className="flex items-center space-x-2">
                      <Icon className="h-4 w-4" />
                      <span>{item.name}</span>
                    </a>
                  </Button>
                );
              })}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;