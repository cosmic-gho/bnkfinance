"use client";

import Link from "next/link";
import Image from "next/image";
import { CredixNavbar } from "@/components/credix-navbar";

export default function BusinessBankingPage() {
  return (
    <div className="font-sans bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 min-h-screen">
      <CredixNavbar />

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 dark:from-blue-800 dark:via-blue-900 dark:to-gray-900 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.1),transparent_50%)]"></div>
          <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_70%_80%,rgba(255,255,255,0.05),transparent_50%)]"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm text-white/90 rounded-full text-sm font-semibold mb-6 border border-white/20">
            <i className="fa-solid fa-briefcase mr-2"></i>
            Business Banking
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
            Banking Solutions for Your Business
          </h1>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
            Comprehensive business banking services designed to help your business grow, manage cash flow, and achieve financial success.
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 lg:py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                <Image
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                  alt="Business banking"
                  width={800}
                  height={600}
                  className="w-full h-auto"
                />
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-gray-900 dark:text-white">
                Built for Business Success
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                Whether you're a startup, small business, or established company, BNK Finance Bank offers business banking solutions tailored to your needs. We provide the tools and support to help your business thrive.
              </p>
              <div className="space-y-4">
                {[
                  { icon: "fa-building", title: "Business Checking", desc: "Accounts designed for business transactions with features like remote deposit and ACH transfers." },
                  { icon: "fa-users", title: "Team Management", desc: "Multi-user access with role-based permissions and spending controls for your team." },
                  { icon: "fa-chart-bar", title: "Cash Management", desc: "Tools to manage cash flow, track expenses, and streamline financial operations." },
                  { icon: "fa-headset", title: "Dedicated Support", desc: "Priority customer service and dedicated business banking specialists." },
                ].map((feature, idx) => (
                  <div key={idx} className="flex items-start space-x-4 p-4 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 hover:shadow-lg transition-all duration-300">
                    <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/50 dark:to-blue-800/50 rounded-xl flex items-center justify-center">
                      <i className={`fa-solid ${feature.icon} text-blue-600 dark:text-blue-400 text-xl`}></i>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white mb-1">{feature.title}</h3>
                      <p className="text-gray-600 dark:text-gray-300 text-sm">{feature.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-16 lg:py-20 bg-gradient-to-br from-slate-50 via-blue-50 to-teal-50 dark:from-gray-800 dark:via-blue-900/20 dark:to-teal-900/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-gray-900 dark:text-white">
              Business Banking Services
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Comprehensive solutions to manage and grow your business finances
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: "fa-building", title: "Business Checking", features: ["Low fees", "Unlimited transactions", "Online banking", "Mobile app access"] },
              { icon: "fa-chart-line", title: "Business Savings", features: ["Interest-bearing accounts", "No minimum balance", "Easy transfers", "Automatic savings"] },
              { icon: "fa-handshake", title: "Business Loans", features: ["Working capital loans", "Equipment financing", "Line of credit", "Commercial real estate"] },
              { icon: "fa-credit-card", title: "Business Credit Cards", features: ["Cashback rewards", "Expense tracking", "Employee cards", "Spending limits"] },
              { icon: "fa-money-check", title: "Merchant Services", features: ["Payment processing", "Point of sale solutions", "Online payments", "Multi-channel support"] },
              { icon: "fa-file-invoice-dollar", title: "Treasury Management", features: ["ACH payments", "Wire transfers", "Lockbox services", "Account reconciliation"] },
            ].map((service, idx) => (
              <div key={idx} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-200/50 dark:border-gray-700/50">
                <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/50 dark:to-blue-800/50 rounded-2xl mb-4">
                  <i className={`fa-solid ${service.icon} text-2xl text-blue-600 dark:text-blue-400`}></i>
                </div>
                <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">{service.title}</h3>
                <ul className="space-y-2">
                  {service.features.map((feature, fIdx) => (
                    <li key={fIdx} className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                      <i className="fa-solid fa-check text-blue-500 mr-2"></i>
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
      <section className="py-16 lg:py-20 bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-800 dark:to-blue-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">
            Grow Your Business with BNK Finance Bank
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Get started with business banking services designed to help your business succeed.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-blue-600 font-semibold rounded-2xl transition-all duration-300 shadow-2xl hover:shadow-xl hover:-translate-y-1 hover:scale-105"
            >
              <i className="fa-solid fa-briefcase mr-3"></i>
              Open Business Account
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center px-8 py-4 bg-blue-500/20 backdrop-blur-sm hover:bg-blue-500/30 text-white font-semibold rounded-2xl transition-all duration-300 border border-white/30 hover:border-white/50"
            >
              <i className="fa-solid fa-phone mr-3"></i>
              Speak with an Expert
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

