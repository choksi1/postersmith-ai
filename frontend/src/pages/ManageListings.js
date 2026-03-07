import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import axios from "axios";
import { toast } from "sonner";
import { 
  Loader2, 
  Sparkles,
  LogOut,
  Copy,
  Check,
  Edit2,
  Save,
  X,
  Tag,
  FileText,
  ArrowLeft
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const ManageListings = () => {
  const { user, logout } = useAuth();
  const [posters, setPosters] = useState([]);
  const [listings, setListings] = useState({});
  const [loading, setLoading] = useState(true);
  const [generatingId, setGeneratingId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const [copiedField, setCopiedField] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [postersRes, listingsRes] = await Promise.all([
        axios.get(`${API}/posters`),
        axios.get(`${API}/listings`)
      ]);
      
      setPosters(postersRes.data.filter(p => p.status === "completed"));
      
      // Create a map of poster_id -> listing
      const listingsMap = {};
      listingsRes.data.forEach(l => {
        listingsMap[l.poster_id] = l;
      });
      setListings(listingsMap);
    } catch (error) {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const generateListing = async (posterId) => {
    setGeneratingId(posterId);
    try {
      const response = await axios.post(`${API}/listings/generate`, {
        poster_id: posterId
      });
      setListings(prev => ({ ...prev, [posterId]: response.data }));
      toast.success("Listing generated successfully!");
    } catch (error) {
      const message = error.response?.data?.detail || "Failed to generate listing";
      toast.error(message);
    } finally {
      setGeneratingId(null);
    }
  };

  const startEditing = (posterId) => {
    const listing = listings[posterId];
    setEditData({
      title: listing.title,
      description: listing.description,
      tags: listing.tags.join(", ")
    });
    setEditingId(posterId);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditData({});
  };

  const saveListing = async (posterId) => {
    try {
      const tags = editData.tags.split(",").map(t => t.trim()).filter(t => t);
      const response = await axios.put(`${API}/listings/${posterId}`, {
        title: editData.title,
        description: editData.description,
        tags: tags
      });
      setListings(prev => ({ ...prev, [posterId]: response.data }));
      setEditingId(null);
      toast.success("Listing updated!");
    } catch (error) {
      toast.error("Failed to update listing");
    }
  };

  const copyToClipboard = async (text, field) => {
    await navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
    toast.success("Copied to clipboard!");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-studio-bg flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-studio-sage" />
      </div>
    );
  }

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
              className="text-studio-muted hover:text-studio-text transition-colors duration-300 font-body text-sm"
              data-testid="dashboard-link"
            >
              My Posters
            </Link>
            <Link 
              to="/listings" 
              className="text-studio-text font-body text-sm font-medium"
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
        <div className="mb-12">
          <Link 
            to="/dashboard" 
            className="inline-flex items-center gap-2 text-studio-muted hover:text-studio-text transition-colors duration-300 mb-6 font-body text-sm"
            data-testid="back-to-dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <h1 className="font-heading text-3xl text-studio-text mb-2">Manage Listings</h1>
          <p className="text-studio-muted font-body">
            Generate AI-powered Etsy titles, descriptions, and tags for your posters
          </p>
        </div>

        {posters.length === 0 ? (
          <div className="text-center py-24 bg-white border border-studio-border">
            <FileText className="w-16 h-16 text-studio-light mx-auto mb-6" />
            <h2 className="font-heading text-2xl text-studio-text mb-3">No completed posters</h2>
            <p className="text-studio-muted font-body mb-8">
              Create some posters first to generate listings
            </p>
            <Link 
              to="/workspace" 
              className="studio-button-primary inline-flex items-center gap-2"
              data-testid="create-poster-btn"
            >
              <Sparkles className="w-4 h-4" />
              Create Poster
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {posters.map((poster) => {
              const listing = listings[poster.id];
              const isEditing = editingId === poster.id;
              const isGenerating = generatingId === poster.id;

              return (
                <div 
                  key={poster.id} 
                  className="bg-white border border-studio-border"
                  data-testid={`listing-card-${poster.id}`}
                >
                  <div className="flex flex-col lg:flex-row">
                    {/* Poster Preview */}
                    <div className="lg:w-48 flex-shrink-0 p-6 border-b lg:border-b-0 lg:border-r border-studio-border">
                      <div className="aspect-[1/1.414] bg-studio-subtle overflow-hidden">
                        <img 
                          src={`${process.env.REACT_APP_BACKEND_URL}${poster.preview_url}`}
                          alt={poster.prompt}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <p className="text-xs text-studio-muted mt-3 truncate font-body">
                        {poster.prompt}
                      </p>
                    </div>

                    {/* Listing Content */}
                    <div className="flex-1 p-6">
                      {!listing ? (
                        <div className="h-full flex items-center justify-center py-12">
                          <div className="text-center">
                            <Sparkles className="w-12 h-12 text-studio-border mx-auto mb-4" />
                            <p className="text-studio-muted font-body mb-6">
                              Generate an Etsy-optimized listing for this poster
                            </p>
                            <button
                              onClick={() => generateListing(poster.id)}
                              disabled={isGenerating}
                              className="studio-button-primary inline-flex items-center gap-2"
                              data-testid={`generate-listing-${poster.id}`}
                            >
                              {isGenerating ? (
                                <>
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                  Generating...
                                </>
                              ) : (
                                <>
                                  <Sparkles className="w-4 h-4" />
                                  Generate Listing
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      ) : isEditing ? (
                        /* Edit Mode */
                        <div className="space-y-6">
                          <div>
                            <label className="text-xs uppercase tracking-widest text-studio-muted font-body block mb-2">
                              Title
                            </label>
                            <Input
                              value={editData.title}
                              onChange={(e) => setEditData(prev => ({ ...prev, title: e.target.value }))}
                              className="rounded-none border-studio-border"
                              maxLength={140}
                              data-testid="edit-title-input"
                            />
                            <p className="text-xs text-studio-light mt-1 text-right">{editData.title?.length || 0}/140</p>
                          </div>
                          
                          <div>
                            <label className="text-xs uppercase tracking-widest text-studio-muted font-body block mb-2">
                              Description
                            </label>
                            <Textarea
                              value={editData.description}
                              onChange={(e) => setEditData(prev => ({ ...prev, description: e.target.value }))}
                              className="rounded-none border-studio-border min-h-[200px]"
                              data-testid="edit-description-input"
                            />
                          </div>
                          
                          <div>
                            <label className="text-xs uppercase tracking-widest text-studio-muted font-body block mb-2">
                              Tags (comma separated, max 13)
                            </label>
                            <Input
                              value={editData.tags}
                              onChange={(e) => setEditData(prev => ({ ...prev, tags: e.target.value }))}
                              className="rounded-none border-studio-border"
                              placeholder="wall art, digital download, printable..."
                              data-testid="edit-tags-input"
                            />
                          </div>
                          
                          <div className="flex items-center gap-4">
                            <button
                              onClick={() => saveListing(poster.id)}
                              className="studio-button-primary inline-flex items-center gap-2"
                              data-testid="save-listing-btn"
                            >
                              <Save className="w-4 h-4" />
                              Save Changes
                            </button>
                            <button
                              onClick={cancelEditing}
                              className="studio-button-secondary inline-flex items-center gap-2"
                              data-testid="cancel-edit-btn"
                            >
                              <X className="w-4 h-4" />
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        /* View Mode */
                        <div className="space-y-6">
                          {/* Title */}
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <label className="text-xs uppercase tracking-widest text-studio-muted font-body">
                                Title
                              </label>
                              <button
                                onClick={() => copyToClipboard(listing.title, `title-${poster.id}`)}
                                className="text-studio-muted hover:text-studio-text transition-colors duration-300"
                                data-testid={`copy-title-${poster.id}`}
                              >
                                {copiedField === `title-${poster.id}` ? (
                                  <Check className="w-4 h-4 text-studio-sage" />
                                ) : (
                                  <Copy className="w-4 h-4" />
                                )}
                              </button>
                            </div>
                            <p className="font-body text-studio-text" data-testid={`listing-title-${poster.id}`}>
                              {listing.title}
                            </p>
                          </div>
                          
                          {/* Description */}
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <label className="text-xs uppercase tracking-widest text-studio-muted font-body">
                                Description
                              </label>
                              <button
                                onClick={() => copyToClipboard(listing.description, `desc-${poster.id}`)}
                                className="text-studio-muted hover:text-studio-text transition-colors duration-300"
                                data-testid={`copy-desc-${poster.id}`}
                              >
                                {copiedField === `desc-${poster.id}` ? (
                                  <Check className="w-4 h-4 text-studio-sage" />
                                ) : (
                                  <Copy className="w-4 h-4" />
                                )}
                              </button>
                            </div>
                            <p className="font-body text-studio-muted text-sm whitespace-pre-wrap leading-relaxed" data-testid={`listing-desc-${poster.id}`}>
                              {listing.description}
                            </p>
                          </div>
                          
                          {/* Tags */}
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <label className="text-xs uppercase tracking-widest text-studio-muted font-body">
                                Tags ({listing.tags?.length || 0}/13)
                              </label>
                              <button
                                onClick={() => copyToClipboard(listing.tags?.join(", ") || "", `tags-${poster.id}`)}
                                className="text-studio-muted hover:text-studio-text transition-colors duration-300"
                                data-testid={`copy-tags-${poster.id}`}
                              >
                                {copiedField === `tags-${poster.id}` ? (
                                  <Check className="w-4 h-4 text-studio-sage" />
                                ) : (
                                  <Copy className="w-4 h-4" />
                                )}
                              </button>
                            </div>
                            <div className="flex flex-wrap gap-2" data-testid={`listing-tags-${poster.id}`}>
                              {listing.tags?.map((tag, index) => (
                                <Badge 
                                  key={index} 
                                  variant="secondary" 
                                  className="bg-studio-subtle text-studio-text border-0 rounded-none font-body"
                                >
                                  <Tag className="w-3 h-3 mr-1" />
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          
                          {/* Actions */}
                          <div className="pt-4 border-t border-studio-border flex items-center gap-4">
                            <button
                              onClick={() => startEditing(poster.id)}
                              className="studio-button-secondary inline-flex items-center gap-2"
                              data-testid={`edit-listing-${poster.id}`}
                            >
                              <Edit2 className="w-4 h-4" />
                              Edit Listing
                            </button>
                            <button
                              onClick={() => generateListing(poster.id)}
                              disabled={isGenerating}
                              className="text-studio-muted hover:text-studio-text transition-colors duration-300 font-body text-sm inline-flex items-center gap-2"
                              data-testid={`regenerate-listing-${poster.id}`}
                            >
                              {isGenerating ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Sparkles className="w-4 h-4" />
                              )}
                              Regenerate
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default ManageListings;
