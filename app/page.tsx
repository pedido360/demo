import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

import LandingHero from "@/components/landing/hero/LandingHero";
import Features from "@/components/landing/Features";
import DailyMenuBuilder from "@/components/landing/DailyMenuBuilder";
import HowItWorks from "@/components/landing/HowItWorks";
import Screenshots from "@/components/landing/Screenshots";
import Pricing from "@/components/landing/Pricing";

export default function Home() {
    return (
        <>
            <Navbar />

            <main className="overflow-x-hidden">
                <LandingHero />

                <Features />

                <DailyMenuBuilder />

                <HowItWorks />

                <Screenshots />

                <Pricing />
            </main>

            <Footer />
        </>
    );
}