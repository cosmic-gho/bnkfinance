"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

const tabs = ["Financial Planning", "Business Consulting", "Risk Management", "Investment Management"];
const tabContent = [
  { title: "Benefits Of Our Financial:", desc: "Empower your financial journey with expert advice, personalized strategies, and solutions designed to help you achieve long-term stability, growth, and peace of mind.", features: ["Expert Investment Management", "Social Security And Pension Optimization", "Business Financial Planning", "Tax Planning Strategies"] },
  { title: "Strategic Business Growth:", desc: "Transform your business with our comprehensive consulting services, from market analysis to operational optimization.", features: ["Market Analysis & Strategy", "Operations Optimization", "Growth Planning", "Performance Metrics"] },
  { title: "Comprehensive Risk Solutions:", desc: "Protect your assets and investments with our advanced risk management frameworks and insurance solutions.", features: ["Portfolio Risk Assessment", "Insurance Planning", "Compliance Management", "Crisis Planning"] },
  { title: "Smart Investment Strategy:", desc: "Maximize your returns with data-driven investment strategies tailored to your risk profile and financial goals.", features: ["Portfolio Diversification", "Real-time Market Analysis", "Retirement Planning", "Wealth Preservation"] },
];

export function TabbedSection() {
  const [activeTab, setActiveTab] = useState(0);
  const c = tabContent[activeTab];
  return (
    <section className="py-20 bg-white dark:bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mb-12">
          {tabs.map((t, i) => (
            <button key={i} onClick={() => setActiveTab(i)} className={`px-4 py-3.5 rounded-full text-sm font-semibold transition-all duration-300 ${i === activeTab ? "bg-primary-600 text-white shadow-lg" : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"}`}>
              {t}
            </button>
          ))}
        </div>
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="bg-[#eef3f7] dark:bg-gray-900 rounded-3xl p-8 lg:p-10">
            <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-4">{c.title}</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">{c.desc}</p>
            <div className="space-y-4">
              {c.features.map((f, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-accent/20 rounded-lg flex items-center justify-center flex-shrink-0"><i className="fa-solid fa-check text-primary-600 dark:text-primary-400 text-sm" /></div>
                  <span className="text-gray-800 dark:text-gray-200 font-medium">{f}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="relative rounded-3xl overflow-hidden aspect-[4/3] shadow-2xl">
            <Image src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80" alt="Team working" fill className="object-cover" />
          </div>
        </div>
      </div>
    </section>
  );
}

export function WhyChooseUsSection() {
  const items = [
    { num: "01", img: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=500&q=80", title: "Strategic Advisory & Planning" },
    { num: "02", img: "https://images.unsplash.com/photo-1556761175-4b46a572b786?w=500&q=80", title: "Growth Focused Consulting" },
    { num: "03", img: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=500&q=80", title: "Client Success Management" },
  ];
  return (
    <section className="py-20 bg-[#eef3f7] dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 mb-16">
          <div>
            <div className="flex items-center gap-2 text-primary-600 dark:text-primary-400 mb-4"><i className="fa-solid fa-asterisk text-xs" /><span className="text-sm font-semibold uppercase tracking-wider">Why Choose Us</span></div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white leading-tight">Expertise and client focused solutions for your success</h2>
          </div>
          <div className="lg:pt-4"><p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed">Our team of experienced professionals will deliver personalized solutions and result driven financial strategies that is tailored to your specific goals. We also prioritize, trust and long-term success.</p></div>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {items.map((item, i) => (
            <div key={i} className="group relative rounded-3xl overflow-hidden aspect-[3/4] shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
              <Image src={item.img} alt={item.title} fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute top-4 left-4 w-12 h-12 bg-accent rounded-full flex items-center justify-center font-bold text-accent-foreground text-lg">{item.num}</div>
              <div className="absolute bottom-6 left-6 right-6"><h3 className="text-xl font-bold text-white">{item.title}</h3></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function ApproachSection() {
  return (
    <section className="py-20 lg:py-28 bg-primary-700 dark:bg-primary-900 relative overflow-hidden">
      <div className="absolute inset-0"><div className="absolute top-0 right-0 w-96 h-96 bg-primary-600/30 rounded-full blur-3xl" /><div className="absolute bottom-0 left-0 w-80 h-80 bg-primary-800/50 rounded-full blur-3xl" /></div>
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 mb-16">
          <div>
            <div className="flex items-center gap-2 text-accent mb-4"><i className="fa-solid fa-asterisk text-xs" /><span className="text-sm font-semibold uppercase tracking-wider">Our Approach</span></div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight">Client centric strategy for lasting success</h2>
          </div>
          <div className="lg:pt-4"><p className="text-primary-100 text-lg leading-relaxed">We believe that a successful financial journey starts with understanding your unique needs and aspirations. Our approach is built on a foundation of collaboration, transparency, and expertise.</p></div>
        </div>
        <div className="grid md:grid-cols-2 gap-8">
          {[
            { icon: "fa-dollar-sign", title: "No Hidden Fees On Spending", desc: "When you spend on your card abroad, we pass Mastercard's exchange rate directly onto you, without extra charges." },
            { icon: "fa-handshake", title: "Trusted Financial Partner", desc: "You gain a trusted partner committed to your financial well-being and long-term growth." },
          ].map((item, i) => (
            <div key={i} className="group bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/10 hover:bg-white/10 transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-start gap-6">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
                  <p className="text-primary-100 leading-relaxed">{item.desc}</p>
                </div>
                <Link href="/signup" className="w-12 h-12 bg-accent rounded-full flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <i className="fa-solid fa-arrow-right text-accent-foreground" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function StatsSection() {
  return (
    <section className="py-20 bg-[#eef3f7] dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-16">
          <div className="flex items-center gap-2 text-primary-600 dark:text-primary-400 mb-4"><i className="fa-solid fa-asterisk text-xs" /><span className="text-sm font-semibold uppercase tracking-wider">Financial Wisdom</span></div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white leading-tight max-w-3xl">Fascinating facts that shape your financial knowledge</h2>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { img: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80", stat: null },
            { img: null, stat: { num: "31k+", label: "The number of publicly traded companies" } },
            { img: "https://images.unsplash.com/photo-1560472355-536de3962603?w=400&q=80", stat: null },
            { img: null, stat: { num: "90%", label: "The percentage of financial advisors" } },
          ].map((item, i) => (
            <div key={i} className={`rounded-3xl overflow-hidden ${item.img ? "aspect-square relative shadow-xl" : "bg-accent/20 dark:bg-accent/10 p-8 flex flex-col justify-end"}`}>
              {item.img ? <Image src={item.img} alt="Finance" fill className="object-cover" /> : (
                <><p className="text-sm text-gray-600 dark:text-gray-400 font-medium mb-4">{item.stat?.label}</p><p className="text-5xl lg:text-6xl font-bold text-primary-700 dark:text-primary-400">{item.stat?.num}</p></>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function CTASection() {
  return (
    <section className="py-20 bg-primary-700 dark:bg-primary-900 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="relative w-64 mx-auto lg:mx-0">
            <div className="bg-accent rounded-[2.5rem] p-4 shadow-2xl"><div className="bg-white rounded-[2rem] p-3 aspect-[9/16] flex items-center justify-center"><p className="text-gray-400 text-sm">Mobile Banking App</p></div></div>
          </div>
          <div>
            <div className="flex items-center gap-2 text-accent mb-4"><i className="fa-solid fa-asterisk text-xs" /><span className="text-sm font-medium">FDIC-Insured - Backed By The Full Faith And Credit Of The U.S. Government</span></div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">Take control of your financial future today!</h2>
            <p className="text-primary-100 text-lg mb-8 leading-relaxed">Join thousands of satisfied members who trust BNK Finance Bank for their financial needs. Open an account today and experience the difference.</p>
            <div className="flex flex-wrap gap-4">
              <Link href="/signup" className="px-8 py-3.5 bg-accent hover:bg-accent-600 text-accent-foreground font-semibold rounded-full transition-all shadow-lg hover:-translate-y-0.5">Get Started</Link>
              <Link href="/contact" className="px-8 py-3.5 border-2 border-white/30 hover:border-white/60 text-white font-semibold rounded-full transition-all hover:-translate-y-0.5">Contact Us</Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function FAQSection() {
  const [open, setOpen] = useState<number | null>(null);
  const faqs = [
    { q: "How do I register for mobile banking at BNK Finance Bank?", a: "If you are enrolled in Online Banking, simply use your user name and password to log in to your accounts through the BNK Finance Bank mobile app, available on Android® and iPhone®." },
    { q: "What is Mobile Deposit?", a: "Our Mobile Deposit allows you to deposit a check through the BNK Finance Bank mobile app using your internet-enabled smartphone, provided your device has a camera." },
    { q: "How can I open a new account?", a: "You can open a new account online through our website or visit any of our branch locations. Our team will guide you through the process." },
    { q: "What types of loans do you offer?", a: "We offer personal loans, auto loans, home mortgages, business loans, and lines of credit with competitive rates." },
  ];
  return (
    <section className="py-20 bg-white dark:bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between mb-12">
          <div>
            <div className="flex items-center gap-2 text-primary-600 dark:text-primary-400 mb-4"><i className="fa-solid fa-asterisk text-xs" /><span className="text-sm font-semibold uppercase tracking-wider">Frequently Asked Questions</span></div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white leading-tight max-w-2xl">Common business & finance questions and answers</h2>
          </div>
          <Link href="/contact" className="mt-6 lg:mt-0 px-8 py-3.5 bg-accent hover:bg-accent-600 text-accent-foreground font-semibold rounded-full transition-all inline-flex items-center gap-2 flex-shrink-0">Contact Now <i className="fa-solid fa-arrow-right" /></Link>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          {faqs.map((faq, i) => (
            <div key={i} className="bg-[#eef3f7] dark:bg-gray-900 rounded-2xl p-6 cursor-pointer hover:shadow-lg transition-all" onClick={() => setOpen(open === i ? null : i)}>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/50 rounded-full flex items-center justify-center flex-shrink-0"><span className="text-primary-600 dark:text-primary-400 font-bold">?</span></div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 dark:text-white mb-2">{faq.q}</h3>
                  {open === i && <p className="text-gray-600 dark:text-gray-300 leading-relaxed mt-3">{faq.a}</p>}
                </div>
                <i className={`fa-solid fa-chevron-down text-gray-400 transition-transform duration-300 mt-2 ${open === i ? "rotate-180" : ""}`} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function FooterSection() {
  return (
    <footer className="bg-primary-800 dark:bg-primary-950 text-white pt-16 pb-8 mb-16 lg:mb-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center"><i className="fa-solid fa-shield text-white text-lg" /></div>
              <div><span className="block text-lg font-extrabold tracking-tight">BNK Finance</span><span className="block text-xs font-bold tracking-widest text-primary-200">BANK</span></div>
            </div>
            <p className="text-primary-200 text-sm leading-relaxed">Our objective is to be a primary contributing member of the diverse communities we serve. Soundness, service and integrity are paramount.</p>
          </div>
          <div>
            <h4 className="font-bold text-white mb-6">Solutions</h4>
            <ul className="space-y-3 text-sm">
              {[{l:"Quick Account Opening",h:"/signup"},{l:"Contact Us",h:"/contact"},{l:"Terms Of Service",h:"/"}].map((item,i)=>(<li key={i}><Link href={item.h} className="text-primary-200 hover:text-white transition-colors">{item.l}</Link></li>))}
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-white mb-6">Loans & Insurance</h4>
            <ul className="space-y-3 text-sm">
              {["Business Loan","Automobile Refinancing","Mortgage Plans","Core Insurance Program"].map((item,i)=>(<li key={i}><Link href="/services" className="text-primary-200 hover:text-white transition-colors">{item}</Link></li>))}
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-white mb-6">Contact Us</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2 text-primary-200"><i className="fa-solid fa-location-dot text-accent w-4" />Wichita, KS</li>
              <li className="flex items-center gap-2 text-primary-200"><i className="fa-solid fa-envelope text-accent w-4" />Info@BNK-Finance.Com</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-primary-700/50 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-primary-300 text-sm">Copyright © {new Date().getFullYear()} All Rights Reserved.</p>
          <div className="flex gap-3">
            {["fa-facebook-f","fa-twitter","fa-linkedin-in"].map((icon,i)=>(<a key={i} href="#" className="w-10 h-10 border border-accent/30 hover:border-accent rounded-full flex items-center justify-center text-primary-200 hover:text-accent transition-all hover:scale-110"><i className={`fa-brands ${icon} text-sm`} /></a>))}
          </div>
        </div>
      </div>
    </footer>
  );
}
