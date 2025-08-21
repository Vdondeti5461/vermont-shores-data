import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AboutProject from '@/components/AboutProject';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Info, Target, Eye, Heart } from 'lucide-react';

const About = () => {
  const objectives = [
    {
      title: 'Long-term Monitoring',
      description: 'Establish sustainable environmental monitoring across elevation gradients',
      icon: Target
    },
    {
      title: 'Data Integration',
      description: 'Create comprehensive datasets for climate and ecosystem research',
      icon: Eye
    },
    {
      title: 'Scientific Collaboration',
      description: 'Foster partnerships between academic, government, and community organizations',
      icon: Heart
    }
  ];

  const timeline = [
    {
      year: '2015',
      title: 'Project Inception',
      description: 'Initial planning and site selection began with UVM and CRREL partnership'
    },
    {
      year: '2016',
      title: 'First Stations',
      description: 'Deployment of initial monitoring stations at key elevation sites'
    },
    {
      year: '2018',
      title: 'Network Expansion',
      description: 'Addition of 15 new monitoring locations across Vermont'
    },
    {
      year: '2020',
      title: 'Data Platform Launch',
      description: 'Public release of real-time data access portal'
    },
    {
      year: '2022',
      title: 'Advanced Analytics',
      description: 'Implementation of machine learning and predictive modeling'
    },
    {
      year: '2024',
      title: 'Current Phase',
      description: 'Ongoing expansion and research integration'
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
                <Info className="w-4 h-4 mr-2" />
                About the Project
              </Badge>
              <h1 className="scientific-heading text-4xl md:text-6xl mb-6">
                Summit-to-Shore <span className="text-primary">Environmental</span>
                <br />Monitoring Network
              </h1>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                A collaborative research initiative between the University of Vermont and CRREL, 
                monitoring environmental conditions across Vermont's diverse landscapes.
              </p>
            </div>
          </div>
        </section>

        {/* Project Overview */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <AboutProject />
          </div>
        </section>

        {/* Mission & Objectives */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <Badge variant="outline" className="mb-4">
                Mission & Vision
              </Badge>
              <h2 className="scientific-heading text-3xl md:text-4xl mb-6">
                Our <span className="text-primary">Objectives</span>
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Advancing environmental science through comprehensive monitoring and open data sharing
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {objectives.map((objective) => {
                const Icon = objective.icon;
                return (
                  <Card key={objective.title} className="text-center hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <Icon className="h-8 w-8 text-primary mx-auto mb-4" />
                      <CardTitle>{objective.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">{objective.description}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Project Timeline */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <Badge variant="outline" className="mb-4">
                Project History
              </Badge>
              <h2 className="scientific-heading text-3xl md:text-4xl mb-6">
                Development <span className="text-primary">Timeline</span>
              </h2>
            </div>

            <div className="relative">
              <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-primary/20"></div>
              
              <div className="space-y-12">
                {timeline.map((event, index) => (
                  <div key={event.year} className={`flex items-center ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}>
                    <div className={`w-1/2 ${index % 2 === 0 ? 'pr-8 text-right' : 'pl-8 text-left'}`}>
                      <Card className="hover:shadow-lg transition-shadow">
                        <CardHeader>
                          <div className={`flex items-center ${index % 2 === 0 ? 'justify-end' : 'justify-start'} gap-2`}>
                            <Badge variant="outline">{event.year}</Badge>
                          </div>
                          <CardTitle className="text-lg">{event.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-muted-foreground text-sm">{event.description}</p>
                        </CardContent>
                      </Card>
                    </div>
                    
                    <div className="relative z-10">
                      <div className="w-4 h-4 bg-primary rounded-full border-4 border-white shadow-lg"></div>
                    </div>
                    
                    <div className="w-1/2"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Impact & Achievements */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <Badge variant="outline" className="mb-4">
                Project Impact
              </Badge>
              <h2 className="scientific-heading text-3xl md:text-4xl mb-6">
                Achievements & <span className="text-primary">Impact</span>
              </h2>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <Card className="text-center">
                <CardHeader>
                  <div className="text-4xl font-bold text-primary">45</div>
                  <CardTitle className="text-lg">Monitoring Stations</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">Active environmental monitoring locations</p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardHeader>
                  <div className="text-4xl font-bold text-primary">2.3M</div>
                  <CardTitle className="text-lg">Data Points</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">Environmental measurements collected</p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardHeader>
                  <div className="text-4xl font-bold text-primary">68</div>
                  <CardTitle className="text-lg">Publications</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">Peer-reviewed research papers</p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardHeader>
                  <div className="text-4xl font-bold text-primary">12</div>
                  <CardTitle className="text-lg">Partner Institutions</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">Collaborative research partners</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Future Directions */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <Badge variant="outline" className="mb-4">
                Looking Ahead
              </Badge>
              <h2 className="scientific-heading text-3xl md:text-4xl mb-6">
                Future <span className="text-primary">Directions</span>
              </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle>Network Expansion</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Plans to add 20 additional monitoring stations across New England, 
                    expanding our coverage to include coastal and urban environments.
                  </p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Coastal monitoring stations</li>
                    <li>• Urban heat island studies</li>
                    <li>• Transboundary collaborations</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Technology Integration</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Integration of advanced technologies including satellite data, 
                    AI-powered analytics, and IoT sensor networks.
                  </p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Satellite data integration</li>
                    <li>• Machine learning models</li>
                    <li>• Real-time alert systems</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default About;