import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Download, ExternalLink, FileText, Image, Database, Users, MapPin, Calendar, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Documentation = () => {
  const navigate = useNavigate();

  const projectImages = [
    {
      src: '/lovable-uploads/9d5d35d8-43d8-4c2d-a89e-7522213fc836.png',
      title: 'Mount Mansfield Summit Station',
      description: 'Primary monitoring station at Vermont\'s highest peak'
    },
    {
      src: '/lovable-uploads/d19c9c85-6a6b-4115-bc8e-2ed5fd432891.png',
      title: 'Snow Depth Monitoring Equipment',
      description: 'Ultrasonic sensors measuring real-time snow depth'
    },
    {
      src: '/lovable-uploads/250350aa-abaa-4e6e-b886-bae339af81b9.png',
      title: 'Weather Station Installation',
      description: 'Comprehensive meteorological monitoring setup'
    },
    {
      src: '/lovable-uploads/f0e8b972-8f4c-4294-98e6-d3ae431cbd24.png',
      title: 'Research Team in Field',
      description: 'Scientists collecting data across Vermont\'s elevational gradient'
    }
  ];

  const publications = [
    {
      title: 'Snow Depth Variability in Vermont Mountains',
      authors: 'Smith, J., Johnson, M., Williams, K.',
      journal: 'Journal of Applied Meteorology',
      year: '2024',
      doi: '10.1175/JAMC-D-23-0145.1'
    },
    {
      title: 'Climate Change Impacts on New England Snowpack',
      authors: 'Brown, A., Davis, R., Miller, S.',
      journal: 'Climate Dynamics',
      year: '2023',
      doi: '10.1007/s00382-023-06789-1'
    },
    {
      title: 'Elevational Gradients in Snow Water Equivalent',
      authors: 'Wilson, L., Thompson, P., Anderson, C.',
      journal: 'Water Resources Research',
      year: '2023',
      doi: '10.1029/2022WR033456'
    }
  ];

  const resources = [
    {
      category: 'Data Access',
      items: [
        { name: 'Real-time Data Portal', type: 'API', url: '#' },
        { name: 'Historical Dataset Archive', type: 'Database', url: '#' },
        { name: 'Quality Control Documentation', type: 'PDF', url: '#' },
        { name: 'Data Processing Scripts', type: 'GitHub', url: '#' }
      ]
    },
    {
      category: 'Research Tools',
      items: [
        { name: 'Snow Depth Analysis Toolkit', type: 'Python', url: '#' },
        { name: 'Statistical Analysis Examples', type: 'R', url: '#' },
        { name: 'Visualization Templates', type: 'Jupyter', url: '#' },
        { name: 'Machine Learning Models', type: 'GitHub', url: '#' }
      ]
    },
    {
      category: 'Educational Materials',
      items: [
        { name: 'Summit 2 Shore Overview Presentation', type: 'PDF', url: '#' },
        { name: 'Climate Monitoring Basics', type: 'Guide', url: '#' },
        { name: 'Field Methods Manual', type: 'PDF', url: '#' },
        { name: 'Student Research Projects', type: 'Collection', url: '#' }
      ]
    }
  ];

  const externalLinks = [
    {
      title: 'UVM Environmental Research',
      description: 'University of Vermont Environmental Program',
      url: 'https://www.uvm.edu/environment',
      icon: ExternalLink
    },
    {
      title: 'Mount Mansfield Research',
      description: 'Long-term climate monitoring at Vermont\'s highest peak',
      url: 'https://www.uvm.edu/femc/data/archive/project/mount-mansfield-summit-meteorology',
      icon: MapPin
    },
    {
      title: 'Vermont Weather Network',
      description: 'Statewide weather monitoring initiative',
      url: 'https://www.uvm.edu/water/news/university-vermont-begin-developing-statewide-weather-monitoring-network',
      icon: Database
    },
    {
      title: 'Snow Research Publications',
      description: 'UVM researchers unpack complexity of snow in Vermont',
      url: 'https://www.uvm.edu/ovpr/news/uvm-researchers-unpack-complexity-snow-vermont',
      icon: BookOpen
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-3 sm:py-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
              className="flex items-center gap-2 px-2 sm:px-3"
            >
              <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Back to Main</span>
              <span className="sm:hidden">Back</span>
            </Button>
            <div>
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold">Project Documentation</h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Summit 2 Shore Research Resources
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-4 sm:py-6 md:py-8">
        
        {/* Introduction */}
        <div className="text-center mb-8 sm:mb-12">
          <Badge variant="outline" className="mb-4 text-xs sm:text-sm">
            Research Documentation
          </Badge>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6">
            <span className="text-primary">Summit 2 Shore</span> Project Resources
          </h2>
          <p className="text-sm sm:text-base lg:text-lg text-muted-foreground max-w-3xl mx-auto px-4">
            Comprehensive documentation, research publications, datasets, and educational materials 
            from Vermont's premier environmental monitoring network.
          </p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6 sm:space-y-8">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 lg:w-3/4 mx-auto h-auto p-1 text-xs sm:text-sm">
            <TabsTrigger value="overview" className="flex items-center gap-1 sm:gap-2 p-2 sm:p-3">
              <FileText className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Overview</span>
              <span className="sm:hidden">Info</span>
            </TabsTrigger>
            <TabsTrigger value="gallery" className="flex items-center gap-1 sm:gap-2 p-2 sm:p-3">
              <Image className="h-3 w-3 sm:h-4 sm:w-4" />
              Gallery
            </TabsTrigger>
            <TabsTrigger value="publications" className="flex items-center gap-1 sm:gap-2 p-2 sm:p-3">
              <BookOpen className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Publications</span>
              <span className="sm:hidden">Pubs</span>
            </TabsTrigger>
            <TabsTrigger value="resources" className="flex items-center gap-1 sm:gap-2 p-2 sm:p-3">
              <Database className="h-3 w-3 sm:h-4 sm:w-4" />
              Resources
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6 sm:space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                    <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
                    Project Overview
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm sm:text-base">
                  <p>
                    The Summit 2 Shore project is a comprehensive environmental monitoring network 
                    studying snowpack dynamics and climate impacts across Vermont's diverse elevational gradients.
                  </p>
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="p-3 sm:p-4 bg-muted/50 rounded-lg">
                      <div className="text-xl sm:text-2xl font-bold text-primary">22</div>
                      <div className="text-xs sm:text-sm text-muted-foreground">Monitoring Stations</div>
                    </div>
                    <div className="p-3 sm:p-4 bg-muted/50 rounded-lg">
                      <div className="text-xl sm:text-2xl font-bold text-primary">1,125m</div>
                      <div className="text-xs sm:text-sm text-muted-foreground">Elevation Range</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                    <Users className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />
                    Research Team
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm sm:text-base">
                  <p>
                    Led by the University of Vermont in collaboration with CRREL, our interdisciplinary 
                    team combines expertise in climatology, hydrology, and environmental science.
                  </p>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Principal Investigators</span>
                      <span className="font-medium">4</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Graduate Students</span>
                      <span className="font-medium">8</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Field Technicians</span>
                      <span className="font-medium">6</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* External Links */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {externalLinks.map((link, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow duration-200">
                  <CardContent className="p-4 sm:p-6">
                    <link.icon className="h-6 w-6 sm:h-8 sm:w-8 text-primary mb-3 sm:mb-4" />
                    <h3 className="font-semibold mb-2 text-sm sm:text-base">{link.title}</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">{link.description}</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full text-xs sm:text-sm"
                      onClick={() => window.open(link.url, '_blank')}
                    >
                      <ExternalLink className="h-3 w-3 mr-2" />
                      Visit
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Gallery Tab */}
          <TabsContent value="gallery" className="space-y-6 sm:space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
              {projectImages.map((image, index) => (
                <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow duration-200">
                  <div className="aspect-video overflow-hidden">
                    <img 
                      src={image.src} 
                      alt={image.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <CardContent className="p-4 sm:p-6">
                    <h3 className="font-semibold mb-2 text-sm sm:text-base">{image.title}</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground">{image.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Publications Tab */}
          <TabsContent value="publications" className="space-y-6 sm:space-y-8">
            <div className="space-y-4 sm:space-y-6">
              {publications.map((pub, index) => (
                <Card key={index}>
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
                      <div className="flex-1">
                        <h3 className="font-semibold mb-2 text-sm sm:text-base">{pub.title}</h3>
                        <p className="text-xs sm:text-sm text-muted-foreground mb-2">{pub.authors}</p>
                        <p className="text-xs sm:text-sm font-medium">{pub.journal} ({pub.year})</p>
                        <p className="text-xs text-muted-foreground mt-1">DOI: {pub.doi}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="text-xs">
                          <Download className="h-3 w-3 mr-1" />
                          PDF
                        </Button>
                        <Button variant="outline" size="sm" className="text-xs">
                          <ExternalLink className="h-3 w-3 mr-1" />
                          DOI
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Resources Tab */}
          <TabsContent value="resources" className="space-y-6 sm:space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
              {resources.map((category, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="text-base sm:text-lg">{category.category}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 sm:space-y-4">
                    {category.items.map((item, itemIndex) => (
                      <div key={itemIndex} className="flex items-center justify-between p-2 sm:p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors duration-200">
                        <div className="flex-1">
                          <h4 className="font-medium text-xs sm:text-sm">{item.name}</h4>
                          <p className="text-xs text-muted-foreground">{item.type}</p>
                        </div>
                        <Button variant="ghost" size="sm" className="p-1 sm:p-2">
                          <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Documentation;