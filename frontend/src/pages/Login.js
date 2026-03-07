import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ArrowLeft, Loader2 } from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(email, password);
      toast.success("Welcome back!");
      navigate("/workspace");
    } catch (error) {
      const message = error.response?.data?.detail || "Invalid credentials";
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
              Your next bestseller awaits
            </p>
          </div>
          <p className="text-center text-studio-muted font-body">
            Create print-ready A2 posters in seconds
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
              Welcome back
            </h1>
            <p className="text-studio-muted font-body">
              Sign in to your PosterSmith account
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
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
                data-testid="login-email-input"
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
                required
                data-testid="login-password-input"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="studio-button-primary w-full flex items-center justify-center gap-2"
              data-testid="login-submit-btn"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-studio-muted font-body">
            Don't have an account?{" "}
            <Link 
              to="/register" 
              className="text-studio-text hover:text-studio-sage transition-colors duration-300"
              data-testid="register-link"
            >
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
