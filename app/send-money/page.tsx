"use client";

import Link from "next/link";
import Image from "next/image";
import { CredixNavbar } from "@/components/credix-navbar";

export default function LoansCreditPage() {
  return (
    <div className="font-sans bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 min-h-screen">
      <CredixNavbar />

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 bg-gradient-to-br from-green-600 via-green-700 to-green-800 dark:from-green-800 dark:via-green-900 dark:to-gray-900 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.1),transparent_50%)]"></div>
          <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_70%_80%,rgba(255,255,255,0.05),transparent_50%)]"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm text-white/90 rounded-full text-sm font-semibold mb-6 border border-white/20">
            <i className="fa-solid fa-handshake mr-2"></i>
            Loans & Credit
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
            Flexible Lending Solutions
          </h1>
          <p className="text-xl text-green-100 max-w-3xl mx-auto leading-relaxed">
            Competitive rates and flexible terms on loans and credit products to help you achieve your financial goals, whether it's buying a home, a car, or managing expenses.
          </p>
        </div>
      </section>

      {/* Loan Types Section */}
      <section className="py-16 lg:py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-gray-900 dark:text-white">
              Our Loan Products
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Choose from a variety of loan options designed to meet your specific needs
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: "fa-home",
                title: "Mortgage Loans",
                desc: "Fixed and adjustable rate mortgages with competitive terms for home purchases and refinancing.",
                features: ["Competitive rates", "Fast pre-approval", "Flexible terms", "Expert guidance"],
                color: "green",
              },
              {
                icon: "fa-car",
                title: "Auto Loans",
                desc: "Low interest rates on new and used vehicle loans with flexible repayment terms.",
                features: ["Low rates", "Quick approval", "New & used", "Online application"],
                color: "blue",
              },
              {
                icon: "fa-hand-holding-usd",
                title: "Personal Loans",
                desc: "Unsecured personal loans for debt consolidation, home improvements, or major purchases.",
                features: ["No collateral needed", "Fixed rates", "Fast funding", "Flexible amounts"],
                color: "purple",
              },
              {
                icon: "fa-graduation-cap",
                title: "Student Loans",
                desc: "Education financing options with competitive rates and flexible repayment plans.",
                features: ["Student-friendly rates", "Deferred payments", "No prepayment penalty", "Cosigner options"],
                color: "orange",
              },
              {
                icon: "fa-home",
                title: "Home Equity Loans",
                desc: "Tap into your home's equity with low rates and flexible terms for major expenses.",
                features: ["Low rates", "Tax benefits", "Fixed payments", "Flexible use"],
                color: "teal",
              },
              {
                icon: "fa-credit-card",
                title: "Lines of Credit",
                desc: "Revolving credit lines for ongoing financial flexibility and cash flow management.",
                features: ["Flexible access", "Interest only payments", "Revolving credit", "Quick access"],
                color: "pink",
              },
            ].map((loan, idx) => {
              const colorClasses = {
                green: {
                  bg: "from-green-100 to-green-200 dark:from-green-900/50 dark:to-green-800/50",
                  text: "text-green-600 dark:text-green-400",
                  check: "text-green-500",
                  link: "text-green-600 dark:text-green-400",
                },
                blue: {
                  bg: "from-blue-100 to-blue-200 dark:from-blue-900/50 dark:to-blue-800/50",
                  text: "text-blue-600 dark:text-blue-400",
                  check: "text-blue-500",
                  link: "text-blue-600 dark:text-blue-400",
                },
                purple: {
                  bg: "from-purple-100 to-purple-200 dark:from-purple-900/50 dark:to-purple-800/50",
                  text: "text-purple-600 dark:text-purple-400",
                  check: "text-purple-500",
                  link: "text-purple-600 dark:text-purple-400",
                },
                orange: {
                  bg: "from-orange-100 to-orange-200 dark:from-orange-900/50 dark:to-orange-800/50",
                  text: "text-orange-600 dark:text-orange-400",
                  check: "text-orange-500",
                  link: "text-orange-600 dark:text-orange-400",
                },
                teal: {
                  bg: "from-teal-100 to-teal-200 dark:from-teal-900/50 dark:to-teal-800/50",
                  text: "text-teal-600 dark:text-teal-400",
                  check: "text-teal-500",
                  link: "text-teal-600 dark:text-teal-400",
                },
                pink: {
                  bg: "from-pink-100 to-pink-200 dark:from-pink-900/50 dark:to-pink-800/50",
                  text: "text-pink-600 dark:text-pink-400",
                  check: "text-pink-500",
                  link: "text-pink-600 dark:text-pink-400",
                },
              };
              const classes = colorClasses[loan.color as keyof typeof colorClasses] || colorClasses.green;
              
              return (
                <div key={idx} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-200/50 dark:border-gray-700/50">
                  <div className={`flex items-center justify-center w-16 h-16 bg-gradient-to-br ${classes.bg} rounded-2xl mb-4`}>
                    <i className={`fa-solid ${loan.icon} text-2xl ${classes.text}`}></i>
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">{loan.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">{loan.desc}</p>
                  <ul className="space-y-2">
                    {loan.features.map((feature, fIdx) => (
                      <li key={fIdx} className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                        <i className={`fa-solid fa-check ${classes.check} mr-2`}></i>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/contact"
                    className={`inline-flex items-center mt-4 ${classes.link} font-semibold hover:underline text-sm`}
                  >
                    Learn More <i className="fa-solid fa-arrow-right ml-2"></i>
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 lg:py-20 bg-gradient-to-br from-slate-50 via-green-50 to-teal-50 dark:from-gray-800 dark:via-green-900/20 dark:to-teal-900/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-gray-900 dark:text-white">
                Why Choose BNK Finance Bank for Loans?
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                We're committed to providing you with the best loan options and terms. Our team of lending specialists works with you to find the right solution for your needs.
              </p>
              <div className="space-y-4">
                {[
                  { icon: "fa-percentage", title: "Competitive Rates", desc: "We offer some of the most competitive interest rates in the market." },
                  { icon: "fa-clock", title: "Fast Approval", desc: "Quick loan decisions and fast funding to meet your timeline." },
                  { icon: "fa-shield-halved", title: "Transparent Terms", desc: "Clear, straightforward terms with no hidden fees or surprises." },
                  { icon: "fa-user-friends", title: "Personal Service", desc: "Dedicated loan officers who guide you through the process." },
                ].map((benefit, idx) => (
                  <div key={idx} className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/50 dark:to-green-800/50 rounded-xl flex items-center justify-center">
                      <i className={`fa-solid ${benefit.icon} text-green-600 dark:text-green-400 text-xl`}></i>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white mb-1">{benefit.title}</h3>
                      <p className="text-gray-600 dark:text-gray-300 text-sm">{benefit.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                <Image
                  src="https://images.unsplash.com/photo-1551836022-deb4988cc6c0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                  alt="Loans and credit"
                  width={800}
                  height={600}
                  className="w-full h-auto"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-20 bg-gradient-to-r from-green-600 to-green-700 dark:from-green-800 dark:to-green-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">
            Ready to Apply for a Loan?
          </h2>
          <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
            Get started today with our simple online application process or speak with one of our loan specialists.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-green-600 font-semibold rounded-2xl transition-all duration-300 shadow-2xl hover:shadow-xl hover:-translate-y-1 hover:scale-105"
            >
              <i className="fa-solid fa-file-alt mr-3"></i>
              Apply Now
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center px-8 py-4 bg-green-500/20 backdrop-blur-sm hover:bg-green-500/30 text-white font-semibold rounded-2xl transition-all duration-300 border border-white/30 hover:border-white/50"
            >
              <i className="fa-solid fa-phone mr-3"></i>
              Talk to a Specialist
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

