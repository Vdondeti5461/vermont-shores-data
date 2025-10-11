import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Menu, X, MapPin, BarChart3, Download, Users, Info, Map, LineChart, Layers, FileText, Mail } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { label: 'About', href: '/about', icon: Info },
    { label: 'Network', href: '/network', icon: MapPin },
    { label: 'Research', href: '/research', icon: Users }
  ];

  const analyticsSubsections = [
    { label: 'Maps/Analysis', href: '/analytics', icon: Map, description: 'Spatial analysis and geographic visualization' },
    { label: 'Plots', href: '/analytics/plots', icon: LineChart, description: 'Time series and data plots' },
    { label: 'Snow Analytics', href: '/analytics/snow-depth', icon: BarChart3, description: 'Snow depth analysis' },
    { label: 'Others', href: '/analytics/advanced', icon: Layers, description: 'Additional analytics tools' }
  ];

  const dataDownloadSubsections = [
    { label: 'Data Download', href: '/download', icon: Download, description: 'Browse and download environmental data' },
    { label: 'Download Request', href: '/download/bulk-request', icon: Mail, description: 'Request bulk data downloads' },
    { label: 'API Documentation', href: '/documentation/api', icon: FileText, description: 'API endpoints and documentation' }
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-border shadow-sm pt-safe-top">
      <div className="container mx-auto px-4 xs:px-3">
        <div className="flex items-center justify-between h-14 xs:h-12 md:h-16">
          
          {/* Logo */}
          <Link 
            to="/"
            className="flex items-center space-x-2 xs:space-x-1.5 md:space-x-3 hover:opacity-80 transition-opacity touch:active:scale-95"
            onClick={() => setIsMenuOpen(false)}
          >
            <div className="w-8 h-8 xs:w-7 xs:h-7 md:w-10 md:h-10 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center">
              <img 
                src="/lovable-uploads/d19c9c85-6a6b-4115-bc8e-2ed5fd432891.png" 
                alt="University of Vermont" 
                className="w-6 h-6 xs:w-5 xs:h-5 md:w-8 md:h-8 object-contain filter brightness-0 invert"
              />
            </div>
            <div className="text-base xs:text-sm md:text-xl font-bold text-foreground">
              <span className="block leading-tight">Summit-to-Shore</span>
              <div className="text-2xs xs:text-3xs md:text-xs font-normal leading-tight">
                <span className="text-primary">University of Vermont</span> × CRREL
              </div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-6 xl:space-x-8">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.label}
                  to={item.href}
                  className={`flex items-center space-x-1 transition-all duration-200 font-medium px-2 py-1 rounded-md ${
                    isActive(item.href) 
                      ? 'text-primary bg-primary/10' 
                      : 'text-muted-foreground hover:text-primary hover:bg-primary/5'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="text-sm">{item.label}</span>
                </Link>
              );
            })}
            
            {/* Analytics Dropdown */}
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger 
                    className={`flex items-center space-x-1 transition-all duration-200 font-medium px-2 py-1 rounded-md ${
                      location.pathname.startsWith('/analytics')
                        ? 'text-primary bg-primary/10' 
                        : 'text-muted-foreground hover:text-primary hover:bg-primary/5'
                    }`}
                  >
                    <BarChart3 className="h-4 w-4" />
                    <span className="text-sm">Analytics</span>
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[400px] gap-3 p-4 bg-popover">
                      {analyticsSubsections.map((item) => {
                        const Icon = item.icon;
                        return (
                          <li key={item.label}>
                            <NavigationMenuLink asChild>
                              <Link
                                to={item.href}
                                className={`block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground ${
                                  isActive(item.href) ? 'bg-accent/50' : ''
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  <Icon className="h-4 w-4" />
                                  <div className="text-sm font-medium leading-none">{item.label}</div>
                                </div>
                                <p className="line-clamp-2 text-xs leading-snug text-muted-foreground mt-1">
                                  {item.description}
                                </p>
                              </Link>
                            </NavigationMenuLink>
                          </li>
                        );
                      })}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>

            {/* Data Download Dropdown */}
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger 
                    className={`flex items-center space-x-1 transition-all duration-200 font-medium px-2 py-1 rounded-md ${
                      location.pathname.startsWith('/download') || location.pathname.startsWith('/documentation')
                        ? 'text-primary bg-primary/10' 
                        : 'text-muted-foreground hover:text-primary hover:bg-primary/5'
                    }`}
                  >
                    <Download className="h-4 w-4" />
                    <span className="text-sm">Data Download</span>
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[400px] gap-3 p-4 bg-popover">
                      {dataDownloadSubsections.map((item) => {
                        const Icon = item.icon;
                        return (
                          <li key={item.label}>
                            <NavigationMenuLink asChild>
                              <Link
                                to={item.href}
                                className={`block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground ${
                                  isActive(item.href) ? 'bg-accent/50' : ''
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  <Icon className="h-4 w-4" />
                                  <div className="text-sm font-medium leading-none">{item.label}</div>
                                </div>
                                <p className="line-clamp-2 text-xs leading-snug text-muted-foreground mt-1">
                                  {item.description}
                                </p>
                              </Link>
                            </NavigationMenuLink>
                          </li>
                        );
                      })}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </nav>

          {/* CTA Button */}
          <div className="hidden lg:block">
            <Button className="btn-research text-sm px-4 py-2">
              Access Live Data
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden p-2 rounded-lg hover:bg-muted active:bg-muted/80 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? <X className="h-5 w-5 md:h-6 md:w-6" /> : <Menu className="h-5 w-5 md:h-6 md:w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="lg:hidden border-t border-border bg-background/98 backdrop-blur-md animate-slide-up">
            <nav className="py-3 space-y-1 pb-safe-bottom">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.label}
                    to={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className={`flex items-center space-x-3 px-4 py-3 mx-2 transition-all duration-200 rounded-lg font-medium touch:active:scale-98 min-h-[48px] ${
                      isActive(item.href)
                        ? 'text-primary bg-primary/10 shadow-sm'
                        : 'text-muted-foreground hover:text-primary hover:bg-primary/5 active:bg-primary/10'
                    }`}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    <span className="text-base">{item.label}</span>
                  </Link>
                );
              })}
              
              {/* Analytics Subsection - Mobile */}
              <div className="px-2 pt-2">
                <div className="px-2 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Analytics
                </div>
                {analyticsSubsections.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.label}
                      to={item.href}
                      onClick={() => setIsMenuOpen(false)}
                      className={`flex items-center space-x-3 px-4 py-3 mx-2 transition-all duration-200 rounded-lg font-medium touch:active:scale-98 min-h-[48px] ${
                        isActive(item.href)
                          ? 'text-primary bg-primary/10 shadow-sm'
                          : 'text-muted-foreground hover:text-primary hover:bg-primary/5 active:bg-primary/10'
                      }`}
                    >
                      <Icon className="h-5 w-5 flex-shrink-0" />
                      <span className="text-base">{item.label}</span>
                    </Link>
                  );
                })}
              </div>

              {/* Data Download Subsection - Mobile */}
              <div className="px-2 pt-2">
                <div className="px-2 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Data Download
                </div>
                {dataDownloadSubsections.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.label}
                      to={item.href}
                      onClick={() => setIsMenuOpen(false)}
                      className={`flex items-center space-x-3 px-4 py-3 mx-2 transition-all duration-200 rounded-lg font-medium touch:active:scale-98 min-h-[48px] ${
                        isActive(item.href)
                          ? 'text-primary bg-primary/10 shadow-sm'
                          : 'text-muted-foreground hover:text-primary hover:bg-primary/5 active:bg-primary/10'
                      }`}
                    >
                      <Icon className="h-5 w-5 flex-shrink-0" />
                      <span className="text-base">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
              
              <div className="px-4 pt-4">
                <Button 
                  className="w-full btn-research text-base py-3 min-h-[48px]"
                  onClick={() => setIsMenuOpen(false)}
                >
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