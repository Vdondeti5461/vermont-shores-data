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
    <section id="about" className="py-20 bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 bg-primary/5 border-primary/20">
              Snow Observatory Network • UVM x CRREL
            </Badge>
            <h2 className="scientific-heading text-4xl md:text-5xl mb-6">
              <span className="text-primary">Summit-to-Shore</span> Snow Observatory Network
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-4xl mx-auto">
              A collaborative research initiative between the University of Vermont and CRREL, 
              monitoring snowpack characteristics and meteorological variables at high spatial 
              and temporal resolution across Vermont's elevational transects to understand 
              snowpack dynamics in low-elevation montane environments.
            </p>
          </div>

          {/* Stats Overview */}
          <div className="grid md:grid-cols-4 gap-6 mb-16">
            <Card className="data-card text-center bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
              <CardContent className="p-6">
                <div className="text-3xl font-bold text-primary mb-2">22+</div>
                <div className="text-sm text-muted-foreground">Monitoring Sites</div>
              </CardContent>
            </Card>
            <Card className="data-card text-center bg-gradient-to-br from-blue-500/5 to-blue-500/10 border-blue-500/20">
              <CardContent className="p-6">
                <div className="text-3xl font-bold text-blue-600 mb-2">1124m</div>
                <div className="text-sm text-muted-foreground">Elevation Range</div>
              </CardContent>
            </Card>
            <Card className="data-card text-center bg-gradient-to-br from-green-500/5 to-green-500/10 border-green-500/20">
              <CardContent className="p-6">
                <div className="text-3xl font-bold text-green-600 mb-2">24/7</div>
                <div className="text-sm text-muted-foreground">Continuous Data</div>
              </CardContent>
            </Card>
            <Card className="data-card text-center bg-gradient-to-br from-purple-500/5 to-purple-500/10 border-purple-500/20">
              <CardContent className="p-6">
                <div className="text-3xl font-bold text-purple-600 mb-2">10min</div>
                <div className="text-sm text-muted-foreground">Data Resolution</div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-2 gap-8 mb-16">
            <Card className="data-card border-2 hover:border-primary/30 transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-2xl text-primary flex items-center gap-2">
                  <Mountain className="h-6 w-6" />
                  Research Objectives
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  The S2S observatory network provides high-resolution observational data as forcings 
                  and validation for computational snowpack models, combining traditional meteorological 
                  measurements with detailed snowpack analysis across Vermont's elevational gradients.
                </p>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center mt-0.5">
                      <span className="w-2 h-2 bg-primary rounded-full"></span>
                    </div>
                    Understand major landscape determinants of snowpack distribution in Vermont
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center mt-0.5">
                      <span className="w-2 h-2 bg-primary rounded-full"></span>
                    </div>
                    Characterize snowpack ablation across elevational gradients and meteorological drivers
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center mt-0.5">
                      <span className="w-2 h-2 bg-primary rounded-full"></span>
                    </div>
                    Model anomalous mid-winter warming events and their effects on snowpack ablation
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="data-card border-2 hover:border-primary/30 transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-2xl text-primary flex items-center gap-2">
                  <Zap className="h-6 w-6" />
                  Monitoring Network
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  The network spans from Potash Brook (45m) to Mansfield Summit (1169m), monitoring 
                  snowpack evolution in response to varying forest cover, topography, and meteorologic 
                  drivers using automated weather stations and snow monitoring equipment.
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gradient-to-br from-primary/5 to-primary/10 p-4 rounded-lg border border-primary/20">
                    <div className="font-bold text-primary text-lg">UAV + LiDAR</div>
                    <div className="text-xs text-muted-foreground">Remote Sensing</div>
                  </div>
                  <div className="bg-gradient-to-br from-secondary/5 to-secondary/10 p-4 rounded-lg border border-secondary/20">
                    <div className="font-bold text-secondary text-lg">Real-time</div>
                    <div className="text-xs text-muted-foreground">Data Streaming</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Environmental Parameters Section */}
          <div className="mb-16">
            <div className="text-center mb-10">
              <h3 className="scientific-heading text-3xl mb-4 text-primary">
                Environmental Parameters Monitored
              </h3>
              <p className="text-muted-foreground max-w-3xl mx-auto">
                Comprehensive monitoring across multiple environmental variables to understand snowpack dynamics
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <Card key={index} className="data-card group hover:shadow-xl hover:scale-105 transition-all duration-300 border-2 hover:border-primary/30">
                    <CardContent className="p-6 text-center">
                      <div className="w-16 h-16 bg-gradient-to-br from-primary/10 to-primary/20 rounded-xl mx-auto mb-4 flex items-center justify-center group-hover:from-primary/20 group-hover:to-primary/30 transition-all duration-300">
                        <Icon className="h-8 w-8 text-primary" />
                      </div>
                      <h4 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors duration-300">{feature.title}</h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Open Science Section */}
          <Card className="data-card bg-gradient-to-r from-primary/5 via-secondary/5 to-primary/5 border-2 border-primary/20 shadow-xl">
            <CardContent className="p-8 text-center">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Sun className="h-8 w-8 text-primary" />
                <h3 className="scientific-heading text-2xl text-primary">
                  Open Science & Data Accessibility
                </h3>
              </div>
              <p className="text-muted-foreground mb-6 max-w-4xl mx-auto leading-relaxed">
                We believe in open science and collaborative research. All collected data from our 22+ monitoring 
                sites is made available to researchers, educators, and the public to advance environmental 
                understanding and support evidence-based decision making for Vermont's environmental future.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <Badge variant="outline" className="bg-background/50 hover:bg-primary/10 transition-colors">
                  Open Data Initiative
                </Badge>
                <Badge variant="outline" className="bg-background/50 hover:bg-secondary/10 transition-colors">
                  Research Collaboration
                </Badge>
                <Badge variant="outline" className="bg-background/50 hover:bg-green-500/10 transition-colors">
                  Educational Resources
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default AboutProject;