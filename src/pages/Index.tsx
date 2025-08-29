import Header from '@/components/Header';
import Hero from '@/components/Hero';
import AboutProject from '@/components/AboutProject';
import Team from '@/components/Team';
import DataMap from '@/components/DataMap';
import Analytics from '@/components/Analytics';
import DataDownload from '@/components/DataDownload';
import Footer from '@/components/Footer';
import DatabaseStatus from '@/components/DatabaseStatus';

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <Hero />
        <div className="container mx-auto px-4">
          <DatabaseStatus />
        </div>
        <AboutProject />
        <DataMap />
        <Analytics />
        <DataDownload />
        <Team />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
