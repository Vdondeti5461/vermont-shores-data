import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BulkDownloadRequest from '@/components/BulkDownloadRequest';

const BulkRequestPage = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-16">
        <section className="py-12">
          <div className="container mx-auto px-4">
            <BulkDownloadRequest />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default BulkRequestPage;