"use client";

import Link from "next/link";
import Image from "next/image";
import { CredixNavbar } from "@/components/credix-navbar";

export default function GrantsAidPage() {
  return (
    <div className="font-sans bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 min-h-screen">
      <CredixNavbar />

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 bg-gradient-to-br from-orange-600 via-orange-700 to-orange-800 dark:from-orange-800 dark:via-orange-900 dark:to-gray-900 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.1),transparent_50%)]"></div>
          <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_70%_80%,rgba(255,255,255,0.05),transparent_50%)]"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm text-white/90 rounded-full text-sm font-semibold mb-6 border border-white/20">
            <i className="fa-solid fa-hand-holding-dollar mr-2"></i>
            Grants & Aid
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
            Financial Assistance Programs
          </h1>
          <p className="text-xl text-orange-100 max-w-3xl mx-auto leading-relaxed">
            Supporting our members and communities through grants, scholarships, and financial aid programs designed to help during times of need and opportunity.
          </p>
        </div>
      </section>

      {/* Programs Section */}
      <section className="py-16 lg:py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-gray-900 dark:text-white">
              Available Programs
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              We offer various grant and aid programs to support our members and communities
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                icon: "fa-graduation-cap",
                title: "Educational Grants",
                desc: "Scholarships and grants for students pursuing higher education and professional development.",
                features: ["Merit-based scholarships", "Need-based grants", "Continuing education support", "Trade school programs"],
              },
              {
                icon: "fa-hands-helping",
                title: "Emergency Assistance",
                desc: "Financial assistance for members facing unexpected hardships and emergencies.",
                features: ["Natural disaster relief", "Medical emergency aid", "Temporary assistance", "Crisis support"],
              },
              {
                icon: "fa-leaf",
                title: "Community Grants",
                desc: "Supporting local community initiatives and nonprofit organizations in our service area.",
                features: ["Nonprofit funding", "Community projects", "Local initiatives", "Partnership programs"],
              },
              {
                icon: "fa-home",
                title: "Housing Assistance",
                desc: "Programs to help members with housing-related expenses and first-time homebuyer support.",
                features: ["Down payment assistance", "Home repair grants", "Rental assistance", "Housing counseling"],
              },
              {
                icon: "fa-heart",
                title: "Small Business Grants",
                desc: "Funding opportunities for small businesses and entrepreneurs in our community.",
                features: ["Startup funding", "Business expansion", "Equipment grants", "Training programs"],
              },
              {
                icon: "fa-users",
                title: "Financial Counseling",
                desc: "Free financial education and counseling services to help members improve their financial well-being.",
                features: ["Budget counseling", "Debt management", "Credit counseling", "Financial planning"],
              },
            ].map((program, idx) => (
              <div key={idx} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-200/50 dark:border-gray-700/50">
                <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900/50 dark:to-orange-800/50 rounded-2xl mb-4">
                  <i className={`fa-solid ${program.icon} text-2xl text-orange-600 dark:text-orange-400`}></i>
                </div>
                <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">{program.title}</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">{program.desc}</p>
                <ul className="space-y-2 mb-4">
                  {program.features.map((feature, fIdx) => (
                    <li key={fIdx} className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                      <i className="fa-solid fa-check text-orange-500 mr-2"></i>
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/contact"
                  className="inline-flex items-center text-orange-600 dark:text-orange-400 font-semibold hover:underline text-sm"
                >
                  Apply or Learn More <i className="fa-solid fa-arrow-right ml-2"></i>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 lg:py-20 bg-gradient-to-br from-slate-50 via-orange-50 to-teal-50 dark:from-gray-800 dark:via-orange-900/20 dark:to-teal-900/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-gray-900 dark:text-white">
              How Our Grant Programs Work
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              A simple process to apply for financial assistance
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: "1", icon: "fa-file-alt", title: "Review Programs", desc: "Browse available grants and aid programs to find the ones that match your needs." },
              { step: "2", icon: "fa-pencil-alt", title: "Complete Application", desc: "Fill out the application form with required documentation and information." },
              { step: "3", icon: "fa-clipboard-check", title: "Application Review", desc: "Our team reviews your application and may request additional information." },
              { step: "4", icon: "fa-check-circle", title: "Receive Decision", desc: "Get notified of the decision and next steps for approved applications." },
            ].map((step, idx) => (
              <div key={idx} className="text-center">
                <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900/50 dark:to-orange-800/50 rounded-full mx-auto mb-4">
                  <span className="text-2xl font-bold text-orange-600 dark:text-orange-400">{step.step}</span>
                </div>
                <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl mx-auto mb-4">
                  <i className={`fa-solid ${step.icon} text-white text-xl`}></i>
                </div>
                <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-white">{step.title}</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-20 bg-gradient-to-r from-orange-600 to-orange-700 dark:from-orange-800 dark:to-orange-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">
            Need Financial Assistance?
          </h2>
          <p className="text-xl text-orange-100 mb-8 max-w-2xl mx-auto">
            We're here to help. Contact us to learn more about our grant and aid programs or to start your application.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-orange-600 font-semibold rounded-2xl transition-all duration-300 shadow-2xl hover:shadow-xl hover:-translate-y-1 hover:scale-105"
            >
              <i className="fa-solid fa-file-alt mr-3"></i>
              Apply for Assistance
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center px-8 py-4 bg-orange-500/20 backdrop-blur-sm hover:bg-orange-500/30 text-white font-semibold rounded-2xl transition-all duration-300 border border-white/30 hover:border-white/50"
            >
              <i className="fa-solid fa-info-circle mr-3"></i>
              Learn More
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

