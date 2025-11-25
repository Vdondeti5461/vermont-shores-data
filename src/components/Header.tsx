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
                  className={cn(
                    "flex items-center space-x-2 transition-all duration-200 font-semibold px-3 py-2 rounded-lg text-sm",
                    isActive(item.href) 
                      ? 'text-primary bg-primary/15 shadow-sm' 
                      : 'text-foreground hover:text-primary hover:bg-accent/50'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
            
            {/* Research Dropdown */}
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger 
                    className={cn(
                      "flex items-center space-x-2 transition-all duration-200 font-semibold px-3 py-2 rounded-lg text-sm",
                      location.pathname.startsWith('/research')
                        ? 'text-primary bg-primary/15 shadow-sm' 
                        : 'text-foreground hover:text-primary hover:bg-accent/50'
                    )}
                  >
                    <Users className="h-4 w-4" />
                    <span>Research</span>
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="w-[420px] p-6 bg-card border border-border/50">
                      <div className="mb-4 pb-3 border-b border-border">
                        <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">Research & Collaboration</h3>
                      </div>
                      <ul className="grid gap-2">
                        {researchSubsections.map((item) => {
                          const Icon = item.icon;
                          return (
                            <li key={item.label}>
                              <NavigationMenuLink asChild>
                                <Link
                                  to={item.href}
                                  className={cn(
                                    "group block select-none rounded-lg p-4 leading-none no-underline outline-none transition-all hover:shadow-md border",
                                    isActive(item.href) 
                                      ? 'bg-primary/10 border-primary/30 shadow-sm' 
                                      : 'bg-card hover:bg-accent/50 border-transparent hover:border-border'
                                  )}
                                >
                                  <div className="flex items-start gap-3">
                                    <div className={cn(
                                      "mt-0.5 p-2 rounded-md transition-colors",
                                      isActive(item.href) ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary'
                                    )}>
                                      <Icon className="h-5 w-5" />
                                    </div>
                                    <div className="flex-1 space-y-1">
                                      <div className="font-semibold text-sm leading-tight text-foreground group-hover:text-primary transition-colors">
                                        {item.label}
                                      </div>
                                      <p className="text-xs leading-snug text-muted-foreground line-clamp-2">
                                        {item.description}
                                      </p>
                                    </div>
                                  </div>
                                </Link>
                              </NavigationMenuLink>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
            
            {/* Data Download Dropdown - Mega Menu Style */}
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger 
                    className={cn(
                      "flex items-center space-x-2 transition-all duration-200 font-semibold px-3 py-2 rounded-lg text-sm",
                      location.pathname.startsWith('/download') || location.pathname.startsWith('/api') || location.pathname.startsWith('/documentation')
                        ? 'text-primary bg-primary/15 shadow-sm' 
                        : 'text-foreground hover:text-primary hover:bg-accent/50'
                    )}
                  >
                    <Download className="h-4 w-4" />
                    <span>Data Access</span>
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="w-[520px] p-6 bg-card border border-border/50">
                      <div className="mb-4 pb-3 border-b border-border">
                        <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">Data Download & API Access</h3>
                        <p className="text-xs text-muted-foreground mt-1">Access environmental data through downloads or API</p>
                      </div>
                      <ul className="grid grid-cols-2 gap-3">
                        {dataDownloadSubsections.map((item) => {
                          const Icon = item.icon;
                          return (
                            <li key={item.label}>
                              <NavigationMenuLink asChild>
                                <Link
                                  to={item.href}
                                  className={cn(
                                    "group block select-none rounded-lg p-4 leading-none no-underline outline-none transition-all hover:shadow-md border h-full",
                                    isActive(item.href) 
                                      ? 'bg-primary/10 border-primary/30 shadow-sm' 
                                      : 'bg-card hover:bg-accent/50 border-transparent hover:border-border'
                                  )}
                                >
                                  <div className="flex flex-col gap-2 h-full">
                                    <div className="flex items-center gap-2">
                                      <div className={cn(
                                        "p-2 rounded-md transition-colors",
                                        isActive(item.href) ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary'
                                      )}>
                                        <Icon className="h-4 w-4" />
                                      </div>
                                      <div className="font-semibold text-sm leading-tight text-foreground group-hover:text-primary transition-colors">
                                        {item.label}
                                      </div>
                                    </div>
                                    <p className="text-xs leading-snug text-muted-foreground line-clamp-2">
                                      {item.description}
                                    </p>
                                  </div>
                                </Link>
                              </NavigationMenuLink>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>

            {/* Analytics Dropdown - Enhanced Visibility */}
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger 
                    className={cn(
                      "flex items-center space-x-2 transition-all duration-200 font-semibold px-3 py-2 rounded-lg text-sm",
                      location.pathname.startsWith('/analytics')
                        ? 'text-primary bg-primary/15 shadow-sm' 
                        : 'text-foreground hover:text-primary hover:bg-accent/50'
                    )}
                  >
                    <BarChart3 className="h-4 w-4" />
                    <span>Analytics</span>
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="w-[480px] p-6 bg-card border border-border/50">
                      <div className="mb-4 pb-3 border-b border-border">
                        <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">Data Analytics & Visualization</h3>
                        <p className="text-xs text-muted-foreground mt-1">Explore environmental data through interactive dashboards</p>
                      </div>
                      <ul className="grid gap-2">
                        {analyticsSubsections.map((item) => {
                          const Icon = item.icon;
                          return (
                            <li key={item.label}>
                              <NavigationMenuLink asChild>
                                <Link
                                  to={item.href}
                                  className={cn(
                                    "group block select-none rounded-lg p-4 leading-none no-underline outline-none transition-all hover:shadow-md border",
                                    isActive(item.href) 
                                      ? 'bg-primary/10 border-primary/30 shadow-sm' 
                                      : 'bg-card hover:bg-accent/50 border-transparent hover:border-border'
                                  )}
                                >
                                  <div className="flex items-start gap-3">
                                    <div className={cn(
                                      "mt-0.5 p-2 rounded-md transition-colors",
                                      isActive(item.href) ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary'
                                    )}>
                                      <Icon className="h-5 w-5" />
                                    </div>
                                    <div className="flex-1 space-y-1">
                                      <div className="font-semibold text-sm leading-tight text-foreground group-hover:text-primary transition-colors">
                                        {item.label}
                                      </div>
                                      <p className="text-xs leading-snug text-muted-foreground line-clamp-2">
                                        {item.description}
                                      </p>
                                    </div>
                                  </div>
                                </Link>
                              </NavigationMenuLink>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </nav>

          {/* CTA Button */}
          <div className="hidden lg:block">
            <Button className="btn-research text-sm font-semibold px-5 py-2.5 shadow-md hover:shadow-lg transition-all">
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
                    "flex items-center space-x-3 px-4 py-3 transition-all duration-200 rounded-lg font-semibold min-h-[52px] active:scale-[0.98]",
                    isActive(item.href)
                      ? 'text-primary bg-primary/15 shadow-sm'
                      : 'text-foreground hover:bg-accent'
                  )}
                >
                  <div className={cn(
                    "p-2 rounded-lg transition-colors",
                    isActive(item.href) ? 'bg-primary/20 text-primary' : 'bg-muted text-foreground'
                  )}>
                    <Icon className="h-5 w-5 flex-shrink-0" />
                  </div>
                  <span className="text-base">{item.label}</span>
                </Link>
              );
            })}
              
            {/* Research Subsection - Collapsible */}
            <div className="border-t border-border pt-2">
              <button
                onClick={() => toggleMobileSection('research')}
                className={cn(
                  "flex items-center justify-between w-full px-4 py-3 transition-all duration-200 rounded-lg font-semibold min-h-[52px] active:scale-[0.98]",
                  location.pathname.startsWith('/research') ? 'text-primary bg-primary/15 shadow-sm' : 'text-foreground hover:bg-accent'
                )}
                aria-expanded={expandedMobileSection === 'research'}
              >
                <div className="flex items-center space-x-3">
                  <div className={cn(
                    "p-2 rounded-lg transition-colors",
                    location.pathname.startsWith('/research') ? 'bg-primary/20 text-primary' : 'bg-muted text-foreground'
                  )}>
                    <Users className="h-5 w-5 flex-shrink-0" />
                  </div>
                  <div className="text-left">
                    <div className="text-base font-semibold">Research</div>
                    <div className="text-xs text-muted-foreground">Team & collaboration</div>
                  </div>
                </div>
                <ChevronDown className={cn(
                  "h-5 w-5 transition-transform duration-300 flex-shrink-0",
                  expandedMobileSection === 'research' && "rotate-180"
                )} />
              </button>
              
              <div className={cn(
                "overflow-hidden transition-all duration-300 ease-in-out",
                expandedMobileSection === 'research' ? "max-h-96 opacity-100 mt-2" : "max-h-0 opacity-0"
              )}>
                <div className="px-2 space-y-2 pb-2">
                  {researchSubsections.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.label}
                        to={item.href}
                        className={cn(
                          "flex items-start gap-3 p-4 transition-all duration-200 rounded-lg border min-h-[68px] active:scale-[0.98]",
                          isActive(item.href)
                            ? 'bg-primary/10 border-primary/30 shadow-sm'
                            : 'bg-card border-border/50 hover:border-border hover:shadow-md'
                        )}
                      >
                        <div className={cn(
                          "p-2 rounded-md flex-shrink-0 transition-colors",
                          isActive(item.href) ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'
                        )}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className={cn(
                            "text-sm font-semibold mb-1 transition-colors",
                            isActive(item.href) ? 'text-primary' : 'text-foreground'
                          )}>{item.label}</div>
                          <div className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{item.description}</div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
              
            {/* Data Download Subsection - Collapsible with Grid */}
            <div>
              <button
                onClick={() => toggleMobileSection('download')}
                className={cn(
                  "flex items-center justify-between w-full px-4 py-3 transition-all duration-200 rounded-lg font-semibold min-h-[52px] active:scale-[0.98]",
                  location.pathname.startsWith('/download') || location.pathname.startsWith('/api') ? 'text-primary bg-primary/15 shadow-sm' : 'text-foreground hover:bg-accent'
                )}
                aria-expanded={expandedMobileSection === 'download'}
              >
                <div className="flex items-center space-x-3">
                  <div className={cn(
                    "p-2 rounded-lg transition-colors",
                    location.pathname.startsWith('/download') || location.pathname.startsWith('/api') ? 'bg-primary/20 text-primary' : 'bg-muted text-foreground'
                  )}>
                    <Download className="h-5 w-5 flex-shrink-0" />
                  </div>
                  <div className="text-left">
                    <div className="text-base font-semibold">Data Access</div>
                    <div className="text-xs text-muted-foreground">Downloads & API</div>
                  </div>
                </div>
                <ChevronDown className={cn(
                  "h-5 w-5 transition-transform duration-300 flex-shrink-0",
                  expandedMobileSection === 'download' && "rotate-180"
                )} />
              </button>
              
              <div className={cn(
                "overflow-hidden transition-all duration-300 ease-in-out",
                expandedMobileSection === 'download' ? "max-h-[600px] opacity-100 mt-2" : "max-h-0 opacity-0"
              )}>
                <div className="px-2 grid grid-cols-2 gap-2 pb-2">
                  {dataDownloadSubsections.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.label}
                        to={item.href}
                        className={cn(
                          "flex flex-col gap-2 p-3 transition-all duration-200 rounded-lg border min-h-[100px] active:scale-[0.98]",
                          isActive(item.href)
                            ? 'bg-primary/10 border-primary/30 shadow-sm'
                            : 'bg-card border-border/50 hover:border-border hover:shadow-md'
                        )}
                      >
                        <div className={cn(
                          "p-2 rounded-md w-fit transition-colors",
                          isActive(item.href) ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'
                        )}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className={cn(
                            "text-xs font-semibold mb-1 line-clamp-2 leading-tight transition-colors",
                            isActive(item.href) ? 'text-primary' : 'text-foreground'
                          )}>{item.label}</div>
                          <div className="text-[10px] text-muted-foreground line-clamp-2 leading-snug">{item.description}</div>
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
                  "flex items-center justify-between w-full px-4 py-3 transition-all duration-200 rounded-lg font-semibold min-h-[52px] active:scale-[0.98]",
                  location.pathname.startsWith('/analytics') ? 'text-primary bg-primary/15 shadow-sm' : 'text-foreground hover:bg-accent'
                )}
                aria-expanded={expandedMobileSection === 'analytics'}
              >
                <div className="flex items-center space-x-3">
                  <div className={cn(
                    "p-2 rounded-lg transition-colors",
                    location.pathname.startsWith('/analytics') ? 'bg-primary/20 text-primary' : 'bg-muted text-foreground'
                  )}>
                    <BarChart3 className="h-5 w-5 flex-shrink-0" />
                  </div>
                  <div className="text-left">
                    <div className="text-base font-semibold">Analytics</div>
                    <div className="text-xs text-muted-foreground">Data visualization</div>
                  </div>
                </div>
                <ChevronDown className={cn(
                  "h-5 w-5 transition-transform duration-300 flex-shrink-0",
                  expandedMobileSection === 'analytics' && "rotate-180"
                )} />
              </button>
              
              <div className={cn(
                "overflow-hidden transition-all duration-300 ease-in-out",
                expandedMobileSection === 'analytics' ? "max-h-[500px] opacity-100 mt-2" : "max-h-0 opacity-0"
              )}>
                <div className="px-2 space-y-2 pb-2">
                  {analyticsSubsections.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.label}
                        to={item.href}
                        className={cn(
                          "flex items-start gap-3 p-4 transition-all duration-200 rounded-lg border min-h-[68px] active:scale-[0.98]",
                          isActive(item.href)
                            ? 'bg-primary/10 border-primary/30 shadow-sm'
                            : 'bg-card border-border/50 hover:border-border hover:shadow-md'
                        )}
                      >
                        <div className={cn(
                          "p-2 rounded-md flex-shrink-0 transition-colors",
                          isActive(item.href) ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'
                        )}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className={cn(
                            "text-sm font-semibold mb-1 transition-colors",
                            isActive(item.href) ? 'text-primary' : 'text-foreground'
                          )}>{item.label}</div>
                          <div className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{item.description}</div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* CTA Button - Mobile */}
            <div className="pt-4 pb-2 border-t border-border mt-4">
              <Button className="btn-research w-full text-base font-semibold py-7 min-h-[52px] shadow-lg hover:shadow-xl transition-all">
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