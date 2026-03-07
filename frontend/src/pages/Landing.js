import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, Download, Palette } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const Landing = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-studio-bg">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-studio-bg/80 backdrop-blur-sm border-b border-studio-border">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-4 flex items-center justify-between">
          <Link to="/" className="font-heading text-xl text-studio-text" data-testid="logo">
            PosterSmith AI
          </Link>
          <nav className="flex items-center gap-6">
            {user ? (
              <Link 
                to="/workspace" 
                className="studio-button-primary"
                data-testid="go-to-workspace-btn"
              >
                Go to Workspace
              </Link>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className="text-studio-muted hover:text-studio-text transition-colors duration-300 font-body text-sm"
                  data-testid="login-link"
                >
                  Sign In
                </Link>
                <Link 
                  to="/register" 
                  className="studio-button-primary"
                  data-testid="get-started-btn"
                >
                  Get Started
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-24 px-6 md:px-12">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm uppercase tracking-widest text-studio-sage mb-6 font-body">
              For Etsy Sellers
            </p>
            <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl text-studio-text leading-tight mb-8">
              Turn One Line Into<br />
              <span className="text-studio-sage">Print-Ready Wall Art</span>
            </h1>
            <p className="text-lg text-studio-muted max-w-2xl mx-auto mb-12 font-body leading-relaxed">
              Create stunning A2 posters for your Etsy shop in seconds. 
              Just describe your idea — we handle the design, upscaling, and print preparation.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link 
                to="/register" 
                className="studio-button-primary inline-flex items-center gap-3"
                data-testid="hero-cta-btn"
              >
                Start Creating
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link 
                to="/login" 
                className="studio-button-secondary"
                data-testid="hero-signin-btn"
              >
                Sign In
              </Link>
            </div>
          </div>

          {/* Poster Preview Mockup */}
          <div className="relative max-w-md mx-auto">
            <div className="poster-preview bg-studio-subtle flex items-center justify-center">
              <div className="text-center p-8">
                <Sparkles className="w-12 h-12 text-studio-sage mx-auto mb-4" />
                <p className="font-heading text-xl text-studio-text">Your Poster Here</p>
                <p className="text-studio-muted text-sm mt-2 font-body">A2 • 300 DPI • Print-Ready</p>
              </div>
            </div>
            <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-studio-sage/10 -z-10"></div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-6 md:px-12 bg-white border-t border-b border-studio-border">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm uppercase tracking-widest text-studio-sage mb-4 font-body">
              How It Works
            </p>
            <h2 className="font-heading text-3xl md:text-4xl text-studio-text">
              Simple. Fast. Professional.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            <div className="studio-card text-center" data-testid="feature-describe">
              <div className="w-16 h-16 bg-studio-subtle flex items-center justify-center mx-auto mb-6">
                <Sparkles className="w-8 h-8 text-studio-sage" />
              </div>
              <h3 className="font-heading text-xl text-studio-text mb-3">Describe</h3>
              <p className="text-studio-muted font-body leading-relaxed">
                Write a single line describing your poster idea. Choose a style preset.
              </p>
            </div>

            <div className="studio-card text-center" data-testid="feature-generate">
              <div className="w-16 h-16 bg-studio-subtle flex items-center justify-center mx-auto mb-6">
                <Palette className="w-8 h-8 text-studio-sage" />
              </div>
              <h3 className="font-heading text-xl text-studio-text mb-3">Generate</h3>
              <p className="text-studio-muted font-body leading-relaxed">
                AI creates your design with professional prompt engineering and upscales to print quality.
              </p>
            </div>

            <div className="studio-card text-center" data-testid="feature-download">
              <div className="w-16 h-16 bg-studio-subtle flex items-center justify-center mx-auto mb-6">
                <Download className="w-8 h-8 text-studio-sage" />
              </div>
              <h3 className="font-heading text-xl text-studio-text mb-3">Download</h3>
              <p className="text-studio-muted font-body leading-relaxed">
                Get print-ready JPG and PDF files at A2 size, 300 DPI — ready for Etsy.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Specs Section */}
      <section className="py-24 px-6 md:px-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm uppercase tracking-widest text-studio-sage mb-4 font-body">
              Print Specifications
            </p>
            <h2 className="font-heading text-3xl md:text-4xl text-studio-text">
              Etsy-Ready Quality
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="bg-white border border-studio-border p-6 text-center" data-testid="spec-size">
              <p className="text-2xl font-heading text-studio-text mb-2">A2</p>
              <p className="text-sm text-studio-muted font-body">Paper Size</p>
            </div>
            <div className="bg-white border border-studio-border p-6 text-center" data-testid="spec-dpi">
              <p className="text-2xl font-heading text-studio-text mb-2">300</p>
              <p className="text-sm text-studio-muted font-body">DPI Resolution</p>
            </div>
            <div className="bg-white border border-studio-border p-6 text-center" data-testid="spec-pixels">
              <p className="text-2xl font-heading text-studio-text mb-2">4961×7016</p>
              <p className="text-sm text-studio-muted font-body">Pixels</p>
            </div>
            <div className="bg-white border border-studio-border p-6 text-center" data-testid="spec-formats">
              <p className="text-2xl font-heading text-studio-text mb-2">JPG+PDF</p>
              <p className="text-sm text-studio-muted font-body">Formats</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 md:px-12 border-t border-studio-border">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="font-heading text-studio-text">PosterSmith AI</p>
          <p className="text-sm text-studio-muted font-body">
            Create beautiful wall art for your Etsy shop
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
