import { Hero } from "@/components/sections/hero";
import { FeaturedWork } from "@/components/sections/featured-work";
import { TestimonialsSection } from "@/components/sections/testimonials-section";
import { CTA } from "@/components/sections/cta";

export default function HomePage() {
  return (
    <>
      <Hero />
      <FeaturedWork />
      <TestimonialsSection />
      <CTA />
    </>
  );
}
