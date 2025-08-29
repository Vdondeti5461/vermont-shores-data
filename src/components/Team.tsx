import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Mail, Linkedin, ExternalLink } from 'lucide-react';

const Team = () => {
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const teamMembers = [
    {
      name: "Anna Grunes",
      role: "Lead Researcher",
      affiliation: "UVM Civil & Environmental Engineering",
      expertise: "Snowpack Dynamics, Hydrologic Modeling",
      image: "/lovable-uploads/250350aa-abaa-4e6e-b886-bae339af81b9.png",
      email: "Anna.Grunes@uvm.edu",
      linkedin: "https://www.linkedin.com/in/anna-grunes/"
    },
    {
      name: "Vamsi Dondeti",
      role: "Data Architect & Manager",
      affiliation: "UVM Civil & Environmental Engineering",
      expertise: "Data Management, System Architecture",
      image: null, // no photo available
      email: "vdondeti@uvm.edu",
      linkedin: "https://www.linkedin.com/in/vamsi-naidu-d/"
    },
    {
      name: "Dr. Arne Bomblies",
      role: "Principal Investigator", 
      affiliation: "UVM Civil & Environmental Engineering",
      expertise: "Computational Hydrology, Climate Modeling",
      image: "/lovable-uploads/f0e8b972-8f4c-4294-98e6-d3ae431cbd24.png",
      email: "abomblie@uvm.edu",
      linkedin: "https://www.linkedin.com/in/arne-bomblies-phd-pe-73835a21/"
    },
    {
      name: "Dr. Beverley Wemple",
      role: "Co-Investigator",
      affiliation: "UVM Geography & Geosciences",
      expertise: "Geomorphology, Watershed Hydrology",
      image: null, // photo needs to be updated - current one is Jacob's
      email: "bwemple@uvm.edu",
      linkedin: "https://www.linkedin.com/in/beverley-wemple-94557721/"
    },
    {
      name: "Jacob LaDue",
      role: "Research Associate",
      affiliation: "UVM Civil & Environmental Engineering",
      expertise: "Field Research, Data Collection",
      image: "/lovable-uploads/3953a891-e744-46ca-b6fa-0ebf0ce9835d.png", // this is actually Jacob's photo
      email: "Jacob.Ladue@uvm.edu",
      linkedin: "https://www.linkedin.com/in/jacob-ladue-8aa992232/"
    }
  ];

  const otherContributors = [
    "Katherine Hale",
    "Madison Torrey"
  ];

  return (
    <section id="team" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 sm:mb-16">
          <Badge variant="outline" className="mb-4 text-xs sm:text-sm">
            Research Team
          </Badge>
          <h2 className="scientific-heading text-2xl sm:text-3xl md:text-4xl lg:text-5xl mb-4 sm:mb-6 px-2">
            <span className="text-primary">Meet</span> Our Team
          </h2>
          <p className="text-sm sm:text-base lg:text-lg text-muted-foreground max-w-3xl mx-auto px-4">
            The Summit 2 Shore project brings together experts from multiple disciplines 
            to monitor and understand Vermont's changing environmental conditions.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {teamMembers.map((member, index) => (
            <Card key={index} className="data-card group hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6 text-center">
                <div className="w-20 h-20 rounded-full mx-auto mb-4 overflow-hidden bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                  {member.image ? (
                    <img 
                      src={member.image} 
                      alt={member.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-xl font-bold text-primary">
                      {getInitials(member.name)}
                    </div>
                  )}
                </div>
                <h3 className="font-semibold text-lg mb-2">{member.name}</h3>
                <Badge variant="secondary" className="mb-3">
                  {member.role}
                </Badge>
                <p className="text-sm text-muted-foreground mb-2">{member.affiliation}</p>
                <p className="text-xs text-muted-foreground mb-4">{member.expertise}</p>
                <div className="flex justify-center space-x-2">
                  <a 
                    href={`mailto:${member.email}`}
                    className="p-2 hover:bg-primary/10 rounded-full transition-colors"
                    aria-label={`Email ${member.name}`}
                  >
                    <Mail className="h-4 w-4 text-primary" />
                  </a>
                  <a 
                    href={member.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 hover:bg-primary/10 rounded-full transition-colors"
                    aria-label={`${member.name}'s LinkedIn`}
                  >
                    <Linkedin className="h-4 w-4 text-primary" />
                  </a>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Other Contributors Section */}
        <div className="mt-12 text-center">
          <Card className="data-card">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Other Contributors</h3>
              <div className="flex flex-wrap justify-center gap-3">
                {otherContributors.map((contributor, index) => (
                  <Badge key={index} variant="outline" className="text-sm">
                    {contributor}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-12 text-center">
          <Card className="data-card bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
            <CardContent className="p-8">
              <h3 className="text-xl font-semibold mb-4">Collaborating Institutions</h3>
              <div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
                <span>University of Vermont</span>
                <span>•</span>
                <span>CRREL (Cold Regions Research Lab)</span>
                <span>•</span>
                <span>UVM Civil & Environmental Engineering</span>
                <span>•</span>
                <span>UVM Geography & Geosciences</span>
                <span>•</span>
                <span>US Geological Survey</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default Team;
