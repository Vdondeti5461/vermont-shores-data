import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Mail, User, Building, FileDown, AlertCircle, CheckCircle } from 'lucide-react';
import { API_BASE_URL } from '@/lib/apiConfig';

const BulkDownloadRequest = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [requestData, setRequestData] = useState({
    name: '',
    email: '',
    organization: '',
    purpose: '',
    research_description: '',
    datasets_requested: [] as string[],
    date_range: '',
    preferred_format: 'CSV'
  });

  const availableDatasets = [
    { id: 'table1', name: 'Primary Environmental Data', description: 'Temperature, humidity, soil conditions, radiation' },
    { id: 'wind', name: 'Wind Measurements', description: 'Wind speed and direction data' },
    { id: 'precipitation', name: 'Precipitation Data', description: 'Rain and snow precipitation measurements' },
    { id: 'snow_temp', name: 'Snow Temperature Profile', description: 'Temperature at various snow depths' },
    { id: 'raw_complete', name: 'Complete Raw Dataset', description: 'All unprocessed sensor data' },
    { id: 'processed_complete', name: 'Complete Processed Dataset', description: 'All quality-controlled data' }
  ];

  const purposeOptions = [
    'Academic Research',
    'Graduate/PhD Research',
    'Climate Analysis',
    'Environmental Modeling',
    'Policy Development',
    'Commercial Research',
    'Educational Use',
    'Other'
  ];

  const formatOptions = [
    { value: 'CSV', label: 'CSV (Comma-separated values)' },
    { value: 'JSON', label: 'JSON (JavaScript Object Notation)' },
    { value: 'XLSX', label: 'Excel Spreadsheet' }
  ];

  const handleDatasetToggle = (datasetId: string) => {
    setRequestData(prev => ({
      ...prev,
      datasets_requested: prev.datasets_requested.includes(datasetId)
        ? prev.datasets_requested.filter(id => id !== datasetId)
        : [...prev.datasets_requested, datasetId]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!requestData.name || !requestData.email || !requestData.purpose || requestData.datasets_requested.length === 0) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields and select at least one dataset",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Prepare the request data with additional metadata
      const submissionData = {
        ...requestData,
        submitted_at: new Date().toISOString(),
        user_agent: navigator.userAgent,
        page_url: window.location.href
      };

      // Send the request - this will now send emails to both s2s@uvm.edu and the user
      const response = await fetch(`${API_BASE_URL}/api/bulk-download/request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionData),
      });

      if (response.ok) {
        const result = await response.json();
        setIsSubmitted(true);
        toast({
          title: "Request Submitted Successfully",
          description: `Your request has been forwarded to the S2S team. Request ID: ${result.request_id || 'BDR-' + Date.now()}`,
        });
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: Failed to submit request`);
      }
    } catch (error) {
      console.error('Error submitting bulk download request:', error);
      toast({
        title: "Submission Failed",
        description: error instanceof Error ? error.message : "Failed to submit your bulk download request. Please try again or contact s2s@uvm.edu directly.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
        <Card className="max-w-2xl mx-auto">
          <CardHeader className="text-center px-4 sm:px-6">
            <div className="mx-auto w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <CardTitle className="text-xl sm:text-2xl">Request Submitted Successfully!</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4 px-4 sm:px-6">
          <p className="text-muted-foreground">
            Your bulk download request has been successfully submitted and forwarded to the Summit-to-Shore team at s2s@uvm.edu.
          </p>
          
          <div className="bg-muted/30 p-4 rounded-lg text-left">
            <h4 className="font-semibold mb-2">What happens next:</h4>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• ✅ Confirmation email sent to your inbox</li>
              <li>• ✅ Request forwarded to S2S team at s2s@uvm.edu</li>
              <li>• ⏳ Data preparation begins (typically 2-5 business days)</li>
              <li>• 📧 Download links will be provided via email when ready</li>
              <li>• ❓ For urgent requests or questions: s2s@uvm.edu or (802) 656-2215</li>
            </ul>
          </div>
          
          <div className="bg-primary/10 p-3 rounded-lg text-left">
            <p className="text-sm text-primary font-medium">
              📧 Expected response time: Within 24 hours during business days
            </p>
          </div>
          
          <Button onClick={() => setIsSubmitted(false)} variant="outline">
            Submit Another Request
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-6 sm:mb-8">
        <Badge variant="outline" className="mb-4">
          <FileDown className="w-4 h-4 mr-2" />
          Bulk Data Request
        </Badge>
        <h2 className="scientific-heading text-2xl sm:text-3xl md:text-4xl mb-4">
          Request <span className="text-primary">Bulk Download</span>
        </h2>
        <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
          Request access to complete datasets for research purposes. All requests are reviewed by our team 
          and typically processed within 2-5 business days.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={requestData.name}
                  onChange={(e) => setRequestData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div>
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={requestData.email}
                  onChange={(e) => setRequestData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="your.email@institution.edu"
                  required
                />
              </div>

              <div>
                <Label htmlFor="organization">Organization/Institution</Label>
                <Input
                  id="organization"
                  value={requestData.organization}
                  onChange={(e) => setRequestData(prev => ({ ...prev, organization: e.target.value }))}
                  placeholder="University, Company, or Organization"
                />
              </div>
            </CardContent>
          </Card>

          {/* Research Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Research Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="purpose">Research Purpose *</Label>
                <Select
                  value={requestData.purpose}
                  onValueChange={(value) => setRequestData(prev => ({ ...prev, purpose: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select research purpose" />
                  </SelectTrigger>
                  <SelectContent>
                    {purposeOptions.map((purpose) => (
                      <SelectItem key={purpose} value={purpose}>
                        {purpose}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="research_description">Research Description</Label>
                <Textarea
                  id="research_description"
                  value={requestData.research_description}
                  onChange={(e) => setRequestData(prev => ({ ...prev, research_description: e.target.value }))}
                  placeholder="Brief description of your research and how you'll use the data..."
                  rows={4}
                />
              </div>

              <div>
                <Label htmlFor="date_range">Date Range of Interest</Label>
                <Input
                  id="date_range"
                  value={requestData.date_range}
                  onChange={(e) => setRequestData(prev => ({ ...prev, date_range: e.target.value }))}
                  placeholder="e.g., 2020-2023, Winter 2022, All available data"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Dataset Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Dataset Selection *</CardTitle>
            <p className="text-sm text-muted-foreground">
              Select the datasets you need for your research. Multiple selections are allowed.
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-4">
              {availableDatasets.map((dataset) => (
                <div key={dataset.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                  <Checkbox
                    id={dataset.id}
                    checked={requestData.datasets_requested.includes(dataset.id)}
                    onCheckedChange={() => handleDatasetToggle(dataset.id)}
                  />
                  <div className="flex-1">
                    <Label htmlFor={dataset.id} className="cursor-pointer">
                      <div className="font-medium">{dataset.name}</div>
                      <div className="text-sm text-muted-foreground">{dataset.description}</div>
                    </Label>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Format Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Preferred Format</CardTitle>
          </CardHeader>
          <CardContent>
            <Select
              value={requestData.preferred_format}
              onValueChange={(value) => setRequestData(prev => ({ ...prev, preferred_format: value }))}
            >
              <SelectTrigger className="w-full max-w-md">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {formatOptions.map((format) => (
                  <SelectItem key={format.value} value={format.value}>
                    {format.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Important Notice */}
        <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-amber-800 dark:text-amber-200 mb-2">Important Information</h4>
                <ul className="text-sm text-amber-700 dark:text-amber-300 space-y-1">
                  <li>• Large datasets may be provided as compressed archives</li>
                  <li>• Data is provided under UVM's data sharing agreement</li>
                  <li>• Please cite the CRREL S2S project in any publications</li>
                  <li>• For questions, contact s2s@uvm.edu or (802) 656-2215</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-center">
          <Button 
            type="submit" 
            disabled={isSubmitting}
            size="lg"
            className="min-w-[200px]"
          >
            <Mail className="w-4 h-4 mr-2" />
            {isSubmitting ? 'Submitting Request...' : 'Submit Request'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default BulkDownloadRequest;