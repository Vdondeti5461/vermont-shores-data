import { Badge } from '@/components/ui/badge';
import EnhancedDataDownload from './EnhancedDataDownload';

const DataDownload = () => {
  return (
    <section id="download" className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4">
            Open Data Access
          </Badge>
          <h2 className="scientific-heading text-4xl md:text-5xl mb-6">
            <span className="text-primary">Download</span> Research Data
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Access comprehensive environmental datasets from Vermont's Summit 2 Shore monitoring network. 
            Filter by location, timestamp, and data attributes to get exactly what you need for your research.
          </p>
        </div>

        <EnhancedDataDownload />
      </div>
    </section>
  );
};

export default DataDownload;