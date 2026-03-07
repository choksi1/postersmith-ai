import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import axios from "axios";
import { toast } from "sonner";
import { 
  Loader2, 
  Download, 
  Trash2, 
  Plus,
  Image as ImageIcon,
  LogOut,
  FileText,
  Sparkles
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [posters, setPosters] = useState([]);
  const [listings, setListings] = useState({});
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [generatingListingId, setGeneratingListingId] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [postersRes, listingsRes] = await Promise.all([
        axios.get(`${API}/posters`),
        axios.get(`${API}/listings`)
      ]);
      setPosters(postersRes.data);
      
      // Create a map of poster_id -> listing
      const listingsMap = {};
      listingsRes.data.forEach(l => {
        listingsMap[l.poster_id] = l;
      });
      setListings(listingsMap);
    } catch (error) {
      toast.error("Failed to load posters");
    } finally {
      setLoading(false);
    }
  };

  const generateListing = async (posterId, e) => {
    e.stopPropagation();
    setGeneratingListingId(posterId);
    try {
      const response = await axios.post(`${API}/listings/generate`, {
        poster_id: posterId
      });
      setListings(prev => ({ ...prev, [posterId]: response.data }));
      toast.success("Listing generated! View in Manage Listings.");
    } catch (error) {
      const message = error.response?.data?.detail || "Failed to generate listing";
      toast.error(message);
    } finally {
      setGeneratingListingId(null);
    }
  };

  const deletePoster = async (posterId) => {
    setDeletingId(posterId);
    try {
      await axios.delete(`${API}/posters/${posterId}`);
      setPosters(posters.filter(p => p.id !== posterId));
      toast.success("Poster deleted");
    } catch (error) {
      toast.error("Failed to delete poster");
    } finally {
      setDeletingId(null);
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

  return (
    <div className="min-h-screen bg-studio-bg">
      {/* Header */}
      <header className="bg-white border-b border-studio-border">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-4 flex items-center justify-between">
          <Link to="/workspace" className="font-heading text-xl text-studio-text" data-testid="logo">
            PosterSmith AI
          </Link>
          
          <nav className="flex items-center gap-6">
            <Link 
              to="/workspace" 
              className="text-studio-muted hover:text-studio-text transition-colors duration-300 font-body text-sm"
              data-testid="workspace-link"
            >
              Workspace
            </Link>
            <Link 
              to="/dashboard" 
              className="text-studio-text font-body text-sm font-medium"
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

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 md:px-12 py-12">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="font-heading text-3xl text-studio-text mb-2">My Posters</h1>
            <p className="text-studio-muted font-body">
              {posters.length} poster{posters.length !== 1 ? 's' : ''} created
            </p>
          </div>
          <Link 
            to="/workspace" 
            className="studio-button-primary inline-flex items-center gap-2"
            data-testid="create-new-btn"
          >
            <Plus className="w-4 h-4" />
            Create New
          </Link>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-8 h-8 animate-spin text-studio-sage" />
          </div>
        ) : posters.length === 0 ? (
          <div className="text-center py-24 bg-white border border-studio-border">
            <ImageIcon className="w-16 h-16 text-studio-light mx-auto mb-6" />
            <h2 className="font-heading text-2xl text-studio-text mb-3">No posters yet</h2>
            <p className="text-studio-muted font-body mb-8">
              Create your first print-ready poster
            </p>
            <Link 
              to="/workspace" 
              className="studio-button-primary inline-flex items-center gap-2"
              data-testid="empty-create-btn"
            >
              <Plus className="w-4 h-4" />
              Create Poster
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {posters.map((poster) => (
              <div 
                key={poster.id} 
                className="bg-white border border-studio-border group"
                data-testid={`poster-card-${poster.id}`}
              >
                <div className="aspect-[1/1.414] bg-studio-subtle relative overflow-hidden">
                  {poster.status === "completed" && poster.preview_url ? (
                    <img 
                      src={`${process.env.REACT_APP_BACKEND_URL}${poster.preview_url}`}
                      alt={poster.prompt}
                      className="w-full h-full object-cover"
                    />
                  ) : poster.status === "generating" ? (
                    <div className="w-full h-full flex items-center justify-center">
                      <Loader2 className="w-8 h-8 animate-spin text-studio-sage" />
                    </div>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <p className="text-studio-muted font-body text-sm">Failed</p>
                    </div>
                  )}
                  
                  {/* Overlay with actions */}
                  {poster.status === "completed" && (
                    <div className="absolute inset-0 bg-studio-text/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-4">
                      <button
                        onClick={() => downloadFile(poster.jpg_url, `poster-${poster.id}.jpg`)}
                        className="w-10 h-10 bg-white text-studio-text flex items-center justify-center hover:bg-studio-sage hover:text-white transition-colors duration-300"
                        title="Download JPG"
                        data-testid={`download-jpg-${poster.id}`}
                      >
                        <Download className="w-5 h-5" />
                      </button>
                      {poster.pdf_url && (
                        <button
                          onClick={() => downloadFile(poster.pdf_url, `poster-${poster.id}.pdf`)}
                          className="w-10 h-10 bg-white text-studio-text flex items-center justify-center hover:bg-studio-sage hover:text-white transition-colors duration-300"
                          title="Download PDF"
                          data-testid={`download-pdf-${poster.id}`}
                        >
                          PDF
                        </button>
                      )}
                      <button
                        onClick={() => deletePoster(poster.id)}
                        disabled={deletingId === poster.id}
                        className="w-10 h-10 bg-white text-studio-error flex items-center justify-center hover:bg-studio-error hover:text-white transition-colors duration-300"
                        title="Delete"
                        data-testid={`delete-poster-${poster.id}`}
                      >
                        {deletingId === poster.id ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <Trash2 className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  )}
                </div>
                
                <div className="p-4">
                  <p className="font-body text-sm text-studio-text truncate mb-1">
                    {poster.prompt}
                  </p>
                  <div className="flex items-center justify-between">
                    <p className="font-body text-xs text-studio-muted capitalize">
                      {poster.style_preset}
                    </p>
                    {poster.status === "completed" && (
                      listings[poster.id] ? (
                        <Link
                          to="/listings"
                          className="text-xs text-studio-sage hover:text-studio-sage-dark font-body inline-flex items-center gap-1"
                          data-testid={`view-listing-${poster.id}`}
                        >
                          <FileText className="w-3 h-3" />
                          View Listing
                        </Link>
                      ) : (
                        <button
                          onClick={(e) => generateListing(poster.id, e)}
                          disabled={generatingListingId === poster.id}
                          className="text-xs text-studio-sage hover:text-studio-sage-dark font-body inline-flex items-center gap-1"
                          data-testid={`generate-listing-btn-${poster.id}`}
                        >
                          {generatingListingId === poster.id ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <Sparkles className="w-3 h-3" />
                          )}
                          {generatingListingId === poster.id ? "Generating..." : "Generate Listing"}
                        </button>
                      )
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
