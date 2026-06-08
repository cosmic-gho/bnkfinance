"use client";

import Link from "next/link";
import Image from "next/image";
import { CredixNavbar } from "@/components/credix-navbar";
import { FooterSection } from "@/components/landing-sections-bottom";

export default function ServicesPage() {
  const services = [
    { icon: "fa-university", title: "Personal Banking", desc: "Checking, savings, and money market accounts designed to help you manage and grow your money.", img: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&q=80" },
    { icon: "fa-briefcase", title: "Business Banking", desc: "Comprehensive banking solutions for businesses of all sizes with competitive rates and flexible terms.", img: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&q=80" },
    { icon: "fa-credit-card", title: "Credit Cards", desc: "Reward-earning credit cards with low rates, no annual fees, and generous cashback programs.", img: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=600&q=80" },
    { icon: "fa-home", title: "Mortgage Loans", desc: "Competitive mortgage rates for first-time buyers and refinancing with personalized guidance.", img: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&q=80" },
    { icon: "fa-shield-halved", title: "Insurance", desc: "Quality insurance without the hassle. We've partnered with top providers to protect against unexpected costs.", img: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=600&q=80" },
    { icon: "fa-chart-pie", title: "Wealth Management", desc: "Expert investment and retirement planning services to help you build and preserve your wealth.", img: "https://images.unsplash.com/photo-1551836022-deb4988cc6c0?w=600&q=80" },
  ];

  return (
    <div className="font-sans bg-[#eef3f7] dark:bg-gray-900 text-gray-900 dark:text-gray-100 min-h-screen">
      <CredixNavbar />

      {/* Hero */}
      <section className="relative py-20 lg:py-28 bg-primary-700 dark:bg-primary-900 overflow-hidden">
        <div className="absolute inset-0">
          <Image src="https://images.unsplash.com/photo-1556761175-4b46a572b786?w=1400&q=80" alt="Services" fill className="object-cover opacity-20" />
          <div className="absolute inset-0 bg-primary-700/80 dark:bg-primary-900/90" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center px-4 py-2 bg-accent/20 text-accent rounded-full text-sm font-semibold mb-6 border border-accent/30">
            <i className="fa-solid fa-concierge-bell mr-2" />Our Services
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">Banking Solutions For Everyone</h1>
          <p className="text-xl text-primary-100 max-w-3xl mx-auto leading-relaxed">Comprehensive financial services tailored to help individuals and businesses achieve their goals with confidence.</p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-16 lg:py-20 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((s, i) => (
              <div key={i} className="group bg-[#eef3f7] dark:bg-gray-900 rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                <div className="relative h-48 overflow-hidden">
                  <Image src={s.img} alt={s.title} fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <div className="absolute bottom-4 left-4 w-12 h-12 bg-accent rounded-xl flex items-center justify-center"><i className={`fa-solid ${s.icon} text-accent-foreground text-lg`} /></div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{s.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4 leading-relaxed text-sm">{s.desc}</p>
                  <Link href="/signup" className="inline-flex items-center gap-2 text-primary-600 dark:text-primary-400 font-semibold text-sm hover:gap-3 transition-all">
                    Learn More <i className="fa-solid fa-arrow-right text-xs" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-primary-700 dark:bg-primary-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">Ready to Get Started?</h2>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">Open an account today and experience world-class banking services.</p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/signup" className="px-8 py-4 bg-accent hover:bg-accent-600 text-accent-foreground font-semibold rounded-full transition-all shadow-lg hover:-translate-y-0.5">Open Account</Link>
            <Link href="/contact" className="px-8 py-4 border-2 border-white/30 hover:border-white/60 text-white font-semibold rounded-full transition-all hover:-translate-y-0.5">Contact Us</Link>
          </div>
        </div>
      </section>

      <FooterSection />
    </div>
  );
}
