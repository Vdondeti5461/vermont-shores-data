import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Menu, X, MapPin, BarChart3, Download, Users, Info, Map, LineChart, Layers, FileText, Mail, Image, ChevronDown } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { cn } from '@/lib/utils';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [expandedMobileSection, setExpandedMobileSection] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  // Close mobile menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
    setExpandedMobileSection(null);
  }, [location.pathname]);

  // Handle scroll state for header shadow
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  const toggleMobileSection = (section: string) => {
    setExpandedMobileSection(expandedMobileSection === section ? null : section);
  };

  const navItems = [
    { label: 'About', href: '/about', icon: Info },
    { label: 'Network', href: '/network', icon: MapPin }
  ];

  const researchSubsections = [
    { label: 'Research Team', href: '/research', icon: Users, description: 'Our team and research collaborations' },
    { label: 'Gallery', href: '/research/gallery', icon: Image, description: 'Project photos and documentation' }
  ];

  const analyticsSubsections = [
    { label: 'Real-Time Analysis', href: '/analytics', icon: LineChart, description: 'Compare data quality levels across observation tables' },
    { label: 'Seasonal Analysis', href: '/analytics/seasonal', icon: Layers, description: 'Three seasons of quality-controlled data (2022-2025)' },
    { label: 'Advanced Analytics', href: '/analytics/advanced', icon: BarChart3, description: 'ML models and predictive analytics (coming soon)' }
  ];

  const dataDownloadSubsections = [
    { label: 'Data Download', href: '/download', icon: Download, description: 'Browse and download environmental data' },
    { label: 'Download Request', href: '/download/bulk-request', icon: Mail, description: 'Request bulk data downloads' },
    { label: 'API Documentation', href: '/documentation/api', icon: FileText, description: 'API endpoints and documentation' },
    { label: 'API Keys', href: '/api-keys', icon: FileText, description: 'Manage your API keys' }
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      <header className={cn(
        "fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-border pt-safe-top transition-shadow duration-300",
        isScrolled && "shadow-md"
      )}>
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
          <nav className="hidden lg:flex items-center space-x-4 xl:space-x-6">
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
            
            {/* Research Dropdown */}
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger 
                    className={`flex items-center space-x-1 transition-all duration-200 font-medium px-2 py-1 rounded-md ${
                      location.pathname.startsWith('/research') || location.pathname.startsWith('/documentation')
                        ? 'text-primary bg-primary/10' 
                        : 'text-muted-foreground hover:text-primary hover:bg-primary/5'
                    }`}
                  >
                    <Users className="h-4 w-4" />
                    <span className="text-sm">Research</span>
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-full max-w-[400px] gap-3 p-4 bg-popover">
                      {researchSubsections.map((item) => {
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
                    <ul className="grid w-full max-w-[400px] gap-3 p-4 bg-popover">
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
                    <ul className="grid w-full max-w-[400px] gap-3 p-4 bg-popover">
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
            className="lg:hidden p-2 rounded-lg hover:bg-accent transition-all min-h-[44px] min-w-[44px] flex items-center justify-center active:scale-95"
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-menu"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        <div
          id="mobile-menu"
          className={cn(
            "lg:hidden fixed inset-x-0 top-[56px] bottom-0 bg-background/98 backdrop-blur-md border-t border-border transform transition-transform duration-300 ease-in-out overflow-y-auto overscroll-contain",
            isMenuOpen ? "translate-y-0" : "-translate-y-full pointer-events-none"
          )}
        >
          <nav className="py-4 space-y-2 pb-safe-bottom container mx-auto px-4"  aria-label="Mobile navigation">
            {/* Top-level nav items */}
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.label}
                  to={item.href}
                  className={cn(
                    "flex items-center space-x-3 px-4 py-3 transition-all duration-200 rounded-lg font-medium min-h-[48px] active:scale-[0.98]",
                    isActive(item.href)
                      ? 'text-primary bg-primary/10'
                      : 'text-foreground hover:bg-accent'
                  )}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  <span className="text-base">{item.label}</span>
                </Link>
              );
            })}
              
            {/* Research Subsection - Collapsible */}
            <div className="border-t border-border pt-2">
              <button
                onClick={() => toggleMobileSection('research')}
                className={cn(
                  "flex items-center justify-between w-full px-4 py-3 transition-all duration-200 rounded-lg font-medium min-h-[48px] active:scale-[0.98]",
                  location.pathname.startsWith('/research') ? 'text-primary bg-primary/10' : 'text-foreground hover:bg-accent'
                )}
                aria-expanded={expandedMobileSection === 'research'}
              >
                <div className="flex items-center space-x-3">
                  <Users className="h-5 w-5 flex-shrink-0" />
                  <span className="text-base">Research</span>
                </div>
                <ChevronDown className={cn(
                  "h-5 w-5 transition-transform duration-200",
                  expandedMobileSection === 'research' && "rotate-180"
                )} />
              </button>
              
              <div className={cn(
                "overflow-hidden transition-all duration-300 ease-in-out",
                expandedMobileSection === 'research' ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
              )}>
                <div className="pl-6 pr-2 pt-1 space-y-1">
                  {researchSubsections.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.label}
                        to={item.href}
                        className={cn(
                          "flex items-center space-x-3 px-4 py-3 transition-all duration-200 rounded-lg min-h-[44px] active:scale-[0.98]",
                          isActive(item.href)
                            ? 'text-primary bg-primary/10'
                            : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                        )}
                      >
                        <Icon className="h-4 w-4 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium truncate">{item.label}</div>
                          <div className="text-xs text-muted-foreground line-clamp-1">{item.description}</div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
              
            {/* Data Download Subsection - Collapsible */}
            <div>
              <button
                onClick={() => toggleMobileSection('download')}
                className={cn(
                  "flex items-center justify-between w-full px-4 py-3 transition-all duration-200 rounded-lg font-medium min-h-[48px] active:scale-[0.98]",
                  location.pathname.startsWith('/download') || location.pathname.startsWith('/api') ? 'text-primary bg-primary/10' : 'text-foreground hover:bg-accent'
                )}
                aria-expanded={expandedMobileSection === 'download'}
              >
                <div className="flex items-center space-x-3">
                  <Download className="h-5 w-5 flex-shrink-0" />
                  <span className="text-base">Data Download</span>
                </div>
                <ChevronDown className={cn(
                  "h-5 w-5 transition-transform duration-200",
                  expandedMobileSection === 'download' && "rotate-180"
                )} />
              </button>
              
              <div className={cn(
                "overflow-hidden transition-all duration-300 ease-in-out",
                expandedMobileSection === 'download' ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
              )}>
                <div className="pl-6 pr-2 pt-1 space-y-1">
                  {dataDownloadSubsections.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.label}
                        to={item.href}
                        className={cn(
                          "flex items-center space-x-3 px-4 py-3 transition-all duration-200 rounded-lg min-h-[44px] active:scale-[0.98]",
                          isActive(item.href)
                            ? 'text-primary bg-primary/10'
                            : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                        )}
                      >
                        <Icon className="h-4 w-4 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium truncate">{item.label}</div>
                          <div className="text-xs text-muted-foreground line-clamp-1">{item.description}</div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Analytics Subsection - Collapsible */}
            <div>
              <button
                onClick={() => toggleMobileSection('analytics')}
                className={cn(
                  "flex items-center justify-between w-full px-4 py-3 transition-all duration-200 rounded-lg font-medium min-h-[48px] active:scale-[0.98]",
                  location.pathname.startsWith('/analytics') ? 'text-primary bg-primary/10' : 'text-foreground hover:bg-accent'
                )}
                aria-expanded={expandedMobileSection === 'analytics'}
              >
                <div className="flex items-center space-x-3">
                  <BarChart3 className="h-5 w-5 flex-shrink-0" />
                  <span className="text-base">Analytics</span>
                </div>
                <ChevronDown className={cn(
                  "h-5 w-5 transition-transform duration-200",
                  expandedMobileSection === 'analytics' && "rotate-180"
                )} />
              </button>
              
              <div className={cn(
                "overflow-hidden transition-all duration-300 ease-in-out",
                expandedMobileSection === 'analytics' ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
              )}>
                <div className="pl-6 pr-2 pt-1 space-y-1">
                  {analyticsSubsections.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.label}
                        to={item.href}
                        className={cn(
                          "flex items-center space-x-3 px-4 py-3 transition-all duration-200 rounded-lg min-h-[44px] active:scale-[0.98]",
                          isActive(item.href)
                            ? 'text-primary bg-primary/10'
                            : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                        )}
                      >
                        <Icon className="h-4 w-4 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium truncate">{item.label}</div>
                          <div className="text-xs text-muted-foreground line-clamp-1">{item.description}</div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* CTA Button - Mobile */}
            <div className="pt-4 pb-2 border-t border-border mt-4">
              <Button className="btn-research w-full text-base py-6 min-h-[48px] shadow-lg">
                Access Live Data
              </Button>
            </div>
          </nav>
        </div>
      </div>
    </header>

    {/* Mobile Menu Backdrop */}
    {isMenuOpen && (
      <div
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
        onClick={() => setIsMenuOpen(false)}
        aria-hidden="true"
      />
    )}
    </>
  );
};

export default Header;