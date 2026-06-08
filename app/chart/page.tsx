"use client";

import Link from "next/link";
import Image from "next/image";
import { CredixNavbar } from "@/components/credix-navbar";

export default function PersonalBankingPage() {
  return (
    <div className="font-sans bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 min-h-screen">
      <CredixNavbar />

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 dark:from-primary-800 dark:via-primary-900 dark:to-gray-900 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.1),transparent_50%)]"></div>
          <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_70%_80%,rgba(255,255,255,0.05),transparent_50%)]"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm text-white/90 rounded-full text-sm font-semibold mb-6 border border-white/20">
            <i className="fa-solid fa-user mr-2"></i>
            Personal Banking
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
            Banking Solutions for Individuals
          </h1>
          <p className="text-xl text-primary-100 max-w-3xl mx-auto leading-relaxed">
            Comprehensive personal banking services designed to help you manage your finances, save for your goals, and build your financial future.
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 lg:py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-gray-900 dark:text-white">
                Your Personal Banking Partner
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                At BNK Finance Bank, we understand that personal banking needs vary from person to person. That's why we offer a range of services and products tailored to help you achieve your individual financial goals.
              </p>
              <div className="space-y-4">
                {[
                  { icon: "fa-university", title: "Checking Accounts", desc: "Free checking accounts with no minimum balance requirements and free online banking." },
                  { icon: "fa-piggy-bank", title: "Savings Accounts", desc: "High-yield savings accounts with competitive interest rates to help your money grow." },
                  { icon: "fa-mobile-alt", title: "Mobile Banking", desc: "Bank on the go with our secure mobile app - check balances, transfer funds, and deposit checks." },
                  { icon: "fa-credit-card", title: "Debit Cards", desc: "Free debit cards with fraud protection and instant transaction alerts." },
                ].map((feature, idx) => (
                  <div key={idx} className="flex items-start space-x-4 p-4 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-700/50 hover:shadow-lg transition-all duration-300">
                    <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/50 dark:to-primary-800/50 rounded-xl flex items-center justify-center">
                      <i className={`fa-solid ${feature.icon} text-primary-600 dark:text-primary-400 text-xl`}></i>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white mb-1">{feature.title}</h3>
                      <p className="text-gray-600 dark:text-gray-300 text-sm">{feature.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                <Image
                  src="https://images.unsplash.com/photo-1554224155-6726b3ff858f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                  alt="Personal banking"
                  width={800}
                  height={600}
                  className="w-full h-auto"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-16 lg:py-20 bg-gradient-to-br from-slate-50 via-primary-50 to-teal-50 dark:from-gray-800 dark:via-primary-900/20 dark:to-teal-900/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-gray-900 dark:text-white">
              Personal Banking Services
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Everything you need to manage your personal finances effectively
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: "fa-wallet", title: "Checking Accounts", features: ["No monthly fees", "Free online banking", "Mobile check deposit", "Free debit card"] },
              { icon: "fa-chart-line", title: "Savings Accounts", features: ["Competitive interest rates", "No minimum balance", "Automated savings", "Goal tracking"] },
              { icon: "fa-hand-holding-usd", title: "Personal Loans", features: ["Competitive rates", "Flexible terms", "Quick approval", "Easy application"] },
              { icon: "fa-home", title: "Mortgage Loans", features: ["Home purchase", "Refinancing", "Fixed & adjustable rates", "Expert guidance"] },
              { icon: "fa-car", title: "Auto Loans", features: ["Low interest rates", "Fast approval", "New & used vehicles", "Online application"] },
              { icon: "fa-shield-halved", title: "Identity Theft Protection", features: ["24/7 monitoring", "Fraud alerts", "Credit monitoring", "Recovery assistance"] },
            ].map((service, idx) => (
              <div key={idx} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-200/50 dark:border-gray-700/50">
                <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/50 dark:to-primary-800/50 rounded-2xl mb-4">
                  <i className={`fa-solid ${service.icon} text-2xl text-primary-600 dark:text-primary-400`}></i>
                </div>
                <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">{service.title}</h3>
                <ul className="space-y-2">
                  {service.features.map((feature, fIdx) => (
                    <li key={fIdx} className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                      <i className="fa-solid fa-check text-primary-500 mr-2"></i>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-20 bg-gradient-to-r from-primary-600 to-primary-700 dark:from-primary-800 dark:to-primary-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Open a personal banking account today and take control of your financial future.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-primary-600 font-semibold rounded-2xl transition-all duration-300 shadow-2xl hover:shadow-xl hover:-translate-y-1 hover:scale-105"
            >
              <i className="fa-solid fa-user-plus mr-3"></i>
              Open Account
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center px-8 py-4 bg-primary-500/20 backdrop-blur-sm hover:bg-primary-500/30 text-white font-semibold rounded-2xl transition-all duration-300 border border-white/30 hover:border-white/50"
            >
              <i className="fa-solid fa-phone mr-3"></i>
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

