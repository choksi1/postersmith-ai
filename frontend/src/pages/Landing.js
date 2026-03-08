import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, Download, Palette, Check, Zap, Shield, Clock } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { LoggedOutNav, Footer } from "@/components/Navigation";

const Landing = () => {
  const { user } = useAuth();

  // If logged in, redirect handled by router
  if (user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <LoggedOutNav />

      {/* Hero Section */}
      <section className="pt-32 pb-24 px-6 md:px-12 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-violet-50 text-violet-700 px-4 py-2 rounded-full mb-8">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-body">AI-Powered Poster Creation for Etsy</span>
          </div>
          
          <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl text-gray-900 leading-tight mb-6">
            Turn One Line Into<br />
            <span className="text-violet-600">Print-Ready Wall Art</span>
          </h1>
          
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-10 font-body leading-relaxed">
            Create stunning A2 posters and SEO-optimized Etsy listings in seconds. 
            Just describe your idea — we handle the design, upscaling, and listing copy.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              to="/register" 
              className="bg-violet-500 text-white px-8 py-4 rounded-full font-body text-base hover:bg-violet-600 transition-colors duration-300 inline-flex items-center gap-2"
              data-testid="hero-cta-btn"
            >
              Start free trial
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link 
              to="/login" 
              className="text-gray-700 px-8 py-4 rounded-full font-body text-base hover:bg-gray-100 transition-colors duration-300 border border-gray-200"
              data-testid="hero-login-btn"
            >
              Log in
            </Link>
          </div>

          {/* Hero Image/Preview */}
          <div className="mt-16 relative">
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-4xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="aspect-[1/1.414] bg-gradient-to-br from-violet-100 to-violet-50 rounded-xl flex items-center justify-center">
                  <div className="text-center p-4">
                    <Sparkles className="w-10 h-10 text-violet-400 mx-auto mb-3" />
                    <p className="text-sm text-violet-600 font-body">Minimalist</p>
                  </div>
                </div>
                <div className="aspect-[1/1.414] bg-gradient-to-br from-amber-100 to-orange-50 rounded-xl flex items-center justify-center">
                  <div className="text-center p-4">
                    <Palette className="w-10 h-10 text-amber-500 mx-auto mb-3" />
                    <p className="text-sm text-amber-600 font-body">Boho</p>
                  </div>
                </div>
                <div className="aspect-[1/1.414] bg-gradient-to-br from-emerald-100 to-teal-50 rounded-xl flex items-center justify-center">
                  <div className="text-center p-4">
                    <Download className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
                    <p className="text-sm text-emerald-600 font-body">Abstract</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24 px-6 md:px-12 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-heading text-3xl md:text-4xl text-gray-900 mb-4">
              How it works
            </h2>
            <p className="text-gray-600 font-body text-lg max-w-2xl mx-auto">
              Create professional Etsy listings in three simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-violet-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="font-heading text-2xl text-violet-600">1</span>
              </div>
              <h3 className="font-heading text-xl text-gray-900 mb-3">Describe your idea</h3>
              <p className="text-gray-600 font-body leading-relaxed">
                Write a single line describing your poster. Choose from 6 style presets to match your vision.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-violet-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="font-heading text-2xl text-violet-600">2</span>
              </div>
              <h3 className="font-heading text-xl text-gray-900 mb-3">AI generates your poster</h3>
              <p className="text-gray-600 font-body leading-relaxed">
                Our AI creates a print-ready A2 poster at 300 DPI with professional composition and colors.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-violet-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="font-heading text-2xl text-violet-600">3</span>
              </div>
              <h3 className="font-heading text-xl text-gray-900 mb-3">Get your Etsy listing</h3>
              <p className="text-gray-600 font-body leading-relaxed">
                AI generates SEO-optimized titles, descriptions, and 13 tags. Copy directly to Etsy.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-6 md:px-12 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="font-heading text-3xl md:text-4xl text-gray-900 mb-6">
                Everything you need to sell wall art on Etsy
              </h2>
              <p className="text-gray-600 font-body text-lg mb-8">
                Stop spending hours on design and copywriting. Our AI handles it all so you can focus on growing your shop.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-6 h-6 bg-violet-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h4 className="font-body font-medium text-gray-900">Print-ready quality</h4>
                    <p className="text-gray-600 text-sm font-body">A2 size at 300 DPI (4961×7016 px) with JPG + PDF</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-6 h-6 bg-violet-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h4 className="font-body font-medium text-gray-900">SEO-optimized listings</h4>
                    <p className="text-gray-600 text-sm font-body">AI-generated titles, descriptions, and 13 tags</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-6 h-6 bg-violet-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h4 className="font-body font-medium text-gray-900">6 style presets</h4>
                    <p className="text-gray-600 text-sm font-body">Minimalist, Boho, Vintage, Kids, Abstract, Photo-Real</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-6 h-6 bg-violet-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h4 className="font-body font-medium text-gray-900">Instant downloads</h4>
                    <p className="text-gray-600 text-sm font-body">One-click copy for all listing content</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-xl p-6 text-center">
                  <p className="text-3xl font-heading text-violet-600 mb-1">A2</p>
                  <p className="text-sm text-gray-600 font-body">Paper Size</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-6 text-center">
                  <p className="text-3xl font-heading text-violet-600 mb-1">300</p>
                  <p className="text-sm text-gray-600 font-body">DPI Resolution</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-6 text-center">
                  <p className="text-2xl font-heading text-violet-600 mb-1">4961×7016</p>
                  <p className="text-sm text-gray-600 font-body">Pixels</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-6 text-center">
                  <p className="text-3xl font-heading text-violet-600 mb-1">JPG+PDF</p>
                  <p className="text-sm text-gray-600 font-body">Formats</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 px-6 md:px-12 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-heading text-3xl md:text-4xl text-gray-900 mb-4">
              Simple, transparent pricing
            </h2>
            <p className="text-gray-600 font-body text-lg">
              Start free, upgrade when you're ready
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Free Plan */}
            <div className="bg-gray-50 rounded-2xl p-8">
              <h3 className="font-heading text-xl text-gray-900 mb-2">Free Trial</h3>
              <p className="text-gray-600 font-body text-sm mb-6">Perfect for trying out</p>
              <p className="text-4xl font-heading text-gray-900 mb-6">$0</p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2 text-sm font-body text-gray-600">
                  <Check className="w-4 h-4 text-violet-500" />
                  3 poster generations
                </li>
                <li className="flex items-center gap-2 text-sm font-body text-gray-600">
                  <Check className="w-4 h-4 text-violet-500" />
                  3 listing generations
                </li>
                <li className="flex items-center gap-2 text-sm font-body text-gray-600">
                  <Check className="w-4 h-4 text-violet-500" />
                  All 6 style presets
                </li>
              </ul>
              <Link 
                to="/register" 
                className="block w-full text-center bg-white border border-gray-200 text-gray-700 px-6 py-3 rounded-xl font-body text-sm hover:bg-gray-50 transition-colors"
              >
                Get started
              </Link>
            </div>

            {/* Pro Plan */}
            <div className="bg-violet-600 rounded-2xl p-8 text-white relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-violet-400 text-white text-xs font-body px-3 py-1 rounded-full">
                Most Popular
              </div>
              <h3 className="font-heading text-xl mb-2">Pro</h3>
              <p className="text-violet-200 font-body text-sm mb-6">For active sellers</p>
              <p className="text-4xl font-heading mb-1">$19</p>
              <p className="text-violet-200 text-sm font-body mb-6">per month</p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2 text-sm font-body">
                  <Check className="w-4 h-4" />
                  50 poster generations/mo
                </li>
                <li className="flex items-center gap-2 text-sm font-body">
                  <Check className="w-4 h-4" />
                  Unlimited listings
                </li>
                <li className="flex items-center gap-2 text-sm font-body">
                  <Check className="w-4 h-4" />
                  Priority generation
                </li>
                <li className="flex items-center gap-2 text-sm font-body">
                  <Check className="w-4 h-4" />
                  All style presets
                </li>
              </ul>
              <Link 
                to="/register" 
                className="block w-full text-center bg-white text-violet-600 px-6 py-3 rounded-xl font-body text-sm hover:bg-violet-50 transition-colors"
              >
                Start free trial
              </Link>
            </div>

            {/* Business Plan */}
            <div className="bg-gray-50 rounded-2xl p-8">
              <h3 className="font-heading text-xl text-gray-900 mb-2">Business</h3>
              <p className="text-gray-600 font-body text-sm mb-6">For power sellers</p>
              <p className="text-4xl font-heading text-gray-900 mb-1">$49</p>
              <p className="text-gray-500 text-sm font-body mb-6">per month</p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2 text-sm font-body text-gray-600">
                  <Check className="w-4 h-4 text-violet-500" />
                  Unlimited generations
                </li>
                <li className="flex items-center gap-2 text-sm font-body text-gray-600">
                  <Check className="w-4 h-4 text-violet-500" />
                  Bulk export to CSV
                </li>
                <li className="flex items-center gap-2 text-sm font-body text-gray-600">
                  <Check className="w-4 h-4 text-violet-500" />
                  Custom style presets
                </li>
                <li className="flex items-center gap-2 text-sm font-body text-gray-600">
                  <Check className="w-4 h-4 text-violet-500" />
                  Priority support
                </li>
              </ul>
              <Link 
                to="/register" 
                className="block w-full text-center bg-white border border-gray-200 text-gray-700 px-6 py-3 rounded-xl font-body text-sm hover:bg-gray-50 transition-colors"
              >
                Contact sales
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-24 px-6 md:px-12 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-heading text-3xl md:text-4xl text-gray-900 mb-6">
            Built for Etsy sellers, by creators
          </h2>
          <p className="text-gray-600 font-body text-lg leading-relaxed mb-8">
            We understand the challenges of running a digital art shop on Etsy. The endless hours spent on design, 
            the struggle to write compelling listings, the SEO guesswork. PosterSmith AI was built to solve these 
            problems so you can focus on what matters: growing your business and delighting your customers.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-violet-100 rounded-xl flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-violet-600" />
              </div>
              <h4 className="font-body font-medium text-gray-900 mb-2">Fast</h4>
              <p className="text-gray-600 text-sm font-body">Generate posters in under 60 seconds</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-violet-100 rounded-xl flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-violet-600" />
              </div>
              <h4 className="font-body font-medium text-gray-900 mb-2">Safe</h4>
              <p className="text-gray-600 text-sm font-body">No copyrighted content, Etsy-compliant</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-violet-100 rounded-xl flex items-center justify-center mb-4">
                <Clock className="w-6 h-6 text-violet-600" />
              </div>
              <h4 className="font-body font-medium text-gray-900 mb-2">Time-saving</h4>
              <p className="text-gray-600 text-sm font-body">From idea to listing in minutes</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 md:px-12 bg-violet-600">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-heading text-3xl md:text-4xl text-white mb-6">
            Ready to grow your Etsy shop?
          </h2>
          <p className="text-violet-200 font-body text-lg mb-10">
            Join thousands of sellers creating beautiful wall art with AI
          </p>
          <Link 
            to="/register" 
            className="inline-flex items-center gap-2 bg-white text-violet-600 px-8 py-4 rounded-full font-body text-base hover:bg-violet-50 transition-colors duration-300"
            data-testid="cta-btn"
          >
            Start your free trial
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Landing;
