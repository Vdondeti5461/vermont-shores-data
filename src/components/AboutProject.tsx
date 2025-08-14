import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Thermometer, Droplets, Wind, Sun, Zap, Mountain } from 'lucide-react';

const AboutProject = () => {
  const features = [
    {
      icon: Mountain,
      title: 'Elevational Transect Monitoring',
      description: 'High spatial and temporal resolution monitoring across Vermont elevational gradients from summit to shore'
    },
    {
      icon: Thermometer,
      title: 'Snowpack Temperature',
      description: 'Detailed snowpack temperature profiling to understand thermal dynamics and melt processes'
    },
    {
      icon: Droplets,
      title: 'Snow Depth & SWE',
      description: 'Continuous snow depth and snow water equivalent measurements using ultrasonic sensors and snow pillows'
    },
    {
      icon: Wind,
      title: 'Meteorological Variables',
      description: 'Comprehensive weather monitoring including wind, humidity, precipitation, and radiation'
    },
    {
      icon: Sun,
      title: 'Remote Sensing Integration',
      description: 'UAV and LiDAR snow depth measurements for spatial snowpack characterization'
    },
    {
      icon: Zap,
      title: 'Model Validation Data',
      description: 'High-resolution observational data for computational snowpack model forcing and validation'
    }
  ];

  return (
    <section id="about" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <Badge variant="outline" className="mb-4">
            Snow Observatory Network • UVM x CRREL
          </Badge>
          <h2 className="scientific-heading text-4xl md:text-5xl mb-6">
            <span className="text-primary">Summit-to-Shore</span> Snow Observatory Network
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            A collaborative research initiative between the University of Vermont and CRREL, 
            monitoring snowpack characteristics and meteorological variables at high spatial 
            and temporal resolution across Vermont's elevational transects to understand 
            snowpack dynamics in low-elevation montane environments.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <Card className="data-card">
            <CardHeader>
              <CardTitle className="text-2xl text-primary">Research Objectives</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                The S2S observatory network provides high-resolution observational data as forcings 
                and validation for computational snowpack models, combining traditional meteorological 
                measurements with detailed snowpack analysis across Vermont's elevational gradients.
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start">
                  <span className="inline-block w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Understand major landscape determinants of snowpack distribution in Vermont
                </li>
                <li className="flex items-start">
                  <span className="inline-block w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Characterize snowpack ablation across elevational gradients and meteorological drivers
                </li>
                <li className="flex items-start">
                  <span className="inline-block w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Model anomalous mid-winter warming events and their effects on snowpack ablation
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="data-card">
            <CardHeader>
              <CardTitle className="text-2xl text-primary">Data Collection Network</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                The network spans from Potash Brook (45m) to Mansfield Summit (1169m), monitoring 
                snowpack evolution in response to varying forest cover, topography, and meteorologic 
                drivers using automated weather stations and snow monitoring equipment.
              </p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="text-center p-3 bg-primary/5 rounded-lg">
                  <div className="font-bold text-primary text-lg">12</div>
                  <div className="text-muted-foreground">Monitoring Sites</div>
                </div>
                <div className="text-center p-3 bg-secondary/10 rounded-lg">
                  <div className="font-bold text-secondary text-lg">1124m</div>
                  <div className="text-muted-foreground">Elevation Range</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mb-16">
          <h3 className="scientific-heading text-3xl text-center mb-8 text-primary">
            Environmental Parameters Monitored
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="data-card hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-6 text-center">
                    <Icon className="h-12 w-12 mx-auto mb-4 text-primary" />
                    <h4 className="font-semibold text-lg mb-2">{feature.title}</h4>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        <Card className="data-card bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
          <CardContent className="p-8 text-center">
            <h3 className="scientific-heading text-2xl mb-4 text-primary">
              Open Science & Data Accessibility
            </h3>
            <p className="text-muted-foreground mb-6 max-w-3xl mx-auto">
              We believe in open science. All collected data is made available to researchers, 
              educators, and the public to advance environmental understanding and support 
              evidence-based decision making.
            </p>
            <Badge variant="outline" className="bg-background">
              Supporting Vermont's Environmental Future
            </Badge>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default AboutProject;