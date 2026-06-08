"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

const heroSlides = [
  { img: "https://images.unsplash.com/photo-1560472355-536de3962603?w=1400&q=80", title: "Start Your Day To Invest Your Future", sub: "Enjoy streamlined investing with a Managed Brokerage Account", },
  { img: "https://images.unsplash.com/photo-1551836022-deb4988cc6c0?w=1400&q=80", title: "Banking Made Simple For Everyone", sub: "Experience modern banking solutions tailored to your needs", },
  { img: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1400&q=80", title: "Grow Your Wealth With Confidence", sub: "Expert financial planning and investment management services", },
];

const tickerItems = ["Loans", "Secured Payments", "Market Data", "Credit/Debit Cards", "Insurance", "Business Banking", "Savings Accounts", "Wire Transfers", "Mortgages", "Financial Planning"];

const aboutFeatures = [
  { icon: "fa-dollar-sign", title: "Expertise You Can Trust", desc: "Our team of certified financial advisors brings decades of combined experience." },
  { icon: "fa-check-circle", title: "Personalized Solutions", desc: "We tailor our services to meet your unique financial goals and circumstances." },
  { icon: "fa-clipboard-list", title: "Proven Track Record", desc: "Consistently delivering strong results and client satisfaction year after year." },
];

export function HeroSection() {
  const [current, setCurrent] = useState(0);
  useEffect(() => { const t = setInterval(() => setCurrent(p => (p + 1) % heroSlides.length), 5000); return () => clearInterval(t); }, []);
  return (
    <section className="relative h-[85vh] min-h-[500px] overflow-hidden">
      {heroSlides.map((s, i) => (
        <div key={i} className={`absolute inset-0 transition-opacity duration-1000 ${i === current ? "opacity-100" : "opacity-0"}`}>
          <Image src={s.img} alt={s.title} fill className="object-cover" priority={i === 0} />
          <div className="absolute inset-0 bg-black/40" />
        </div>
      ))}
      <div className="absolute inset-0 flex items-center z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="max-w-2xl text-white">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 leading-tight">{heroSlides[current].title}</h1>
            <p className="text-lg sm:text-xl text-gray-200 mb-8">{heroSlides[current].sub}</p>
            <div className="flex flex-wrap gap-3">
              <Link href="/signup" className="px-8 py-3.5 bg-accent hover:bg-accent-600 text-accent-foreground font-semibold rounded-full transition-all shadow-lg hover:-translate-y-0.5">Apply Now</Link>
              <Link href="/login" className="px-8 py-3.5 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-full transition-all shadow-lg hover:-translate-y-0.5">Online Banking</Link>
            </div>
          </div>
        </div>
      </div>
      <button onClick={() => setCurrent(p => (p - 1 + heroSlides.length) % heroSlides.length)} className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur rounded-full flex items-center justify-center text-white transition-colors"><i className="fa-solid fa-arrow-left" /></button>
      <button onClick={() => setCurrent(p => (p + 1) % heroSlides.length)} className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur rounded-full flex items-center justify-center text-white transition-colors"><i className="fa-solid fa-arrow-right" /></button>
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {heroSlides.map((_, i) => (<button key={i} onClick={() => setCurrent(i)} className={`w-3 h-3 rounded-full transition-all ${i === current ? "bg-accent w-8" : "bg-white/50"}`} />))}
      </div>
    </section>
  );
}

export function TickerSection() {
  return (
    <div className="bg-primary-600 py-3 overflow-hidden">
      <div className="ticker-wrapper"><div className="ticker-content">
        {[...tickerItems, ...tickerItems].map((item, i) => (
          <span key={i} className="inline-flex items-center mx-6 text-white/90 text-sm font-medium whitespace-nowrap">
            <i className="fa-solid fa-asterisk text-accent text-[8px] mr-4" />{item}
          </span>
        ))}
      </div></div>
    </div>
  );
}

export function AboutSection() {
  return (
    <section className="py-20 lg:py-28 bg-gradient-to-b from-[#eef3f7] to-white dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-start mb-16">
          <div>
            <div className="flex items-center gap-2 text-primary-600 dark:text-primary-400 mb-4"><i className="fa-solid fa-asterisk text-xs" /><span className="text-sm font-semibold uppercase tracking-wider">About Us</span></div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white leading-tight">Empowering businesses and individuals with experts</h2>
          </div>
          <div className="lg:pt-4"><p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed">We are dedicated to helping businesses and individuals navigate financial complexities with confidence and clarity using our years of experience in financial planning, investment management and business consulting.</p></div>
        </div>
        <div className="grid sm:grid-cols-3 gap-8">
          {aboutFeatures.map((f, i) => (
            <div key={i} className="group">
              <div className="w-14 h-14 bg-accent/20 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <i className={`fa-solid ${f.icon} text-primary-600 dark:text-primary-400 text-xl`} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{f.title}</h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function VideoSection() {
  return (
    <section className="relative h-[50vh] min-h-[400px] overflow-hidden">
      <Image src="https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=1400&q=80" alt="Digital banking" fill className="object-cover" />
      <div className="absolute inset-0 bg-gradient-to-r from-primary-900/30 to-primary-900/10" />
      <div className="absolute inset-0 flex items-center justify-center z-10">
        <button className="w-20 h-20 border-2 border-white/80 rounded-full flex items-center justify-center text-white hover:bg-white/10 transition-colors group">
          <i className="fa-solid fa-play text-2xl ml-1 group-hover:scale-110 transition-transform" />
        </button>
      </div>
    </section>
  );
}

export function ServicesCardsSection() {
  const cards = [
    { tag: "Financial Planning", title: "Strategic Business Consulting for Growth Success", color: "from-primary-700 to-primary-800" },
    { tag: "Business Consulting", title: "Comprehensive Financial Planning for Your Future", color: "from-primary-600 to-primary-700" },
    { tag: "Want To Own Your Own Home?", title: "Check Out Our Mortgage Plan", color: "from-primary-800 to-primary-900" },
  ];
  return (
    <section className="py-20 bg-[#eef3f7] dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-3 gap-8">
          {cards.map((c, i) => (
            <div key={i} className="group bg-white dark:bg-gray-800 rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
              <div className="p-6">
                <span className="inline-block px-4 py-1.5 bg-accent text-accent-foreground text-xs font-bold rounded-full mb-4">{c.tag}</span>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{c.title}</h3>
              </div>
              <div className={`bg-gradient-to-br ${c.color} rounded-2xl mx-4 mb-4 p-6 min-h-[200px] flex items-end`}>
                <div className="bg-white/10 backdrop-blur rounded-xl p-4 w-full">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 bg-accent/30 rounded-lg flex items-center justify-center"><i className="fa-solid fa-dollar-sign text-white text-sm" /></div>
                    <div><p className="text-white/60 text-xs">Total Data Information</p><p className="text-white font-bold">$4,567.00</p></div>
                  </div>
                  <div className="flex gap-1 mt-3">{[40,60,30,70,50,80,45].map((h,j) => (<div key={j} className="flex-1 bg-accent/40 rounded-sm" style={{height: `${h}%`, minHeight: h * 0.6}} />))}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
