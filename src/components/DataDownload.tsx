import { Badge } from '@/components/ui/badge';
import SeasonalDataDownload from './SeasonalDataDownload';

const DataDownload = () => {
  return (
    <section id="download" className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4">
            Seasonal QAQC Data
          </Badge>
          <h2 className="scientific-heading text-4xl md:text-5xl mb-6">
            <span className="text-primary">Download</span> Research Data
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Access quality-controlled seasonal environmental data from Vermont's Summit 2 Shore monitoring network. 
            Filter by date range, location, and specific attributes to customize your dataset for research.
          </p>
        </div>

        <SeasonalDataDownload />
      </div>
    </section>
  );
};

export default DataDownload;