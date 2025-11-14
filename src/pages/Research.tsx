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
      title: 'Climate Change Impacts',
      description: 'Long-term climate monitoring and impact assessment',
      icon: '🌡️',
      publications: 15,
      projects: 3
    },
    {
      title: 'Hydrological Sciences',
      description: 'Water cycle dynamics and snow hydrology',
      icon: '💧',
      publications: 23,
      projects: 5
    },
    {
      title: 'Forest Ecology',
      description: 'Forest ecosystem responses to environmental change',
      icon: '🌲',
      publications: 18,
      projects: 4
    },
    {
      title: 'Data Science',
      description: 'Environmental informatics and modeling',
      icon: '📊',
      publications: 12,
      projects: 2
    }
  ];

  const collaborations = [
    {
      name: 'USDA Forest Service',
      type: 'Federal Agency',
      description: 'Long-term forest monitoring and research partnerships'
    },
    {
      name: 'NOAA Climate Office',
      type: 'Federal Agency',
      description: 'Climate data integration and forecasting research'
    },
    {
      name: 'Vermont Agency of Natural Resources',
      type: 'State Agency',
      description: 'State-level environmental monitoring and policy support'
    },
    {
      name: 'University of New Hampshire',
      type: 'Academic Partner',
      description: 'Collaborative research on ecosystem responses'
    },
    {
      name: 'Dartmouth College',
      type: 'Academic Partner',
      description: 'Snow and ice research collaborations'
    },
    {
      name: 'McGill University',
      type: 'International Partner',
      description: 'Transboundary environmental research'
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
                <Card className="border-dashed">
                  <CardHeader className="text-center pb-8">
                    <BookOpen className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
                    <CardTitle className="text-2xl">Publications Coming Soon</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center pb-8">
                    <p className="text-muted-foreground max-w-2xl mx-auto mb-6">
                      Research publications from the Summit-to-Shore Snow Monitoring Network are currently in preparation. 
                      This section will feature peer-reviewed articles, technical reports, and conference proceedings 
                      as they become available.
                    </p>
                    <div className="bg-primary/5 rounded-lg p-6 max-w-2xl mx-auto">
                      <p className="text-sm text-muted-foreground mb-2">
                        <strong>Recent Presentation:</strong>
                      </p>
                      <p className="text-sm">
                        Summit-to-Shore Snow Monitoring Network in Vermont (2023)<br />
                        <span className="text-muted-foreground">Student Research Conference, UVM ScholarWorks</span>
                      </p>
                    </div>
                  </CardContent>
                </Card>
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