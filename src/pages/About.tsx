import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AboutProject from '@/components/AboutProject';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Info, Target, Eye, Heart } from 'lucide-react';

const About = () => {
  const objectives = [
    {
      title: 'Snowpack Monitoring',
      description: 'High-resolution monitoring of snowpack characteristics and meteorological variables across elevational gradients',
      icon: Target
    },
    {
      title: 'Remote Sensing Integration',
      description: 'UAV and LiDAR snow depth measurements to characterize snowpack evolution across varying forest cover and topography',
      icon: Eye
    },
    {
      title: 'Computational Model Validation',
      description: 'Provide forcing and validation data for computational snowpack models in understudied montane environments',
      icon: Heart
    }
  ];

  const timeline = [
    {
      year: 'Nov 2022',
      title: 'Project Launch',
      description: 'Summit-to-Shore Environmental Monitoring Network officially launched with station installations'
    },
    {
      year: '2022-2023',
      title: 'First Season Data Collection',
      description: 'Initial deployment of monitoring stations and first season of comprehensive data collection'
    },
    {
      year: '2023-2024',
      title: 'Second Season & Expansion',
      description: 'Completed second season of data collection with network expansion to 22 monitoring locations'
    },
    {
      year: '2024-2025',
      title: 'Current Season',
      description: 'Ongoing third season data collection with enhanced monitoring capabilities and data quality improvements'
    },
    {
      year: '2025',
      title: 'Strategic Partnerships',
      description: 'Collaboration expansion with White Face Mountain Observatory, Mount Washington Observatory, and Vermont Mesonet integration'
    },
    {
      year: 'Future',
      title: 'Network Growth',
      description: 'Planned expansion across New England with advanced sensor technologies and real-time data streaming'
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
                This Summit-to-Shore (S2S) observatory network monitors snowpack characteristics and meteorological 
                variables at high spatial and temporal resolution across an elevational transect in Vermont. 
                Traditional meteorological measurements combined with detailed snowpack measurements provide 
                high-resolution observational data for computational snowpack models, augmenting research in 
                low-elevation montane environments understudied with respect to snowpack dynamics.
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
                Advancing snowpack research through high-resolution monitoring, remote sensing, and computational modeling 
                to better understand snow dynamics in Vermont's montane environments
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
                  <div className="text-4xl font-bold text-primary">22</div>
                  <CardTitle className="text-lg">Monitoring Locations</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">Active environmental monitoring stations</p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardHeader>
                  <div className="text-4xl font-bold text-primary">3</div>
                  <CardTitle className="text-lg">Data Seasons</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">Complete seasons of data collection</p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardHeader>
                  <div className="text-4xl font-bold text-primary">4</div>
                  <CardTitle className="text-lg">Data Tables</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">Comprehensive environmental datasets</p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardHeader>
                  <div className="text-4xl font-bold text-primary">5</div>
                  <CardTitle className="text-lg">Partner Organizations</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">UVM, CRREL, White Face, Mt. Washington, VT Mesonet</p>
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
                    Strategic expansion through partnerships with White Face Mountain Observatory, 
                    Mount Washington Observatory, and Vermont Mesonet integration in 2025.
                  </p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Regional network integration</li>
                    <li>• Enhanced data quality and coverage</li>
                    <li>• Cross-platform data sharing</li>
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