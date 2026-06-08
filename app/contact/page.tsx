"use client";

import { useState } from "react";
import { CredixNavbar } from "@/components/credix-navbar";
import { FooterSection } from "@/components/landing-sections-bottom";

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", subject: "", message: "" });

  return (
    <div className="font-sans bg-[#eef3f7] dark:bg-gray-900 text-gray-900 dark:text-gray-100 min-h-screen">
      <CredixNavbar />

      {/* Hero */}
      <section className="relative py-20 lg:py-28 bg-primary-700 dark:bg-primary-900 overflow-hidden">
        <div className="absolute inset-0"><div className="absolute top-0 right-0 w-96 h-96 bg-primary-600/30 rounded-full blur-3xl" /></div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center px-4 py-2 bg-accent/20 text-accent rounded-full text-sm font-semibold mb-6 border border-accent/30">
            <i className="fa-solid fa-envelope mr-2" />Get In Touch
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">Contact Us</h1>
          <p className="text-xl text-primary-100 max-w-2xl mx-auto">We&apos;re here to help. Reach out to us through any of the channels below.</p>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {[
              { icon: "fa-clock", title: "Banking Hours", lines: ["Mon-Fri: 9AM-5PM", "Sat: 9AM-1PM", "Sun: Closed"] },
              { icon: "fa-phone", title: "Phone Banking", lines: ["Available 24/7", "Call: 1-800-BANKING", "International: +1-555-0123"] },
              { icon: "fa-envelope", title: "Email Support", lines: ["Response within 24hrs", "support@BNK-Finance.Com"] },
              { icon: "fa-map-marker-alt", title: "Visit Us", lines: ["123 Banking Street", "Financial District", "Wichita, KS"] },
            ].map((c, i) => (
              <div key={i} className="bg-[#eef3f7] dark:bg-gray-900 rounded-2xl p-6 text-center hover:shadow-lg transition-all hover:-translate-y-1">
                <div className="w-14 h-14 bg-accent/20 rounded-2xl flex items-center justify-center mx-auto mb-4"><i className={`fa-solid ${c.icon} text-xl text-primary-600 dark:text-primary-400`} /></div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-3">{c.title}</h3>
                {c.lines.map((line, j) => (<p key={j} className="text-gray-600 dark:text-gray-300 text-sm">{line}</p>))}
              </div>
            ))}
          </div>

          {/* Contact Form */}
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-10">
              <div className="flex items-center justify-center gap-2 text-primary-600 dark:text-primary-400 mb-4"><i className="fa-solid fa-asterisk text-xs" /><span className="text-sm font-semibold uppercase tracking-wider">Send A Message</span></div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">We&apos;d Love To Hear From You</h2>
            </div>
            <form className="space-y-6 bg-[#eef3f7] dark:bg-gray-900 rounded-3xl p-8 lg:p-10">
              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Full Name</label>
                  <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all" placeholder="John Doe" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email Address</label>
                  <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all" placeholder="john@example.com" />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Phone Number</label>
                  <input type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all" placeholder="+1 (555) 000-0000" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Subject</label>
                  <input type="text" value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})} className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all" placeholder="How can we help?" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Message</label>
                <textarea rows={5} value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all resize-none" placeholder="Tell us more..." />
              </div>
              <button type="submit" className="w-full px-8 py-4 bg-accent hover:bg-accent-600 text-accent-foreground font-semibold rounded-full transition-all shadow-lg hover:-translate-y-0.5">Send Message</button>
            </form>
          </div>
        </div>
      </section>

      <FooterSection />
    </div>
  );
}
