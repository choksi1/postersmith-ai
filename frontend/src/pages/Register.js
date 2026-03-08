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
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-violet-600 items-center justify-center p-12">
        <div className="max-w-md text-center">
          <div className="aspect-[1/1.414] bg-white/10 rounded-2xl flex items-center justify-center mb-8">
            <p className="font-heading text-white/80 text-xl p-8">
              Start creating today
            </p>
          </div>
          <p className="text-violet-200 font-body">
            Join thousands of Etsy sellers using PosterSmith
          </p>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md">
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors duration-300 mb-12 font-body text-sm"
            data-testid="back-to-home"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to home
          </Link>

          <div className="mb-10">
            <h1 className="font-heading text-3xl text-gray-900 mb-3">
              Start your free trial
            </h1>
            <p className="text-gray-500 font-body">
              Create print-ready posters for your Etsy shop
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium text-gray-700 font-body">
                Name
              </Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border-gray-200 focus:border-violet-500 focus:ring-violet-500"
                placeholder="Your name"
                required
                data-testid="register-name-input"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700 font-body">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border-gray-200 focus:border-violet-500 focus:ring-violet-500"
                placeholder="you@example.com"
                required
                data-testid="register-email-input"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-gray-700 font-body">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border-gray-200 focus:border-violet-500 focus:ring-violet-500"
                placeholder="••••••••"
                minLength={6}
                required
                data-testid="register-password-input"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-violet-500 text-white py-3 rounded-xl font-body text-sm hover:bg-violet-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
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

          <p className="mt-8 text-center text-gray-500 font-body">
            Already have an account?{" "}
            <Link 
              to="/login" 
              className="text-violet-600 hover:text-violet-700 transition-colors duration-300 font-medium"
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
