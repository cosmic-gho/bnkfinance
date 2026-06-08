"use client";

import Link from "next/link";
import Image from "next/image";
import { CredixNavbar } from "@/components/credix-navbar";
import { FooterSection } from "@/components/landing-sections-bottom";

export default function AboutPage() {
  return (
    <div className="font-sans bg-[#eef3f7] dark:bg-gray-900 text-gray-900 dark:text-gray-100 min-h-screen">
      <CredixNavbar />

      {/* Hero */}
      <section className="relative py-20 lg:py-32 bg-primary-700 dark:bg-primary-900 overflow-hidden">
        <div className="absolute inset-0"><div className="absolute top-0 right-0 w-96 h-96 bg-primary-600/30 rounded-full blur-3xl" /><div className="absolute bottom-0 left-0 w-80 h-80 bg-primary-800/50 rounded-full blur-3xl" /></div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center px-4 py-2 bg-accent/20 text-accent rounded-full text-sm font-semibold mb-6 border border-accent/30">
            <i className="fa-solid fa-info-circle mr-2" />About BNK Finance Bank
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">Building Financial Strength Together</h1>
          <p className="text-xl text-primary-100 max-w-3xl mx-auto leading-relaxed">BNK Finance Bank is a full-service credit union built on the foundation of providing our members with exceptional service at every step of their financial journey.</p>
        </div>
      </section>

      {/* Mission */}
      <section className="py-16 lg:py-20 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex items-center gap-2 text-primary-600 dark:text-primary-400 mb-4"><i className="fa-solid fa-asterisk text-xs" /><span className="text-sm font-semibold uppercase tracking-wider">Our Mission</span></div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-gray-900 dark:text-white">We Do Banking Differently</h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">We believe that people come first, and that everyone deserves a great experience every step of the way. At BNK Finance Bank, we&apos;re committed to helping our members achieve their financial goals through personalized service and competitive rates.</p>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">As a member-owned credit union, we&apos;re not driven by shareholder profits. Instead, we focus on providing the best possible value and service to our members.</p>
              <div className="space-y-4">
                {[
                  { icon: "fa-heart", color: "primary", title: "Member-Focused", desc: "We're owned by our members, not shareholders." },
                  { icon: "fa-chart-line", color: "primary", title: "Competitive Rates", desc: "Better rates on savings, loans, and credit cards." },
                  { icon: "fa-users", color: "primary", title: "Community Committed", desc: "Supporting local communities that matter to our members." },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-accent/20 rounded-xl flex items-center justify-center flex-shrink-0"><i className={`fa-solid ${item.icon} text-primary-600 dark:text-primary-400 text-xl`} /></div>
                    <div><h3 className="font-bold text-gray-900 dark:text-white mb-1">{item.title}</h3><p className="text-gray-600 dark:text-gray-300">{item.desc}</p></div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative rounded-3xl overflow-hidden shadow-2xl aspect-[4/3]">
              <Image src="https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&q=80" alt="Team collaboration" fill className="object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 lg:py-20 bg-[#eef3f7] dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-2 text-primary-600 dark:text-primary-400 mb-4"><i className="fa-solid fa-asterisk text-xs" /><span className="text-sm font-semibold uppercase tracking-wider">Our Core Values</span></div>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-gray-900 dark:text-white">What Drives Us Every Day</h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">These values guide every decision we make and every interaction we have with our members.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: "fa-shield-halved", title: "Trust & Integrity", desc: "Building lasting relationships through transparency." },
              { icon: "fa-lightbulb", title: "Innovation", desc: "Embracing new technologies to better serve our members." },
              { icon: "fa-handshake", title: "Service Excellence", desc: "Going above and beyond to meet our members' needs." },
              { icon: "fa-globe", title: "Community Impact", desc: "Making a positive difference in our communities." },
            ].map((v, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all hover:-translate-y-2 border border-gray-100 dark:border-gray-700">
                <div className="w-14 h-14 bg-accent/20 rounded-2xl flex items-center justify-center mb-5 mx-auto"><i className={`fa-solid ${v.icon} text-xl text-primary-600 dark:text-primary-400`} /></div>
                <h3 className="text-lg font-bold text-center mb-2 text-gray-900 dark:text-white">{v.title}</h3>
                <p className="text-gray-600 dark:text-gray-300 text-center text-sm">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 lg:py-20 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { number: "50K+", label: "Happy Customers", icon: "fa-users" },
              { number: "$2.5B+", label: "Assets Managed", icon: "fa-dollar-sign" },
              { number: "150+", label: "Years Combined Experience", icon: "fa-calendar" },
              { number: "99.9%", label: "Member Satisfaction", icon: "fa-star" },
            ].map((stat, i) => (
              <div key={i} className="text-center p-6 bg-[#eef3f7] dark:bg-gray-900 rounded-2xl">
                <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-4"><i className={`fa-solid ${stat.icon} text-white text-2xl`} /></div>
                <div className="text-4xl font-bold text-primary-600 dark:text-primary-400 mb-2">{stat.number}</div>
                <div className="text-gray-600 dark:text-gray-300 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 lg:py-20 bg-primary-700 dark:bg-primary-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">Ready to Join the BNK Finance Bank Family?</h2>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">Experience banking that puts you first. Open an account today and discover the difference.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup" className="px-8 py-4 bg-accent hover:bg-accent-600 text-accent-foreground font-semibold rounded-full transition-all shadow-lg hover:-translate-y-0.5">Open Account Today</Link>
            <Link href="/contact" className="px-8 py-4 border-2 border-white/30 hover:border-white/60 text-white font-semibold rounded-full transition-all hover:-translate-y-0.5">Contact Us</Link>
          </div>
        </div>
      </section>

      <FooterSection />
    </div>
  );
}
