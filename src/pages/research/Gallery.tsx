import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Image as ImageIcon, MapPin, Camera } from 'lucide-react';

const Gallery = () => {
  const projectImages = [
    {
      src: '/gallery/field-research-team.jpg',
      title: 'Field Research Team',
      description: 'Team members conducting snow monitoring research with solar-powered equipment on Vermont mountain summit',
      location: 'Vermont Mountains',
      category: 'Field Sites'
    },
    {
      src: '/lovable-uploads/9d5d35d8-43d8-4c2d-a89e-7522213fc836.png',
      title: 'Vermont Mountain Summit',
      description: 'High-elevation monitoring station capturing snow and weather data',
      location: 'Mount Mansfield, VT',
      category: 'Field Sites'
    },
    {
      src: '/lovable-uploads/d19c9c85-6a6b-4115-bc8e-2ed5fd432891.png',
      title: 'UVM Partnership',
      description: 'University of Vermont collaboration with CRREL',
      location: 'Burlington, VT',
      category: 'Partners'
    },
    {
      src: '/lovable-uploads/250350aa-abaa-4e6e-b886-bae339af81b9.png',
      title: 'Research Team',
      description: 'Field work and data collection activities',
      location: 'Various Sites',
      category: 'Team'
    },
    {
      src: '/lovable-uploads/f0e8b972-8f4c-4294-98e6-d3ae431cbd24.png',
      title: 'Field Operations',
      description: 'Monitoring equipment and sensor installations',
      location: 'Field Stations',
      category: 'Equipment'
    },
    {
      src: '/lovable-uploads/d237cd6e-cadf-4b6d-9006-bd432196c042.png',
      title: 'Data Collection',
      description: 'Real-time environmental monitoring systems',
      location: 'Summit-to-Shore Network',
      category: 'Technology'
    },
    {
      src: '/lovable-uploads/5d861d7c-499d-4cd9-8407-96f99934b2b1.png',
      title: 'Winter Monitoring',
      description: 'Snow depth and temperature measurements',
      location: 'Vermont Mountains',
      category: 'Field Sites'
    }
  ];

  const categories = ['All', 'Field Sites', 'Team', 'Equipment', 'Technology', 'Partners'];

  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-16">
        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-br from-primary/5 to-secondary/5">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <Badge variant="outline" className="mb-4">
                <Camera className="w-4 h-4 mr-2" />
                Project Gallery
              </Badge>
              <h1 className="scientific-heading text-4xl md:text-6xl mb-6">
                Summit-to-Shore <span className="text-primary">Gallery</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                Visual documentation of the Summit-to-Shore Snow Monitoring Network, 
                showcasing field sites, research team, equipment, and collaborative efforts 
                across Vermont's elevation gradient.
              </p>
            </div>
          </div>
        </section>

        {/* Category Filters */}
        <section className="py-8 border-b bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="flex flex-wrap justify-center gap-3">
              {categories.map((category) => (
                <Badge
                  key={category}
                  variant={category === 'All' ? 'default' : 'outline'}
                  className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  {category}
                </Badge>
              ))}
            </div>
          </div>
        </section>

        {/* Gallery Grid */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {projectImages.map((image, index) => (
                <Card key={index} className="overflow-hidden hover:shadow-xl transition-all duration-300 group">
                  <div className="relative aspect-video overflow-hidden">
                    <img 
                      src={image.src} 
                      alt={image.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                        <Badge variant="secondary" className="mb-2">
                          {image.category}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
                      {image.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      {image.description}
                    </p>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <MapPin className="w-3 h-3 mr-1" />
                      {image.location}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Coming Soon Section */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <Card className="max-w-2xl mx-auto text-center p-8 border-dashed">
              <ImageIcon className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
              <h2 className="text-2xl font-bold mb-3">More Photos Coming Soon</h2>
              <p className="text-muted-foreground">
                Additional images from field operations, equipment installations, seasonal monitoring, 
                and collaborative research activities will be added as the project progresses.
              </p>
            </Card>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Gallery;
