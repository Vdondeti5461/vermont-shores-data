import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Team from '@/components/Team';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Users, BookOpen, Award, Building, Download } from 'lucide-react';

const Research = () => {
  const researchAreas = [
    {
      title: 'Snow Hydrology',
      description: 'Snowpack monitoring and water resource prediction',
      icon: '❄️',
      publications: 0,
      projects: 1
    },
    {
      title: 'Climate Monitoring',
      description: 'Long-term environmental data collection and analysis',
      icon: '🌡️',
      publications: 0,
      projects: 2
    },
    {
      title: 'Environmental Data Science',
      description: 'Real-time sensor networks and data quality control',
      icon: '📊',
      publications: 0,
      projects: 1
    },
    {
      title: 'Mountain Ecosystems',
      description: 'Elevation gradient research and alpine environmental change',
      icon: '⛰️',
      publications: 0,
      projects: 1
    }
  ];

  const collaborations = [
    {
      name: 'U.S. Army CRREL',
      type: 'Federal Partner',
      description: 'Cold Regions Research and Engineering Laboratory - Primary partner for Summit-to-Shore snow monitoring network and cold regions research'
    },
    {
      name: 'NOAA CIROH',
      type: 'Federal Consortium',
      description: 'Cooperative Institute for Research to Operations in Hydrology - Advancing water prediction and hydrological forecasting'
    },
    {
      name: 'Vermont Agency of Natural Resources',
      type: 'State Agency',
      description: 'State-level environmental monitoring, data sharing, and climate adaptation policy support'
    },
    {
      name: 'UVM Water Resources Institute',
      type: 'UVM Partner',
      description: 'Interdisciplinary water and climate research coordination and collaborative funding initiatives'
    },
    {
      name: 'Northeast Snow Study (NESS)',
      type: 'Regional Network',
      description: 'Multi-state snow monitoring and hydrological research collaboration across the Northeast region'
    },
    {
      name: 'Mount Washington Observatory',
      type: 'Research Station',
      description: 'High-elevation climate data exchange and collaborative alpine weather research'
    }
  ];

  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-16">
        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-br from-primary/5 to-secondary/5">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <Badge variant="outline" className="mb-4">
                <Users className="w-4 h-4 mr-2" />
                Research Team
              </Badge>
              <h1 className="scientific-heading text-4xl md:text-6xl mb-6">
                Meet Our <span className="text-primary">Research</span>
                <br />Team & Partners
              </h1>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                Collaborative research connecting scientists, students, and institutions 
                to advance environmental understanding across Vermont and beyond.
              </p>
            </div>
          </div>
        </section>

        {/* Research Overview */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <Badge variant="outline" className="mb-4">
                Research Focus
              </Badge>
              <h2 className="scientific-heading text-3xl md:text-4xl mb-6">
                Our <span className="text-primary">Research Areas</span>
              </h2>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
              {researchAreas.map((area) => (
                <Card key={area.title} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="text-center pb-3">
                    <div className="text-4xl mb-2">{area.icon}</div>
                    <CardTitle className="text-lg">{area.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <p className="text-sm text-muted-foreground mb-4">{area.description}</p>
                    <div className="flex justify-center gap-4 text-xs text-muted-foreground">
                      <span>{area.publications} publications</span>
                      <span>{area.projects} active projects</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <Team />
          </div>
        </section>

        {/* Research Details */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <Badge variant="outline" className="mb-4">
                Research Output
              </Badge>
              <h2 className="scientific-heading text-3xl md:text-4xl mb-6">
                Publications & <span className="text-primary">Impact</span>
              </h2>
            </div>

            <Tabs defaultValue="publications" className="w-full">
              <TabsList className="flex w-full overflow-x-auto gap-2 h-auto p-1 -mx-4 px-4 sm:mx-0 whitespace-nowrap snap-x snap-mandatory">
                <TabsTrigger value="publications" className="shrink-0 snap-start text-sm py-2 px-3 rounded-full">
                  Publications
                </TabsTrigger>
                <TabsTrigger value="projects" className="shrink-0 snap-start text-sm py-2 px-3 rounded-full">
                  Active Projects
                </TabsTrigger>
                <TabsTrigger value="awards" className="shrink-0 snap-start text-sm py-2 px-3 rounded-full">
                  Awards & Grants
                </TabsTrigger>
                <TabsTrigger value="outreach" className="shrink-0 snap-start text-sm py-2 px-3 rounded-full">
                  Outreach
                </TabsTrigger>
              </TabsList>

              <TabsContent value="publications" className="mt-4 sm:mt-6 lg:mt-8">
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BookOpen className="h-5 w-5" />
                        Recent Publications & Conference Proceedings
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {/* Featured Publication */}
                        <div className="border-l-4 border-primary pl-4 py-4 bg-gradient-to-r from-primary/5 to-transparent rounded-r-lg hover:shadow-sm transition-shadow">
                          <div className="flex items-start justify-between gap-4 mb-3">
                            <h4 className="font-semibold text-base lg:text-lg leading-tight pr-2">
                              Monitoring Mountain Meteorology and Snow Across Elevational Gradients in the Northeast Appalachians and Adirondacks in North America
                            </h4>
                            <Badge variant="default" className="shrink-0">2025</Badge>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-sm text-muted-foreground">
                              <span className="font-medium text-foreground/80">International Mountain Conference 2025 (IMC2025)</span>
                              <span className="hidden sm:inline text-muted-foreground/50">•</span>
                              <span className="text-primary font-medium">Innsbruck, Austria</span>
                              <span className="hidden sm:inline text-muted-foreground/50">•</span>
                              <span>September 14-18, 2025</span>
                            </div>
                            
                            <p className="text-sm text-muted-foreground leading-relaxed">
                              <span className="font-medium text-foreground/70">Lead Author:</span> Benes, J. (University of Vermont)
                            </p>
                            
                            <p className="text-sm text-muted-foreground leading-relaxed">
                              <span className="font-medium text-foreground/70">Co-authors:</span> Beauharnois, M.; Bomblies, A.; Broccolo, J.; Burakowski, E.; Casson, P.; Clemins, P. J.; Contosta, A.; Dondeti, V.; Garret, K.; Grunes, A.; and 11 others
                            </p>
                            
                            <div className="flex flex-wrap gap-2 pt-2">
                              <Badge variant="outline" className="text-xs">Accepted as Talk</Badge>
                              <Badge variant="outline" className="text-xs">Mountain Observatories</Badge>
                              <Badge variant="outline" className="text-xs">Elevational Gradient</Badge>
                              <Badge variant="outline" className="text-xs">Snow Monitoring</Badge>
                              <Badge variant="outline" className="text-xs">Extreme Weather</Badge>
                            </div>

                            <div className="pt-3 flex gap-3">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => window.open('https://imc2025.info/imc25/abstract/monitoring-meteorology-and-snow-in-mountains-across-elevational-gradients-in-northeast-appalachian-mountains-in-north-america/', '_blank')}
                              >
                                View Abstract
                              </Button>
                            </div>
                          </div>
                        </div>

                        {/* More Coming Soon */}
                        <div className="border-dashed border-2 rounded-lg p-6 text-center bg-muted/30">
                          <BookOpen className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
                          <h4 className="font-semibold text-lg mb-2">More Publications Coming Soon</h4>
                          <p className="text-sm text-muted-foreground max-w-xl mx-auto">
                            Additional peer-reviewed articles, technical reports, and conference proceedings 
                            from the Summit-to-Shore project are in preparation and will be added as they become available.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="projects" className="mt-4 sm:mt-6 lg:mt-8">
                <div className="grid gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Badge variant="default">Active</Badge>
                        Summit-to-Shore Snow Monitoring Network
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground mb-4">
                        A comprehensive environmental monitoring network spanning Vermont's elevation gradient, 
                        from mountain summits to lake shores. The network collects real-time data on snow depth, 
                        temperature, wind, precipitation, and radiation to better understand climate impacts on 
                        Vermont's snow-dependent ecosystems and communities.
                      </p>
                      <div className="flex flex-wrap gap-2 mb-4">
                        <Badge variant="secondary">Snow Hydrology</Badge>
                        <Badge variant="secondary">Climate Monitoring</Badge>
                        <Badge variant="secondary">Environmental Data</Badge>
                        <Badge variant="secondary">Real-time Sensors</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        <strong>Partners:</strong> U.S. Army Cold Regions Research and Engineering Laboratory (CRREL), 
                        University of Vermont
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Badge variant="default">Active</Badge>
                        Rural Climate Resiliency Research
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground mb-4">
                        UVM received $2.7 million in funding to advance rural climate resiliency research, 
                        focusing on understanding and preparing for climate change impacts in Vermont and 
                        the broader Northeast region.
                      </p>
                      <div className="flex flex-wrap gap-2 mb-4">
                        <Badge variant="secondary">Climate Adaptation</Badge>
                        <Badge variant="secondary">Community Resilience</Badge>
                        <Badge variant="secondary">Impact Assessment</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        <strong>Funding:</strong> $2.7M Federal Grant (2023)
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="border-dashed">
                    <CardContent className="pt-6 text-center">
                      <p className="text-muted-foreground">
                        Additional project details and outcomes will be published as research progresses.
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="awards" className="mt-4 sm:mt-6 lg:mt-8">
                <Card className="border-dashed">
                  <CardHeader className="text-center pb-8">
                    <Award className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
                    <CardTitle className="text-2xl">Awards & Recognition</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center pb-8">
                    <p className="text-muted-foreground max-w-2xl mx-auto mb-6">
                      Awards and recognition for the Summit-to-Shore project will be documented here as they 
                      are received. This includes research grants, academic honors, and institutional recognition.
                    </p>
                    <div className="bg-primary/5 rounded-lg p-6 max-w-2xl mx-auto">
                      <p className="text-sm text-muted-foreground mb-2">
                        <strong>Recent Funding:</strong>
                      </p>
                      <p className="text-sm">
                        UVM Water Resources Institute - Inaugural WRI Collaborative Research Grant<br />
                        <span className="text-muted-foreground">Supporting interdisciplinary water and climate research</span>
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="outreach" className="mt-4 sm:mt-6 lg:mt-8">
                <Card className="border-dashed">
                  <CardHeader className="text-center pb-8">
                    <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
                    <CardTitle className="text-2xl">Community Outreach & Education</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center pb-8">
                    <p className="text-muted-foreground max-w-2xl mx-auto mb-6">
                      The Summit-to-Shore project is committed to sharing research findings with communities, 
                      stakeholders, and the public. Outreach activities, workshops, and educational materials 
                      will be documented here as they become available.
                    </p>
                    <div className="space-y-4 max-w-2xl mx-auto">
                      <div className="bg-primary/5 rounded-lg p-6 text-left">
                        <p className="font-medium mb-2">Data Accessibility</p>
                        <p className="text-sm text-muted-foreground">
                          Real-time environmental data is made freely available through this platform to support 
                          researchers, educators, policy makers, and the public in understanding Vermont's changing climate.
                        </p>
                      </div>
                      <div className="bg-primary/5 rounded-lg p-6 text-left">
                        <p className="font-medium mb-2">Collaborative Research</p>
                        <p className="text-sm text-muted-foreground">
                          The project welcomes collaboration with other institutions and networks. API access and 
                          data sharing protocols enable integration with broader research initiatives.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </section>

        {/* Collaborations */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <Badge variant="outline" className="mb-4">
                <Building className="w-4 h-4 mr-2" />
                Partnerships
              </Badge>
              <h2 className="scientific-heading text-3xl md:text-4xl mb-6">
                Research <span className="text-primary">Collaborations</span>
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Working with institutions across the region and beyond to advance environmental science
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {collaborations.map((collab) => (
                <Card key={collab.name} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{collab.name}</CardTitle>
                      <Badge variant="secondary" className="text-xs">
                        {collab.type}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{collab.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Research;