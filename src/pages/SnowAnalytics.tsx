import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import TimeSeries from '@/pages/analytics/TimeSeries';

const SnowAnalytics = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-16">
        <section className="py-8">
          <div className="container mx-auto px-4">
            <h1 className="scientific-heading text-3xl md:text-4xl mb-4">
              Snow Depth Time Series Analysis
            </h1>
            <TimeSeries />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default SnowAnalytics;