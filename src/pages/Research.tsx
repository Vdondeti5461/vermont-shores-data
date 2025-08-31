import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Team from '@/components/Team';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Users, BookOpen, Award, Building } from 'lucide-react';

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
              <TabsList className="grid w-full grid-cols-2 xs:grid-cols-4 gap-1 h-auto p-1">
                <TabsTrigger value="publications" className="text-xs xs:text-sm py-2 px-2 xs:px-3">
                  <span className="xs:hidden">Papers</span>
                  <span className="hidden xs:inline">Publications</span>
                </TabsTrigger>
                <TabsTrigger value="projects" className="text-xs xs:text-sm py-2 px-2 xs:px-3">
                  <span className="xs:hidden">Projects</span>
                  <span className="hidden xs:inline">Active Projects</span>
                </TabsTrigger>
                <TabsTrigger value="awards" className="text-xs xs:text-sm py-2 px-2 xs:px-3">
                  <span className="xs:hidden">Awards</span>
                  <span className="hidden xs:inline">Awards & Grants</span>
                </TabsTrigger>
                <TabsTrigger value="outreach" className="text-xs xs:text-sm py-2 px-2 xs:px-3">
                  Outreach
                </TabsTrigger>
              </TabsList>

              <TabsContent value="publications" className="mt-8">
                <div className="grid gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BookOpen className="h-5 w-5" />
                        Recent Publications
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3 xs:space-y-4">
                        <div className="border-l-4 border-primary pl-3 xs:pl-4 py-2">
                          <h4 className="font-semibold text-sm xs:text-base mb-1">Climate-driven changes in montane forest ecosystems</h4>
                          <p className="text-xs xs:text-sm text-muted-foreground">
                            Journal of Environmental Change, 2024
                          </p>
                          <p className="text-xs xs:text-sm text-muted-foreground mt-1">
                            Smith, J., Johnson, M., et al.
                          </p>
                        </div>
                        <div className="border-l-4 border-primary pl-3 xs:pl-4 py-2">
                          <h4 className="font-semibold text-sm xs:text-base mb-1">Snow water equivalent trends in Vermont mountains</h4>
                          <p className="text-xs xs:text-sm text-muted-foreground">
                            Hydrological Processes, 2023
                          </p>
                          <p className="text-xs xs:text-sm text-muted-foreground mt-1">
                            Davis, K., Wilson, R., et al.
                          </p>
                        </div>
                        <div className="border-l-4 border-primary pl-3 xs:pl-4 py-2">
                          <h4 className="font-semibold text-sm xs:text-base mb-1">Automated environmental monitoring networks</h4>
                          <p className="text-xs xs:text-sm text-muted-foreground">
                            Environmental Monitoring and Assessment, 2023
                          </p>
                          <p className="text-xs xs:text-sm text-muted-foreground mt-1">
                            Brown, L., Anderson, T., et al.
                          </p>
                        </div>
                      </div>
                      <div className="mt-6">
                        <Button variant="outline">View All Publications</Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="projects" className="mt-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 xs:gap-6">
                  <Card className="hover:shadow-lg transition-shadow touch:active:scale-98">
                    <CardHeader className="pb-3 xs:pb-4">
                      <CardTitle className="text-base xs:text-lg">NSF Climate Impacts Study</CardTitle>
                      <Badge variant="secondary" className="w-fit text-xs">2022-2025</Badge>
                    </CardHeader>
                    <CardContent>
                      <p className="text-xs xs:text-sm text-muted-foreground mb-2 xs:mb-3 leading-relaxed">
                        Multi-year study of climate change impacts on high-elevation ecosystems.
                      </p>
                      <p className="text-xs xs:text-sm text-muted-foreground font-medium">Funding: $1.2M</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>USDA Forest Health Initiative</CardTitle>
                      <Badge variant="secondary">2023-2026</Badge>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground mb-3">
                        Forest ecosystem monitoring and health assessment across Vermont.
                      </p>
                      <p className="text-sm text-muted-foreground">Funding: $850K</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>EPA Water Quality Monitoring</CardTitle>
                      <Badge variant="secondary">2021-2024</Badge>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground mb-3">
                        Comprehensive water quality assessment in Vermont watersheds.
                      </p>
                      <p className="text-sm text-muted-foreground">Funding: $650K</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>NOAA Climate Adaptation</CardTitle>
                      <Badge variant="secondary">2024-2027</Badge>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground mb-3">
                        Climate adaptation strategies for Vermont communities.
                      </p>
                      <p className="text-sm text-muted-foreground">Funding: $950K</p>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="awards" className="mt-8">
                <div className="grid gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Award className="h-5 w-5 text-yellow-500" />
                        Recognition & Awards
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-start gap-4">
                          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
                            <Award className="h-8 w-8 text-yellow-600" />
                          </div>
                          <div>
                            <h4 className="font-semibold">Excellence in Environmental Monitoring</h4>
                            <p className="text-sm text-muted-foreground">
                              American Geophysical Union, 2023
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-4">
                          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                            <Award className="h-8 w-8 text-blue-600" />
                          </div>
                          <div>
                            <h4 className="font-semibold">Outstanding Research Collaboration</h4>
                            <p className="text-sm text-muted-foreground">
                              Vermont Science Foundation, 2022
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-4">
                          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                            <Award className="h-8 w-8 text-green-600" />
                          </div>
                          <div>
                            <h4 className="font-semibold">Best Scientific Data Platform</h4>
                            <p className="text-sm text-muted-foreground">
                              Environmental Data Initiative, 2023
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="outreach" className="mt-8">
                <div className="grid md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Educational Programs</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li>• K-12 school visits and workshops</li>
                        <li>• Undergraduate research opportunities</li>
                        <li>• Graduate student training programs</li>
                        <li>• Public lectures and seminars</li>
                        <li>• Citizen science initiatives</li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Community Engagement</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li>• Town hall meetings</li>
                        <li>• Policy briefings</li>
                        <li>• Media interviews</li>
                        <li>• Public data access portal</li>
                        <li>• Stakeholder workshops</li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>
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