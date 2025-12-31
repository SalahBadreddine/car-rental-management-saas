import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { MapPin, Car as CarIcon, Wallet, ArrowRight, Users, FileText, Gauge } from "lucide-react";
import fordFiesta from "@/assets/ford.png";
import bmwM2 from "@/assets/bwm.png";
import toyota from "@/assets/toyota.png";
import heroCar from "@/assets/car_home.png";
import traceCar from "@/assets/car_trace.png";
import HeroBackground from "@/components/HeroBackground";
import CarCard from "@/components/CarCard";
import TenantContentEditor from "@/components/TenantContentEditor";
import { useQuery } from "@tanstack/react-query";
import { enduserCarsApi } from "@/services/enduserCarsApi";
import { useTenant } from "@/contexts/TenantContext";

const reqStr = (val: number | string) => String(val);

const Index = () => {
  const { tenant } = useTenant();
  
  const { data: cars = [] } = useQuery({
    queryKey: ['tenant-cars', tenant?.id],
    queryFn: () => enduserCarsApi.getCarsFromTenant(tenant?.id || ''),
    enabled: !!tenant?.id,
  });


  const bestDealsCars = cars.filter((car: any) => car.is_featured).slice(0, 3);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      

      <HeroBackground trace={traceCar} car={heroCar}>
        <h1 className="font-heading text-5xl md:text-5xl font-bold mb-6 leading-tight text-white">
          <TenantContentEditor 
            sectionKey="home_hero_title" 
            defaultContent="Experience the road like never before with"
            as="span"
          />{" "}
          <span className="text-primary">
            <TenantContentEditor 
              sectionKey="home_hero_brand_suffix" 
              defaultContent="RentoGo."
              as="span"
            />
          </span>
        </h1>

        <p className="text-lg text-white/80 mb-8 leading-relaxed">
          <TenantContentEditor 
            sectionKey="home_hero_subtitle" 
            defaultContent="Aliquam adipiscing velit semper morbi. Purus non eu cursus porttitor tristique et gravida. Quis nunc interdum gravida ullamcorper"
            as="span"
          />
        </p>

        <div className="flex flex-wrap gap-4">
          <Button
            size="lg"
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8 h-12 rounded-lg"
          >
            Get your car today
          </Button>

          <Button
            size="lg"
            variant="outline"
            className="border-white text-white hover:bg-white hover:text-black font-semibold px-8 h-12 rounded-lg bg-transparent"
            asChild
          >
            <Link to={`/${tenant?.slug}/vehicles`}>
              See all cars
              <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </Button>
        </div>
      </HeroBackground>


      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-primary/10 flex items-center justify-center">
                <MapPin className="w-10 h-10 text-primary" />
              </div>
              <h3 className="font-heading text-2xl font-bold mb-3">
                <TenantContentEditor sectionKey="home_feature_1_title" defaultContent="Availability" />
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                <TenantContentEditor sectionKey="home_feature_1_desc" defaultContent="Diam tincidunt tincidunt erat at semper fermentum. Id ultricies quis" />
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-primary/10 flex items-center justify-center">
                <CarIcon className="w-10 h-10 text-primary" />
              </div>
              <h3 className="font-heading text-2xl font-bold mb-3">
                <TenantContentEditor sectionKey="home_feature_2_title" defaultContent="Comfort" />
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                <TenantContentEditor sectionKey="home_feature_2_desc" defaultContent="Gravida auctor fermentum morbi vulputate ac egestas orcidum convallis" />
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Wallet className="w-10 h-10 text-primary" />
              </div>
              <h3 className="font-heading text-2xl font-bold mb-3">
                <TenantContentEditor sectionKey="home_feature_3_title" defaultContent="Savings" />
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                <TenantContentEditor sectionKey="home_feature_3_desc" defaultContent="Pretium convallis id diam sed commodo vestibulum sololris volutpat" />
              </p>
            </div>
          </div>
        </div>
      </section>


      <section className="py-20">
        <div className="mx-auto">
          <h2 className="font-heading text-4xl md:text-5xl font-bold text-center mb-16">
            <TenantContentEditor sectionKey="home_deals_title" defaultContent="Best deals out there" />
          </h2>
          
          <div
            className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12 p-10"
            style={{ backgroundColor: 'rgba(27, 26, 26, 0.23)' }}
          >
            {bestDealsCars.length > 0 ? (
              bestDealsCars.map(car => (
                <CarCard 
                  key={car.id}
                  carId={car.id}
                  image={car.primary_image_url || fordFiesta} 
                  name={`${car.make} ${car.model}`} 
                  price={reqStr(car.price_per_day)} 
                />
              ))
            ) : (
             <div className="col-span-3 text-center text-white">No cars available at the moment.</div>
            )}
          </div>

          <div className="text-center">
            <Button
              variant="outline"
              size="lg"
              className="border-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-white font-semibold px-10 py-3 rounded-lg text-base transition-all"
              asChild
            >
               <Link to={`/${tenant?.slug}/vehicles`}>See all cars</Link>
            </Button>
          </div>
        </div>
      </section>


      <section className="py-20 bg-secondary/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-heading text-4xl font-bold mb-4">
              <TenantContentEditor sectionKey="home_stats_title" defaultContent="Facts In Numbers" />
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              <TenantContentEditor 
                sectionKey="home_stats_desc" 
                defaultContent="Amet cras hac orci lacus. Faucibus ipsum lorem non lectus nibh sapien bibendum ultricorper lt. Diam tincidunt tincidunt erat at semper fermentum" 
              />
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-card rounded-2xl p-6 shadow-lg">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-primary flex items-center justify-center flex-shrink-0">
                  <CarIcon className="w-7 h-7 text-primary-foreground" />
                </div>
                <div>
                  <p className="font-heading text-3xl font-bold">
                    <TenantContentEditor sectionKey="home_stat_1_value" defaultContent="540+" />
                  </p>
                  <p className="text-muted-foreground text-sm">
                    <TenantContentEditor sectionKey="home_stat_1_label" defaultContent="Cars" />
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-2xl p-6 shadow-lg">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-primary flex items-center justify-center flex-shrink-0">
                  <Users className="w-7 h-7 text-primary-foreground" />
                </div>
                <div>
                  <p className="font-heading text-3xl font-bold">
                    <TenantContentEditor sectionKey="home_stat_2_value" defaultContent="20k+" />
                  </p>
                  <p className="text-muted-foreground text-sm">
                    <TenantContentEditor sectionKey="home_stat_2_label" defaultContent="Customers" />
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-2xl p-6 shadow-lg">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-primary flex items-center justify-center flex-shrink-0">
                  <FileText className="w-7 h-7 text-primary-foreground" />
                </div>
                <div>
                  <p className="font-heading text-3xl font-bold">
                    <TenantContentEditor sectionKey="home_stat_3_value" defaultContent="25+" />
                  </p>
                  <p className="text-muted-foreground text-sm">
                    <TenantContentEditor sectionKey="home_stat_3_label" defaultContent="Years" />
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-2xl p-6 shadow-lg">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-primary flex items-center justify-center flex-shrink-0">
                  <Gauge className="w-7 h-7 text-primary-foreground" />
                </div>
                <div>
                  <p className="font-heading text-3xl font-bold">
                    <TenantContentEditor sectionKey="home_stat_4_value" defaultContent="20m+" />
                  </p>
                  <p className="text-muted-foreground text-sm">
                    <TenantContentEditor sectionKey="home_stat_4_label" defaultContent="Miles" />
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default Index;
