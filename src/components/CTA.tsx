import { Button } from "@/components/ui/button";

import { ArrowRight, Check } from "lucide-react";



const benefits = [

  "Ã¢â€šÂ¬0 opstartkosten",

  "30 dagen geld-terug garantie",

  "Maandelijks opzegbaar",

];



const CTA = () => {

  return (

    <section className="py-20 md:py-32 gradient-hero text-primary-foreground">

      <div className="container mx-auto">

        <div className="max-w-3xl mx-auto text-center">

          {/* Headline */}

          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">

            Klaar om online te gaan?

          </h2>

          <p className="text-lg md:text-xl text-primary-foreground/80 mb-8">

            Start vandaag nog met jouw professionele website. Wij regelen de rest.

          </p>



          {/* Price */}

          <div className="inline-flex items-center gap-4 bg-primary-foreground/10 backdrop-blur-sm rounded-2xl px-8 py-6 mb-8">

            <div className="text-5xl md:text-6xl font-bold">Ã¢â€šÂ¬1</div>

            <div className="text-left">

              <div className="text-primary-foreground/80">per dag</div>

              <div className="text-sm text-primary-foreground/60">Alles inclusief</div>

            </div>

          </div>



          {/* Benefits */}

          <div className="flex flex-wrap justify-center gap-4 mb-10">

            {benefits.map((benefit, index) => (

              <div

                key={index}

                className="flex items-center gap-2 text-primary-foreground/90"

              >

                <Check size={18} className="text-success" />

                <span>{benefit}</span>

              </div>

            ))}

          </div>



          {/* CTA Button */}

          <Button asChild variant="hero" size="xl" className="group">

            <a href="#contact">

              Start Nu - Betaal €1/dag

              <ArrowRight className="group-hover:translate-x-1 transition-transform" />

            </a>

          </Button>



          <p className="mt-6 text-sm text-primary-foreground/60">

            Geen creditcard nodig Ã¢â‚¬Â¢ Direct aan de slag

          </p>

        </div>

      </div>

    </section>

  );

};



export default CTA;
