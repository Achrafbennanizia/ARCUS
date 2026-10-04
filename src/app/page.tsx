import { LampCanvas } from "@/components/canvas/LampCanvas";
import { Nav } from "@/components/Nav";
import { ScrollAssist } from "@/components/ScrollAssist";
import { SmoothScroll } from "@/components/SmoothScroll";
import { Beam } from "@/components/sections/Beam";
import { Finishes } from "@/components/sections/Finishes";
import { Footer } from "@/components/sections/Footer";
import { Hero } from "@/components/sections/Hero";
import { Shipping } from "@/components/sections/Shipping";
import { Waitlist } from "@/components/sections/Waitlist";
import { ActiveSectionProvider } from "@/lib/active-section";
import { LampStateProvider } from "@/lib/lamp-state";
import { ScrollProgressProvider } from "@/lib/scroll-progress";

export default function Home() {
  return (
    <ScrollProgressProvider>
      <ActiveSectionProvider>
        <LampStateProvider>
          <SmoothScroll>
            <div className="atmosphere" aria-hidden />
            <LampCanvas />
            <div className="read-veil" aria-hidden />
            <div className="grain" aria-hidden />
            <Nav />
            <ScrollAssist />
            <main className="relative z-10">
              <Hero />
              <Beam />
              <Finishes />
              <Shipping />
              <Waitlist />
            </main>
            <Footer />
          </SmoothScroll>
        </LampStateProvider>
      </ActiveSectionProvider>
    </ScrollProgressProvider>
  );
}
