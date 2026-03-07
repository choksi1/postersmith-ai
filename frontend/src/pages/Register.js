import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ArrowLeft, Loader2 } from "lucide-react";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const userData = await register(email, password, name);
      toast.success(`Welcome to PosterSmith, ${userData.name}!`);
      navigate("/workspace");
    } catch (error) {
      const message = error.response?.data?.detail || "Registration failed";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-studio-bg flex">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-studio-subtle items-center justify-center p-12">
        <div className="max-w-md">
          <div className="poster-preview bg-white flex items-center justify-center mb-8">
            <p className="font-heading text-studio-muted text-center p-8">
              Start creating today
            </p>
          </div>
          <p className="text-center text-studio-muted font-body">
            Join thousands of Etsy sellers using PosterSmith
          </p>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md">
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-studio-muted hover:text-studio-text transition-colors duration-300 mb-12 font-body text-sm"
            data-testid="back-to-home"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to home
          </Link>

          <div className="mb-12">
            <h1 className="font-heading text-3xl md:text-4xl text-studio-text mb-3">
              Create your account
            </h1>
            <p className="text-studio-muted font-body">
              Start creating print-ready posters for Etsy
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm uppercase tracking-widest text-studio-muted font-body">
                Name
              </Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="studio-input w-full"
                placeholder="Your name"
                required
                data-testid="register-name-input"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm uppercase tracking-widest text-studio-muted font-body">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="studio-input w-full"
                placeholder="you@example.com"
                required
                data-testid="register-email-input"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm uppercase tracking-widest text-studio-muted font-body">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="studio-input w-full"
                placeholder="••••••••"
                minLength={6}
                required
                data-testid="register-password-input"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="studio-button-primary w-full flex items-center justify-center gap-2"
              data-testid="register-submit-btn"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-studio-muted font-body">
            Already have an account?{" "}
            <Link 
              to="/login" 
              className="text-studio-text hover:text-studio-sage transition-colors duration-300"
              data-testid="login-link"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
