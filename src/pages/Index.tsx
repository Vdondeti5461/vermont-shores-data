import Header from '@/components/Header';
import Hero from '@/components/Hero';
import AboutProject from '@/components/AboutProject';
import DataMap from '@/components/DataMap';
import Analytics from '@/components/Analytics';
import DataDownload from '@/components/DataDownload';
import Footer from '@/components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <Hero />
        <AboutProject />
        <DataMap />
        <Analytics />
        <DataDownload />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
