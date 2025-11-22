interface HeroBackgroundProps {
  trace: string;
  car: string;
  children: React.ReactNode;
}

const HeroBackground = ({ trace, car, children }: HeroBackgroundProps) => {
  return (
    <section className="relative w-full">
      <div
        className="
          container mx-auto px-4
          relative min-h-[80vh]
          bg-black rounded-[30px]
          overflow-hidden flex items-center
          mt-10
        "
      >
        {/* Tire trace */}
        <img
          src={trace}
          alt=""
          className="
            absolute right-0 top-0 h-full object-contain pointer-events-none select-none
            hidden max-sm:hidden sm:block  
          "
        />

        {/* Car */}
        <img
          src={car}
          alt=""
          className="
            absolute object-contain pointer-events-none select-none

            md:top-1/2 md:right-0 md:-translate-y-1/2 md:h-[440px]

            max-md:bottom-0 max-md:left-1/2 max-md:-translate-x-1/2
            max-md:h-[35%] 
          "
        />

        {/* Content */}
        <div
          className="
            relative z-10
            max-w-[60%] pl-6 md:pl-12

            max-md:max-w-full max-md:text-center max-md:pt-10 max-md:pb-40
          "
        >
          {children}
        </div>
      </div>
    </section>
  );
};

export default HeroBackground;
