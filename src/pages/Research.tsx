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

              <TabsContent value="publications" className="mt-6 xs:mt-8">
                <div className="grid gap-4 xs:gap-6">
                  <Card>
                    <CardHeader className="pb-3 xs:pb-4">
                      <CardTitle className="flex items-center gap-2 text-base xs:text-lg">
                        <BookOpen className="h-4 w-4 xs:h-5 xs:w-5" />
                        Recent Publications
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3 xs:space-y-4">
                        <div className="border-l-4 border-primary pl-3 xs:pl-4 py-2 xs:py-3 bg-gradient-to-r from-primary/5 to-transparent rounded-r-lg">
                          <h4 className="font-semibold text-sm xs:text-base mb-1 xs:mb-2 leading-tight">Climate-driven changes in montane forest ecosystems</h4>
                          <div className="flex flex-col xs:flex-row xs:items-center gap-1 xs:gap-2 text-xs xs:text-sm text-muted-foreground">
                            <span className="font-medium">Journal of Environmental Change</span>
                            <span className="hidden xs:inline">•</span>
                            <span>2024</span>
                          </div>
                          <p className="text-xs xs:text-sm text-muted-foreground mt-1 xs:mt-2">
                            <span className="font-medium">Authors:</span> Smith, J., Johnson, M., et al.
                          </p>
                          <div className="flex flex-wrap gap-1 xs:gap-2 mt-2">
                            <Badge variant="outline" className="text-2xs xs:text-xs">Climate Change</Badge>
                            <Badge variant="outline" className="text-2xs xs:text-xs">Forest Ecology</Badge>
                          </div>
                        </div>
                        
                        <div className="border-l-4 border-primary pl-3 xs:pl-4 py-2 xs:py-3 bg-gradient-to-r from-primary/5 to-transparent rounded-r-lg">
                          <h4 className="font-semibold text-sm xs:text-base mb-1 xs:mb-2 leading-tight">Snow water equivalent trends in Vermont mountains</h4>
                          <div className="flex flex-col xs:flex-row xs:items-center gap-1 xs:gap-2 text-xs xs:text-sm text-muted-foreground">
                            <span className="font-medium">Hydrological Processes</span>
                            <span className="hidden xs:inline">•</span>
                            <span>2023</span>
                          </div>
                          <p className="text-xs xs:text-sm text-muted-foreground mt-1 xs:mt-2">
                            <span className="font-medium">Authors:</span> Davis, K., Wilson, R., et al.
                          </p>
                          <div className="flex flex-wrap gap-1 xs:gap-2 mt-2">
                            <Badge variant="outline" className="text-2xs xs:text-xs">Snow Hydrology</Badge>
                            <Badge variant="outline" className="text-2xs xs:text-xs">Mountain Ecosystems</Badge>
                          </div>
                        </div>
                        
                        <div className="border-l-4 border-primary pl-3 xs:pl-4 py-2 xs:py-3 bg-gradient-to-r from-primary/5 to-transparent rounded-r-lg">
                          <h4 className="font-semibold text-sm xs:text-base mb-1 xs:mb-2 leading-tight">Automated environmental monitoring networks</h4>
                          <div className="flex flex-col xs:flex-row xs:items-center gap-1 xs:gap-2 text-xs xs:text-sm text-muted-foreground">
                            <span className="font-medium">Environmental Monitoring and Assessment</span>
                            <span className="hidden xs:inline">•</span>
                            <span>2023</span>
                          </div>
                          <p className="text-xs xs:text-sm text-muted-foreground mt-1 xs:mt-2">
                            <span className="font-medium">Authors:</span> Brown, L., Anderson, T., et al.
                          </p>
                          <div className="flex flex-wrap gap-1 xs:gap-2 mt-2">
                            <Badge variant="outline" className="text-2xs xs:text-xs">Monitoring Systems</Badge>
                            <Badge variant="outline" className="text-2xs xs:text-xs">Data Science</Badge>
                          </div>
                        </div>
                        
                        <div className="border-l-4 border-secondary pl-3 xs:pl-4 py-2 xs:py-3 bg-gradient-to-r from-secondary/5 to-transparent rounded-r-lg">
                          <h4 className="font-semibold text-sm xs:text-base mb-1 xs:mb-2 leading-tight">Real-time data quality assessment in environmental sensors</h4>
                          <div className="flex flex-col xs:flex-row xs:items-center gap-1 xs:gap-2 text-xs xs:text-sm text-muted-foreground">
                            <span className="font-medium">Sensors and Actuators</span>
                            <span className="hidden xs:inline">•</span>
                            <span>2024</span>
                          </div>
                          <p className="text-xs xs:text-sm text-muted-foreground mt-1 xs:mt-2">
                            <span className="font-medium">Authors:</span> Martinez, A., Thompson, C., et al.
                          </p>
                          <div className="flex flex-wrap gap-1 xs:gap-2 mt-2">
                            <Badge variant="outline" className="text-2xs xs:text-xs">Sensor Networks</Badge>
                            <Badge variant="outline" className="text-2xs xs:text-xs">Quality Control</Badge>
                          </div>
                        </div>
                        
                        <div className="border-l-4 border-secondary pl-3 xs:pl-4 py-2 xs:py-3 bg-gradient-to-r from-secondary/5 to-transparent rounded-r-lg">
                          <h4 className="font-semibold text-sm xs:text-base mb-1 xs:mb-2 leading-tight">Machine learning approaches for environmental data validation</h4>
                          <div className="flex flex-col xs:flex-row xs:items-center gap-1 xs:gap-2 text-xs xs:text-sm text-muted-foreground">
                            <span className="font-medium">Environmental Informatics</span>
                            <span className="hidden xs:inline">•</span>
                            <span>2023</span>
                          </div>
                          <p className="text-xs xs:text-sm text-muted-foreground mt-1 xs:mt-2">
                            <span className="font-medium">Authors:</span> Lee, S., Rodriguez, M., et al.
                          </p>
                          <div className="flex flex-wrap gap-1 xs:gap-2 mt-2">
                            <Badge variant="outline" className="text-2xs xs:text-xs">Machine Learning</Badge>
                            <Badge variant="outline" className="text-2xs xs:text-xs">Data Validation</Badge>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-4 xs:mt-6 pt-4 xs:pt-6 border-t">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 xs:gap-4 mb-4 xs:mb-6">
                          <div className="text-center p-2 xs:p-3 bg-muted/50 rounded-lg">
                            <div className="text-lg xs:text-xl font-bold text-primary">68</div>
                            <div className="text-xs xs:text-sm text-muted-foreground">Total Publications</div>
                          </div>
                          <div className="text-center p-2 xs:p-3 bg-muted/50 rounded-lg">
                            <div className="text-lg xs:text-xl font-bold text-green-600">12</div>
                            <div className="text-xs xs:text-sm text-muted-foreground">This Year</div>
                          </div>
                          <div className="text-center p-2 xs:p-3 bg-muted/50 rounded-lg">
                            <div className="text-lg xs:text-xl font-bold text-blue-600">2.4</div>
                            <div className="text-xs xs:text-sm text-muted-foreground">Avg Impact</div>
                          </div>
                          <div className="text-center p-2 xs:p-3 bg-muted/50 rounded-lg">
                            <div className="text-lg xs:text-xl font-bold text-orange-600">156</div>
                            <div className="text-xs xs:text-sm text-muted-foreground">Citations</div>
                          </div>
                        </div>
                        <Button variant="outline" className="w-full xs:w-auto touch:active:scale-98 transition-transform">
                          View All Publications
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="projects" className="mt-6 xs:mt-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 xs:gap-6">
                  <Card className="hover:shadow-lg transition-shadow touch:active:scale-98">
                    <CardHeader className="pb-3 xs:pb-4">
                      <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-2 xs:gap-4">
                        <CardTitle className="text-base xs:text-lg leading-tight">NSF Climate Impacts Study</CardTitle>
                        <Badge variant="secondary" className="w-fit text-xs">2022-2025</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-xs xs:text-sm text-muted-foreground mb-3 xs:mb-4 leading-relaxed">
                        Multi-year study of climate change impacts on high-elevation ecosystems across Vermont's mountain regions.
                      </p>
                      <div className="grid grid-cols-2 gap-3 xs:gap-4 mb-3 xs:mb-4">
                        <div className="text-center p-2 xs:p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                          <div className="text-sm xs:text-base font-bold text-green-600">$1.2M</div>
                          <div className="text-xs text-muted-foreground">Funding</div>
                        </div>
                        <div className="text-center p-2 xs:p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                          <div className="text-sm xs:text-base font-bold text-blue-600">45%</div>
                          <div className="text-xs text-muted-foreground">Complete</div>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1 xs:gap-2">
                        <Badge variant="outline" className="text-2xs xs:text-xs">Climate Research</Badge>
                        <Badge variant="outline" className="text-2xs xs:text-xs">Ecosystem Monitoring</Badge>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="hover:shadow-lg transition-shadow touch:active:scale-98">
                    <CardHeader className="pb-3 xs:pb-4">
                      <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-2 xs:gap-4">
                        <CardTitle className="text-base xs:text-lg leading-tight">USDA Forest Health Initiative</CardTitle>
                        <Badge variant="secondary" className="w-fit text-xs">2023-2026</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-xs xs:text-sm text-muted-foreground mb-3 xs:mb-4 leading-relaxed">
                        Forest ecosystem monitoring and health assessment across Vermont with real-time data collection.
                      </p>
                      <div className="grid grid-cols-2 gap-3 xs:gap-4 mb-3 xs:mb-4">
                        <div className="text-center p-2 xs:p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                          <div className="text-sm xs:text-base font-bold text-green-600">$850K</div>
                          <div className="text-xs text-muted-foreground">Funding</div>
                        </div>
                        <div className="text-center p-2 xs:p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                          <div className="text-sm xs:text-base font-bold text-blue-600">62%</div>
                          <div className="text-xs text-muted-foreground">Complete</div>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1 xs:gap-2">
                        <Badge variant="outline" className="text-2xs xs:text-xs">Forest Health</Badge>
                        <Badge variant="outline" className="text-2xs xs:text-xs">Environmental Monitoring</Badge>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="hover:shadow-lg transition-shadow touch:active:scale-98">
                    <CardHeader className="pb-3 xs:pb-4">
                      <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-2 xs:gap-4">
                        <CardTitle className="text-base xs:text-lg leading-tight">EPA Water Quality Monitoring</CardTitle>
                        <Badge variant="secondary" className="w-fit text-xs">2021-2024</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-xs xs:text-sm text-muted-foreground mb-3 xs:mb-4 leading-relaxed">
                        Comprehensive water quality assessment in Vermont watersheds using automated sensor networks.
                      </p>
                      <div className="grid grid-cols-2 gap-3 xs:gap-4 mb-3 xs:mb-4">
                        <div className="text-center p-2 xs:p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                          <div className="text-sm xs:text-base font-bold text-green-600">$650K</div>
                          <div className="text-xs text-muted-foreground">Funding</div>
                        </div>
                        <div className="text-center p-2 xs:p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
                          <div className="text-sm xs:text-base font-bold text-orange-600">88%</div>
                          <div className="text-xs text-muted-foreground">Complete</div>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1 xs:gap-2">
                        <Badge variant="outline" className="text-2xs xs:text-xs">Water Quality</Badge>
                        <Badge variant="outline" className="text-2xs xs:text-xs">Watershed Analysis</Badge>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="hover:shadow-lg transition-shadow touch:active:scale-98">
                    <CardHeader className="pb-3 xs:pb-4">
                      <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-2 xs:gap-4">
                        <CardTitle className="text-base xs:text-lg leading-tight">NOAA Climate Adaptation</CardTitle>
                        <Badge variant="secondary" className="w-fit text-xs">2024-2027</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-xs xs:text-sm text-muted-foreground mb-3 xs:mb-4 leading-relaxed">
                        Climate adaptation strategies for Vermont communities based on environmental monitoring data.
                      </p>
                      <div className="grid grid-cols-2 gap-3 xs:gap-4 mb-3 xs:mb-4">
                        <div className="text-center p-2 xs:p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                          <div className="text-sm xs:text-base font-bold text-green-600">$950K</div>
                          <div className="text-xs text-muted-foreground">Funding</div>
                        </div>
                        <div className="text-center p-2 xs:p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                          <div className="text-sm xs:text-base font-bold text-blue-600">15%</div>
                          <div className="text-xs text-muted-foreground">Complete</div>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1 xs:gap-2">
                        <Badge variant="outline" className="text-2xs xs:text-xs">Climate Adaptation</Badge>
                        <Badge variant="outline" className="text-2xs xs:text-xs">Community Planning</Badge>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                {/* Project Summary */}
                <div className="mt-6 xs:mt-8">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Project Portfolio Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 xs:gap-4">
                        <div className="text-center p-3 xs:p-4 bg-primary/5 rounded-lg">
                          <div className="text-xl xs:text-2xl font-bold text-primary">$3.65M</div>
                          <div className="text-xs xs:text-sm text-muted-foreground">Total Funding</div>
                        </div>
                        <div className="text-center p-3 xs:p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                          <div className="text-xl xs:text-2xl font-bold text-green-600">14</div>
                          <div className="text-xs xs:text-sm text-muted-foreground">Active Projects</div>
                        </div>
                        <div className="text-center p-3 xs:p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                          <div className="text-xl xs:text-2xl font-bold text-blue-600">52%</div>
                          <div className="text-xs xs:text-sm text-muted-foreground">Avg Completion</div>
                        </div>
                        <div className="text-center p-3 xs:p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
                          <div className="text-xl xs:text-2xl font-bold text-orange-600">8</div>
                          <div className="text-xs xs:text-sm text-muted-foreground">Partner Orgs</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="awards" className="mt-6 xs:mt-8">
                <div className="grid gap-4 xs:gap-6">
                  <Card>
                    <CardHeader className="pb-3 xs:pb-4">
                      <CardTitle className="flex items-center gap-2 text-base xs:text-lg">
                        <Award className="h-4 w-4 xs:h-5 xs:w-5 text-yellow-500" />
                        Recognition & Awards
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4 xs:space-y-6">
                        <div className="flex flex-col xs:flex-row xs:items-start gap-3 xs:gap-4 p-3 xs:p-4 bg-gradient-to-r from-yellow-50 to-transparent dark:from-yellow-950/20 rounded-lg">
                          <div className="flex-shrink-0">
                            <div className="w-12 h-12 xs:w-16 xs:h-16 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center">
                              <Award className="h-6 w-6 xs:h-8 xs:w-8 text-yellow-600" />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-sm xs:text-base mb-1 xs:mb-2">Excellence in Environmental Monitoring</h4>
                            <div className="flex flex-col xs:flex-row xs:items-center gap-1 xs:gap-2 text-xs xs:text-sm text-muted-foreground mb-2">
                              <span className="font-medium">American Geophysical Union</span>
                              <span className="hidden xs:inline">•</span>
                              <span>2023</span>
                            </div>
                            <p className="text-xs xs:text-sm text-muted-foreground leading-relaxed">
                              Recognized for innovative approaches to automated environmental data collection and quality assurance in challenging mountain environments.
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex flex-col xs:flex-row xs:items-start gap-3 xs:gap-4 p-3 xs:p-4 bg-gradient-to-r from-blue-50 to-transparent dark:from-blue-950/20 rounded-lg">
                          <div className="flex-shrink-0">
                            <div className="w-12 h-12 xs:w-16 xs:h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                              <Award className="h-6 w-6 xs:h-8 xs:w-8 text-blue-600" />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-sm xs:text-base mb-1 xs:mb-2">Outstanding Research Collaboration</h4>
                            <div className="flex flex-col xs:flex-row xs:items-center gap-1 xs:gap-2 text-xs xs:text-sm text-muted-foreground mb-2">
                              <span className="font-medium">Vermont Science Foundation</span>
                              <span className="hidden xs:inline">•</span>
                              <span>2022</span>
                            </div>
                            <p className="text-xs xs:text-sm text-muted-foreground leading-relaxed">
                              Honored for fostering interdisciplinary partnerships and advancing collaborative environmental research across multiple institutions.
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex flex-col xs:flex-row xs:items-start gap-3 xs:gap-4 p-3 xs:p-4 bg-gradient-to-r from-green-50 to-transparent dark:from-green-950/20 rounded-lg">
                          <div className="flex-shrink-0">
                            <div className="w-12 h-12 xs:w-16 xs:h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                              <Award className="h-6 w-6 xs:h-8 xs:w-8 text-green-600" />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-sm xs:text-base mb-1 xs:mb-2">Best Scientific Data Platform</h4>
                            <div className="flex flex-col xs:flex-row xs:items-center gap-1 xs:gap-2 text-xs xs:text-sm text-muted-foreground mb-2">
                              <span className="font-medium">Environmental Data Initiative</span>
                              <span className="hidden xs:inline">•</span>
                              <span>2023</span>
                            </div>
                            <p className="text-xs xs:text-sm text-muted-foreground leading-relaxed">
                              Awarded for developing an innovative, user-friendly platform that makes environmental data accessible to researchers and the public.
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex flex-col xs:flex-row xs:items-start gap-3 xs:gap-4 p-3 xs:p-4 bg-gradient-to-r from-purple-50 to-transparent dark:from-purple-950/20 rounded-lg">
                          <div className="flex-shrink-0">
                            <div className="w-12 h-12 xs:w-16 xs:h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                              <Award className="h-6 w-6 xs:h-8 xs:w-8 text-purple-600" />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-sm xs:text-base mb-1 xs:mb-2">Innovation in Data Quality Control</h4>
                            <div className="flex flex-col xs:flex-row xs:items-center gap-1 xs:gap-2 text-xs xs:text-sm text-muted-foreground mb-2">
                              <span className="font-medium">International Association of Environmental Sciences</span>
                              <span className="hidden xs:inline">•</span>
                              <span>2024</span>
                            </div>
                            <p className="text-xs xs:text-sm text-muted-foreground leading-relaxed">
                              Recognized for developing advanced algorithms and techniques for automated quality control in environmental sensor networks.
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-6 xs:mt-8 pt-4 xs:pt-6 border-t">
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 xs:gap-4">
                          <div className="text-center p-3 xs:p-4 bg-muted/50 rounded-lg">
                            <div className="text-lg xs:text-xl font-bold text-yellow-600">12</div>
                            <div className="text-xs xs:text-sm text-muted-foreground">Total Awards</div>
                          </div>
                          <div className="text-center p-3 xs:p-4 bg-muted/50 rounded-lg">
                            <div className="text-lg xs:text-xl font-bold text-blue-600">4</div>
                            <div className="text-xs xs:text-sm text-muted-foreground">This Year</div>
                          </div>
                          <div className="text-center p-3 xs:p-4 bg-muted/50 rounded-lg sm:col-span-1 col-span-2">
                            <div className="text-lg xs:text-xl font-bold text-green-600">8</div>
                            <div className="text-xs xs:text-sm text-muted-foreground">International</div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="outreach" className="mt-6 xs:mt-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 xs:gap-6">
                  <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3 xs:pb-4">
                      <CardTitle className="text-base xs:text-lg">Educational Programs</CardTitle>
                      <p className="text-xs xs:text-sm text-muted-foreground">Engaging students and educators at all levels</p>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3 xs:space-y-4">
                        <div className="flex items-start gap-3 p-2 xs:p-3 bg-muted/50 rounded-lg">
                          <div className="w-2 h-2 rounded-full bg-primary mt-2"></div>
                          <div>
                            <h5 className="font-medium text-sm xs:text-base">K-12 School Visits & Workshops</h5>
                            <p className="text-xs xs:text-sm text-muted-foreground">Interactive sessions on environmental monitoring</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3 p-2 xs:p-3 bg-muted/50 rounded-lg">
                          <div className="w-2 h-2 rounded-full bg-primary mt-2"></div>
                          <div>
                            <h5 className="font-medium text-sm xs:text-base">Undergraduate Research Opportunities</h5>
                            <p className="text-xs xs:text-sm text-muted-foreground">Hands-on research experience programs</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3 p-2 xs:p-3 bg-muted/50 rounded-lg">
                          <div className="w-2 h-2 rounded-full bg-primary mt-2"></div>
                          <div>
                            <h5 className="font-medium text-sm xs:text-base">Graduate Student Training Programs</h5>
                            <p className="text-xs xs:text-sm text-muted-foreground">Advanced environmental data science training</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3 p-2 xs:p-3 bg-muted/50 rounded-lg">
                          <div className="w-2 h-2 rounded-full bg-primary mt-2"></div>
                          <div>
                            <h5 className="font-medium text-sm xs:text-base">Public Lectures & Seminars</h5>
                            <p className="text-xs xs:text-sm text-muted-foreground">Monthly community education events</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3 p-2 xs:p-3 bg-muted/50 rounded-lg">
                          <div className="w-2 h-2 rounded-full bg-primary mt-2"></div>
                          <div>
                            <h5 className="font-medium text-sm xs:text-base">Citizen Science Initiatives</h5>
                            <p className="text-xs xs:text-sm text-muted-foreground">Community-based monitoring programs</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-4 xs:mt-6 pt-3 xs:pt-4 border-t">
                        <div className="grid grid-cols-3 gap-2 xs:gap-3">
                          <div className="text-center p-2 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                            <div className="text-sm xs:text-base font-bold text-blue-600">127</div>
                            <div className="text-xs text-muted-foreground">Students</div>
                          </div>
                          <div className="text-center p-2 bg-green-50 dark:bg-green-950/20 rounded-lg">
                            <div className="text-sm xs:text-base font-bold text-green-600">24</div>
                            <div className="text-xs text-muted-foreground">Schools</div>
                          </div>
                          <div className="text-center p-2 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
                            <div className="text-sm xs:text-base font-bold text-orange-600">18</div>
                            <div className="text-xs text-muted-foreground">Events</div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3 xs:pb-4">
                      <CardTitle className="text-base xs:text-lg">Community Engagement</CardTitle>
                      <p className="text-xs xs:text-sm text-muted-foreground">Building bridges with local communities</p>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3 xs:space-y-4">
                        <div className="flex items-start gap-3 p-2 xs:p-3 bg-muted/50 rounded-lg">
                          <div className="w-2 h-2 rounded-full bg-secondary mt-2"></div>
                          <div>
                            <h5 className="font-medium text-sm xs:text-base">Town Hall Meetings</h5>
                            <p className="text-xs xs:text-sm text-muted-foreground">Quarterly community updates and feedback sessions</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3 p-2 xs:p-3 bg-muted/50 rounded-lg">
                          <div className="w-2 h-2 rounded-full bg-secondary mt-2"></div>
                          <div>
                            <h5 className="font-medium text-sm xs:text-base">Policy Briefings</h5>
                            <p className="text-xs xs:text-sm text-muted-foreground">Data-driven insights for local government</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3 p-2 xs:p-3 bg-muted/50 rounded-lg">
                          <div className="w-2 h-2 rounded-full bg-secondary mt-2"></div>
                          <div>
                            <h5 className="font-medium text-sm xs:text-base">Media Interviews</h5>
                            <p className="text-xs xs:text-sm text-muted-foreground">Regular coverage of research findings</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3 p-2 xs:p-3 bg-muted/50 rounded-lg">
                          <div className="w-2 h-2 rounded-full bg-secondary mt-2"></div>
                          <div>
                            <h5 className="font-medium text-sm xs:text-base">Public Data Access Portal</h5>
                            <p className="text-xs xs:text-sm text-muted-foreground">Open access to environmental data</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3 p-2 xs:p-3 bg-muted/50 rounded-lg">
                          <div className="w-2 h-2 rounded-full bg-secondary mt-2"></div>
                          <div>
                            <h5 className="font-medium text-sm xs:text-base">Stakeholder Workshops</h5>
                            <p className="text-xs xs:text-sm text-muted-foreground">Collaborative planning and feedback sessions</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-4 xs:mt-6 pt-3 xs:pt-4 border-t">
                        <div className="grid grid-cols-3 gap-2 xs:gap-3">
                          <div className="text-center p-2 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                            <div className="text-sm xs:text-base font-bold text-purple-600">45</div>
                            <div className="text-xs text-muted-foreground">Events</div>
                          </div>
                          <div className="text-center p-2 bg-red-50 dark:bg-red-950/20 rounded-lg">
                            <div className="text-sm xs:text-base font-bold text-red-600">89</div>
                            <div className="text-xs text-muted-foreground">Partners</div>
                          </div>
                          <div className="text-center p-2 bg-indigo-50 dark:bg-indigo-950/20 rounded-lg">
                            <div className="text-sm xs:text-base font-bold text-indigo-600">1.2K</div>
                            <div className="text-xs text-muted-foreground">Reached</div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* Impact Metrics */}
                  <div className="lg:col-span-2">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Outreach Impact Summary</CardTitle>
                        <p className="text-sm text-muted-foreground">Annual engagement metrics and community reach</p>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 xs:gap-4">
                          <div className="text-center p-3 xs:p-4 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg">
                            <div className="text-xl xs:text-2xl font-bold text-primary">2,340</div>
                            <div className="text-xs xs:text-sm text-muted-foreground">People Reached</div>
                          </div>
                          <div className="text-center p-3 xs:p-4 bg-gradient-to-br from-green-100 to-green-50 dark:from-green-950/30 dark:to-green-950/10 rounded-lg">
                            <div className="text-xl xs:text-2xl font-bold text-green-600">156</div>
                            <div className="text-xs xs:text-sm text-muted-foreground">Students Trained</div>
                          </div>
                          <div className="text-center p-3 xs:p-4 bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-950/30 dark:to-blue-950/10 rounded-lg">
                            <div className="text-xl xs:text-2xl font-bold text-blue-600">67</div>
                            <div className="text-xs xs:text-sm text-muted-foreground">Events Hosted</div>
                          </div>
                          <div className="text-center p-3 xs:p-4 bg-gradient-to-br from-orange-100 to-orange-50 dark:from-orange-950/30 dark:to-orange-950/10 rounded-lg">
                            <div className="text-xl xs:text-2xl font-bold text-orange-600">34</div>
                            <div className="text-xs xs:text-sm text-muted-foreground">Organizations</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
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