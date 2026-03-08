import { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { 
  Loader2, 
  Download, 
  Sparkles,
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
import { LoggedInNav, Footer } from "@/components/Navigation";

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
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <LoggedInNav />

      {/* Main Workspace */}
      <main className="flex-1 flex flex-col lg:flex-row">
        {/* Poster Preview Area */}
        <div className="flex-1 flex items-center justify-center p-6 md:p-12 bg-gray-100">
          <div className="w-full max-w-lg">
            {generating ? (
              <div className="aspect-[1/1.414] bg-white rounded-xl shadow-lg flex items-center justify-center">
                <div className="text-center">
                  <Loader2 className="w-12 h-12 animate-spin text-violet-500 mx-auto mb-4" />
                  <p className="font-heading text-lg text-gray-900">Creating your poster...</p>
                  <p className="text-gray-500 text-sm font-body mt-2">This may take up to 60 seconds</p>
                </div>
              </div>
            ) : currentPoster ? (
              <div className="relative">
                <div className="aspect-[1/1.414] bg-white rounded-xl shadow-lg overflow-hidden" data-testid="poster-preview">
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
                    className="bg-violet-500 text-white px-6 py-3 rounded-full font-body text-sm hover:bg-violet-600 transition-colors inline-flex items-center gap-2"
                    data-testid="download-jpg-btn"
                  >
                    <Download className="w-4 h-4" />
                    Download JPG
                  </button>
                  {currentPoster.pdf_url && (
                    <button
                      onClick={() => downloadFile(currentPoster.pdf_url, `poster-${currentPoster.id}.pdf`)}
                      className="bg-white border border-gray-200 text-gray-700 px-6 py-3 rounded-full font-body text-sm hover:bg-gray-50 transition-colors inline-flex items-center gap-2"
                      data-testid="download-pdf-btn"
                    >
                      <Download className="w-4 h-4" />
                      Download PDF
                    </button>
                  )}
                </div>
                
                {/* Poster info */}
                <div className="text-center mt-6">
                  <p className="text-sm text-gray-500 font-body">
                    A2 • 4961×7016 px • 300 DPI
                  </p>
                </div>
              </div>
            ) : (
              <div className="aspect-[1/1.414] bg-white rounded-xl shadow-lg flex items-center justify-center" data-testid="empty-preview">
                <div className="text-center p-8">
                  <Sparkles className="w-16 h-16 text-gray-200 mx-auto mb-6" />
                  <p className="font-heading text-xl text-gray-900 mb-2">Your poster preview</p>
                  <p className="text-gray-500 text-sm font-body">
                    Describe your idea and click Generate
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Controls Panel */}
        <div className="w-full lg:w-96 bg-white border-t lg:border-t-0 lg:border-l border-gray-200 p-6 md:p-8 flex-shrink-0">
          <div className="max-w-md mx-auto lg:max-w-none">
            <div className="mb-8">
              <h2 className="font-heading text-2xl text-gray-900 mb-2">Create Poster</h2>
              <p className="text-gray-500 text-sm font-body">
                Describe your poster idea in one line
              </p>
            </div>

            <div className="space-y-6">
              {/* Prompt Input */}
              <div>
                <label className="text-sm font-medium text-gray-700 font-body block mb-2">
                  Your Idea
                </label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="A serene mountain landscape at sunset with pine trees"
                  className="w-full h-32 bg-white border border-gray-200 rounded-xl p-4 text-gray-900 font-body placeholder:text-gray-400 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 focus:outline-none resize-none transition-colors duration-300"
                  maxLength={200}
                  disabled={generating}
                  data-testid="prompt-input"
                />
                <p className="text-xs text-gray-400 font-body mt-2 text-right">
                  {prompt.length}/200
                </p>
              </div>

              {/* Style Preset */}
              <div>
                <label className="text-sm font-medium text-gray-700 font-body block mb-2">
                  Style
                </label>
                <Select value={stylePreset} onValueChange={setStylePreset} disabled={generating}>
                  <SelectTrigger className="w-full border-gray-200 rounded-xl focus:ring-violet-500 focus:border-violet-500" data-testid="style-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STYLE_PRESETS.map((style) => (
                      <SelectItem 
                        key={style.value} 
                        value={style.value}
                        data-testid={`style-option-${style.value}`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-body">{style.label}</span>
                          <span className="text-gray-400 text-xs">— {style.description}</span>
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
                className="w-full bg-violet-500 text-white px-6 py-4 rounded-xl font-body text-sm hover:bg-violet-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                data-testid="generate-btn"
              >
                {generating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Generate Poster
                  </>
                )}
              </button>

              {/* Secondary Actions */}
              {currentPoster && (
                <button
                  onClick={resetWorkspace}
                  className="w-full bg-white border border-gray-200 text-gray-700 px-6 py-3 rounded-xl font-body text-sm hover:bg-gray-50 transition-colors inline-flex items-center justify-center gap-2"
                  data-testid="new-poster-btn"
                >
                  <RefreshCw className="w-4 h-4" />
                  Create Another
                </button>
              )}

              <Link
                to="/library"
                className="w-full bg-white border border-gray-200 text-gray-700 px-6 py-3 rounded-xl font-body text-sm hover:bg-gray-50 transition-colors inline-flex items-center justify-center gap-2"
                data-testid="view-all-btn"
              >
                <FolderOpen className="w-4 h-4" />
                View All Posters
              </Link>
            </div>

            {/* Specs Info */}
            <div className="mt-12 pt-8 border-t border-gray-200">
              <p className="text-xs font-medium text-gray-500 font-body mb-4 uppercase tracking-wider">
                Output Specifications
              </p>
              <div className="grid grid-cols-2 gap-4 text-sm font-body">
                <div>
                  <p className="text-gray-400">Size</p>
                  <p className="text-gray-900">A2 (42×59.4 cm)</p>
                </div>
                <div>
                  <p className="text-gray-400">Resolution</p>
                  <p className="text-gray-900">300 DPI</p>
                </div>
                <div>
                  <p className="text-gray-400">Pixels</p>
                  <p className="text-gray-900">4961×7016 px</p>
                </div>
                <div>
                  <p className="text-gray-400">Formats</p>
                  <p className="text-gray-900">JPG + PDF</p>
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
