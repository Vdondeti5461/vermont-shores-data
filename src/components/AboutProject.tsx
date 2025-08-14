import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Thermometer, Droplets, Wind, Sun, Zap, Mountain } from 'lucide-react';

const AboutProject = () => {
  const features = [
    {
      icon: Thermometer,
      title: 'Temperature Monitoring',
      description: 'Continuous air and soil temperature measurements across elevation gradients'
    },
    {
      icon: Droplets,
      title: 'Precipitation Data',
      description: 'Comprehensive rainfall and snowfall data collection with high temporal resolution'
    },
    {
      icon: Wind,
      title: 'Wind Patterns',
      description: 'Wind speed and direction monitoring to understand local climate dynamics'
    },
    {
      icon: Sun,
      title: 'Solar Radiation',
      description: 'Solar irradiance measurements for understanding energy balance'
    },
    {
      icon: Zap,
      title: 'Atmospheric Sensors',
      description: 'Advanced sensors measuring humidity, pressure, and air quality parameters'
    },
    {
      icon: Mountain,
      title: 'Elevation Analysis',
      description: 'Multi-elevation monitoring from mountain peaks to valley floors'
    }
  ];

  return (
    <section id="about" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <Badge variant="outline" className="mb-4">
            Environmental Research Initiative
          </Badge>
          <h2 className="scientific-heading text-4xl md:text-5xl mb-6">
            About the <span className="text-primary">Summit 2 Shore</span> Project
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            The Summit 2 Shore project is a comprehensive environmental monitoring initiative 
            led by the University of Vermont, designed to understand climate and environmental 
            patterns across Vermont's diverse landscapes.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <Card className="data-card">
            <CardHeader>
              <CardTitle className="text-2xl text-primary">Research Objectives</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Our mission is to create a comprehensive understanding of Vermont's climate 
                patterns by collecting high-resolution environmental data across diverse 
                ecosystems - from mountain summits to lake shores.
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start">
                  <span className="inline-block w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Climate change impact assessment across elevation gradients
                </li>
                <li className="flex items-start">
                  <span className="inline-block w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Ecosystem response to environmental variability
                </li>
                <li className="flex items-start">
                  <span className="inline-block w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Long-term environmental monitoring and trend analysis
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
                Our network spans 22 strategically located sites across Vermont, equipped 
                with state-of-the-art environmental sensors and data loggers providing 
                real-time measurements.
              </p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="text-center p-3 bg-primary/5 rounded-lg">
                  <div className="font-bold text-primary text-lg">24/7</div>
                  <div className="text-muted-foreground">Continuous Monitoring</div>
                </div>
                <div className="text-center p-3 bg-secondary/10 rounded-lg">
                  <div className="font-bold text-secondary text-lg">15min</div>
                  <div className="text-muted-foreground">Data Resolution</div>
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