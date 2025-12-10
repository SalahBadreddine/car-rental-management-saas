import Header from "@/components/Header";
import Footer from "@/components/Footer";

const About = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="font-heading text-5xl font-bold mb-6">About RentoGo</h1>
          <p className="text-xl text-muted-foreground leading-relaxed mb-8">
            Welcome to RentoGo, your premier destination for luxury and comfort car rentals. 
            We've been serving customers for over 25 years with a fleet of 540+ premium vehicles.
          </p>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Our mission is to provide exceptional car rental experiences with unmatched customer service, 
            competitive pricing, and a diverse selection of vehicles to meet every need.
          </p>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default About;
