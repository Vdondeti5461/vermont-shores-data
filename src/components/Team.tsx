import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Mail, Linkedin, ExternalLink } from 'lucide-react';

const Team = () => {
  const teamMembers = [
    {
      name: "Dr. Sarah Johnson",
      role: "Principal Investigator",
      affiliation: "University of Vermont",
      expertise: "Environmental Science, Climate Monitoring",
      email: "sarah.johnson@uvm.edu"
    },
    {
      name: "Dr. Michael Chen",
      role: "Data Science Lead",
      affiliation: "Vermont EPSCoR",
      expertise: "Data Analytics, Machine Learning",
      email: "michael.chen@uvm.edu"
    },
    {
      name: "Dr. Emily Rodriguez",
      role: "Field Research Coordinator",
      affiliation: "UVM Extension",
      expertise: "Field Instrumentation, Sensor Networks",
      email: "emily.rodriguez@uvm.edu"
    },
    {
      name: "Alex Thompson",
      role: "GIS Specialist",
      affiliation: "Vermont Geological Survey",
      expertise: "Spatial Analysis, Remote Sensing",
      email: "alex.thompson@vermont.gov"
    }
  ];

  return (
    <section id="team" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4">
            Research Team
          </Badge>
          <h2 className="scientific-heading text-4xl md:text-5xl mb-6">
            <span className="text-primary">Meet</span> Our Team
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            The Summit 2 Shore project brings together experts from multiple disciplines 
            to monitor and understand Vermont's changing environmental conditions.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {teamMembers.map((member, index) => (
            <Card key={index} className="data-card group hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-lg font-semibold text-primary">
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <h3 className="font-semibold text-lg mb-2">{member.name}</h3>
                <Badge variant="secondary" className="mb-3">
                  {member.role}
                </Badge>
                <p className="text-sm text-muted-foreground mb-2">{member.affiliation}</p>
                <p className="text-xs text-muted-foreground mb-4">{member.expertise}</p>
                <div className="flex justify-center space-x-2">
                  <button className="p-2 hover:bg-primary/10 rounded-full transition-colors">
                    <Mail className="h-4 w-4 text-primary" />
                  </button>
                  <button className="p-2 hover:bg-primary/10 rounded-full transition-colors">
                    <Linkedin className="h-4 w-4 text-primary" />
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Card className="data-card bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
            <CardContent className="p-8">
              <h3 className="text-xl font-semibold mb-4">Collaborating Institutions</h3>
              <div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
                <span>University of Vermont</span>
                <span>•</span>
                <span>Vermont EPSCoR</span>
                <span>•</span>
                <span>Vermont Geological Survey</span>
                <span>•</span>
                <span>UVM Extension</span>
                <span>•</span>
                <span>NOAA Climate Office</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default Team;