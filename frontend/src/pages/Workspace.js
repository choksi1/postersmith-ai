import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import axios from "axios";
import { toast } from "sonner";
import { 
  Loader2, 
  Download, 
  Sparkles,
  LogOut,
  FolderOpen,
  RefreshCw
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const STYLE_PRESETS = [
  { value: "minimalist", label: "Minimalist", description: "Clean lines, negative space" },
  { value: "boho", label: "Boho", description: "Earthy, organic, warm" },
  { value: "vintage", label: "Vintage", description: "Retro, textured, classic" },
  { value: "kids", label: "Kids", description: "Playful, bright, cute" },
  { value: "abstract", label: "Abstract", description: "Bold shapes, modern" },
  { value: "photo-real", label: "Photo Real", description: "Realistic, cinematic" },
];

const Workspace = () => {
  const { user, logout } = useAuth();
  const [prompt, setPrompt] = useState("");
  const [stylePreset, setStylePreset] = useState("minimalist");
  const [generating, setGenerating] = useState(false);
  const [currentPoster, setCurrentPoster] = useState(null);

  const generatePoster = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a poster idea");
      return;
    }

    if (prompt.length > 200) {
      toast.error("Prompt must be 200 characters or less");
      return;
    }

    setGenerating(true);
    setCurrentPoster(null);

    try {
      const response = await axios.post(`${API}/generate-poster`, {
        prompt: prompt.trim(),
        style_preset: stylePreset
      });
      
      setCurrentPoster(response.data);
      toast.success("Poster generated successfully!");
    } catch (error) {
      const message = error.response?.data?.detail || "Failed to generate poster";
      toast.error(message);
    } finally {
      setGenerating(false);
    }
  };

  const downloadFile = (url, filename) => {
    const link = document.createElement("a");
    link.href = `${process.env.REACT_APP_BACKEND_URL}${url}`;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const resetWorkspace = () => {
    setPrompt("");
    setCurrentPoster(null);
  };

  return (
    <div className="min-h-screen bg-studio-bg flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-studio-border flex-shrink-0">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-4 flex items-center justify-between">
          <Link to="/workspace" className="font-heading text-xl text-studio-text" data-testid="logo">
            PosterSmith AI
          </Link>
          
          <nav className="flex items-center gap-6">
            <Link 
              to="/workspace" 
              className="text-studio-text font-body text-sm font-medium"
              data-testid="workspace-link"
            >
              Workspace
            </Link>
            <Link 
              to="/dashboard" 
              className="text-studio-muted hover:text-studio-text transition-colors duration-300 font-body text-sm"
              data-testid="dashboard-link"
            >
              My Posters
            </Link>
            <Link 
              to="/listings" 
              className="text-studio-muted hover:text-studio-text transition-colors duration-300 font-body text-sm"
              data-testid="listings-link"
            >
              Manage Listings
            </Link>
            {user?.role === "admin" && (
              <Link 
                to="/admin" 
                className="text-studio-muted hover:text-studio-text transition-colors duration-300 font-body text-sm"
                data-testid="admin-link"
              >
                Admin
              </Link>
            )}
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button 
                  className="w-10 h-10 bg-studio-sage text-white flex items-center justify-center font-body text-sm"
                  data-testid="user-menu-btn"
                >
                  {user?.name?.charAt(0).toUpperCase()}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <div className="px-3 py-2">
                  <p className="font-body text-sm font-medium text-studio-text">{user?.name}</p>
                  <p className="font-body text-xs text-studio-muted">{user?.email}</p>
                  <p className="font-body text-xs text-studio-sage capitalize mt-1">{user?.role}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="text-studio-error cursor-pointer">
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="flex-1 flex flex-col lg:flex-row">
        {/* Poster Preview Area */}
        <div className="flex-1 flex items-center justify-center p-6 md:p-12 bg-studio-subtle/50">
          <div className="w-full max-w-lg">
            {generating ? (
              <div className="poster-skeleton flex items-center justify-center">
                <div className="text-center">
                  <Loader2 className="w-12 h-12 animate-spin text-studio-sage mx-auto mb-4" />
                  <p className="font-heading text-lg text-studio-text">Creating your poster...</p>
                  <p className="text-studio-muted text-sm font-body mt-2">This may take up to 60 seconds</p>
                </div>
              </div>
            ) : currentPoster ? (
              <div className="relative">
                <div className="poster-preview overflow-hidden" data-testid="poster-preview">
                  <img 
                    src={`${process.env.REACT_APP_BACKEND_URL}${currentPoster.preview_url}`}
                    alt={currentPoster.prompt}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {/* Download buttons */}
                <div className="flex items-center justify-center gap-4 mt-6">
                  <button
                    onClick={() => downloadFile(currentPoster.jpg_url, `poster-${currentPoster.id}.jpg`)}
                    className="studio-button-primary inline-flex items-center gap-2"
                    data-testid="download-jpg-btn"
                  >
                    <Download className="w-4 h-4" />
                    Download JPG
                  </button>
                  {currentPoster.pdf_url && (
                    <button
                      onClick={() => downloadFile(currentPoster.pdf_url, `poster-${currentPoster.id}.pdf`)}
                      className="studio-button-secondary inline-flex items-center gap-2"
                      data-testid="download-pdf-btn"
                    >
                      <Download className="w-4 h-4" />
                      Download PDF
                    </button>
                  )}
                </div>
                
                {/* Poster info */}
                <div className="text-center mt-6">
                  <p className="text-sm text-studio-muted font-body">
                    A2 • 4961×7016 px • 300 DPI
                  </p>
                </div>
              </div>
            ) : (
              <div className="poster-preview bg-white/80 flex items-center justify-center" data-testid="empty-preview">
                <div className="text-center p-8">
                  <Sparkles className="w-16 h-16 text-studio-border mx-auto mb-6" />
                  <p className="font-heading text-xl text-studio-text mb-2">Your poster preview</p>
                  <p className="text-studio-muted text-sm font-body">
                    Describe your idea and click Generate
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Controls Panel */}
        <div className="w-full lg:w-96 bg-white border-t lg:border-t-0 lg:border-l border-studio-border p-6 md:p-8 flex-shrink-0">
          <div className="max-w-md mx-auto lg:max-w-none">
            <div className="mb-8">
              <h2 className="font-heading text-2xl text-studio-text mb-2">Create Poster</h2>
              <p className="text-studio-muted text-sm font-body">
                Describe your poster idea in one line
              </p>
            </div>

            <div className="space-y-8">
              {/* Prompt Input */}
              <div>
                <label className="text-sm uppercase tracking-widest text-studio-muted font-body block mb-3">
                  Your Idea
                </label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="A serene mountain landscape at sunset with pine trees"
                  className="w-full h-32 bg-white border border-studio-border p-4 text-studio-text font-body placeholder:text-studio-light focus:border-studio-text focus:outline-none resize-none transition-colors duration-300"
                  maxLength={200}
                  disabled={generating}
                  data-testid="prompt-input"
                />
                <p className="text-xs text-studio-light font-body mt-2 text-right">
                  {prompt.length}/200
                </p>
              </div>

              {/* Style Preset */}
              <div>
                <label className="text-sm uppercase tracking-widest text-studio-muted font-body block mb-3">
                  Style
                </label>
                <Select value={stylePreset} onValueChange={setStylePreset} disabled={generating}>
                  <SelectTrigger className="w-full border-studio-border focus:ring-0 focus:border-studio-text rounded-none" data-testid="style-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STYLE_PRESETS.map((style) => (
                      <SelectItem 
                        key={style.value} 
                        value={style.value}
                        data-testid={`style-option-${style.value}`}
                      >
                        <div>
                          <span className="font-body">{style.label}</span>
                          <span className="text-studio-muted text-xs ml-2">— {style.description}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Generate Button */}
              <button
                onClick={generatePoster}
                disabled={generating || !prompt.trim()}
                className="studio-button-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                data-testid="generate-btn"
              >
                {generating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Generate Poster
                  </>
                )}
              </button>

              {/* Secondary Actions */}
              {currentPoster && (
                <button
                  onClick={resetWorkspace}
                  className="studio-button-secondary w-full inline-flex items-center justify-center gap-2"
                  data-testid="new-poster-btn"
                >
                  <RefreshCw className="w-4 h-4" />
                  Create Another
                </button>
              )}

              <Link
                to="/dashboard"
                className="studio-button-secondary w-full inline-flex items-center justify-center gap-2"
                data-testid="view-all-btn"
              >
                <FolderOpen className="w-4 h-4" />
                View All Posters
              </Link>
            </div>

            {/* Specs Info */}
            <div className="mt-12 pt-8 border-t border-studio-border">
              <p className="text-xs uppercase tracking-widest text-studio-muted font-body mb-4">
                Output Specifications
              </p>
              <div className="grid grid-cols-2 gap-4 text-sm font-body">
                <div>
                  <p className="text-studio-light">Size</p>
                  <p className="text-studio-text">A2 (42×59.4 cm)</p>
                </div>
                <div>
                  <p className="text-studio-light">Resolution</p>
                  <p className="text-studio-text">300 DPI</p>
                </div>
                <div>
                  <p className="text-studio-light">Pixels</p>
                  <p className="text-studio-text">4961×7016 px</p>
                </div>
                <div>
                  <p className="text-studio-light">Formats</p>
                  <p className="text-studio-text">JPG + PDF</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Workspace;
