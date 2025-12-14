import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Mail, MapPin, Phone, ExternalLink, Database } from 'lucide-react';
import logo from '@/assets/summit2shore-logo.png';
import uvmLogo from '@/assets/uvm-logo.png';

const Footer = () => {
  const contactInfo = [
    { icon: Mail, label: 'crrels2s@uvm.edu', href: 'mailto:crrels2s@uvm.edu' },
    { icon: Phone, label: '(802) 656-2215', href: 'tel:8026562215' },
    { icon: MapPin, label: 'Burlington, VT 05405', href: '#' }
  ];

  const quickLinks = [
    { label: 'Data Portal', href: '/download' },
    { label: 'Site Map', href: '/network' },
    { label: 'Analytics', href: '/analytics' },
    { label: 'Research Team', href: '/research' },
    { label: 'Documentation', href: '/documentation' },
    { label: 'API Access', href: '/download' }
  ];

  const resources = [
    { label: 'Data Guidelines', href: '/documentation' },
    { label: 'Methodology', href: '/about' },
    { label: 'Publications', href: '/research' },
    { label: 'Collaborations', href: '/about' },
    { label: 'News & Updates', href: '/about' },
    { label: 'Support', href: 'mailto:crrels2s@uvm.edu' }
  ];

  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Project Info */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-3 mb-6">
              <div className="bg-white p-2 rounded-lg">
                <img src={uvmLogo} alt="University of Vermont" className="h-8 w-auto" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Summit 2 Shore</h3>
                <p className="text-sm text-primary-foreground/80">UVM Research Portal</p>
              </div>
            </div>
            <p className="text-sm text-primary-foreground/80 mb-6 leading-relaxed">
              Advancing environmental science through comprehensive climate and ecological 
              monitoring across Vermont's diverse landscapes from mountain summits to lake shores.
            </p>
            <div className="flex items-center gap-2 mb-4">
              <Badge variant="secondary" className="bg-secondary text-secondary-foreground">
                22 Active Sites
              </Badge>
              <Badge variant="outline" className="border-primary-foreground/20 text-primary-foreground">
                3 Years Data
              </Badge>
            </div>
          </div>

          {/* Contact Information */}
          <div>
            <h4 className="font-semibold text-lg mb-6">Contact Information</h4>
            <div className="space-y-4">
              {contactInfo.map((contact, index) => {
                const Icon = contact.icon;
                return (
                  <div key={index} className="flex items-center space-x-3">
                    <Icon className="h-4 w-4 text-secondary" />
                    <a 
                      href={contact.href}
                      className="text-sm text-primary-foreground/80 hover:text-secondary transition-colors"
                    >
                      {contact.label}
                    </a>
                  </div>
                );
              })}
            </div>
            <div className="mt-6">
              <h5 className="font-medium mb-3">University of Vermont</h5>
              <p className="text-sm text-primary-foreground/80">
                Civil and Environmental Engineering<br />
                CEMS UVM<br />
                Water Resource Institute
              </p>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-lg mb-6">Quick Links</h4>
            <div className="space-y-3">
              {quickLinks.map((link, index) => (
                <a 
                  key={index}
                  href={link.href}
                  className="block text-sm text-primary-foreground/80 hover:text-secondary transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-semibold text-lg mb-6">Resources</h4>
            <div className="space-y-3 mb-6">
              {resources.map((resource, index) => (
                <a 
                  key={index}
                  href={resource.href}
                  className="block text-sm text-primary-foreground/80 hover:text-secondary transition-colors"
                >
                  {resource.label}
                </a>
              ))}
            </div>
            
            {/* Action Buttons */}
            <div className="space-y-3">
              <a href="/download" className="block">
                <Button 
                  variant="secondary" 
                  size="sm" 
                  className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90"
                >
                  <Database className="mr-2 h-4 w-4" />
                  Access Data API
                </Button>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-primary-foreground/20 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-sm text-primary-foreground/80">
              © 2025 University of Vermont Summit 2 Shore Project. All rights reserved.
            </div>
            <div className="flex items-center space-x-6 text-sm text-primary-foreground/80">
              <a href="/documentation" className="hover:text-secondary transition-colors">
                Privacy Policy
              </a>
              <a href="/documentation" className="hover:text-secondary transition-colors">
                Data License
              </a>
              <a href="https://www.uvm.edu/cems/cee" target="_blank" rel="noopener noreferrer" className="hover:text-secondary transition-colors flex items-center">
                UVM Environmental Program
                <ExternalLink className="ml-1 h-3 w-3" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;