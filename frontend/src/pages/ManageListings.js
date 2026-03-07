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
  Type,
  Tag,
  AlignLeft,
  Store,
  X,
  ChevronDown
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

// Etsy categories for wall art
const PRIMARY_CATEGORIES = [
  "Art & Collectibles",
  "Home & Living",
  "Craft Supplies & Tools"
];

const SECONDARY_CATEGORIES = [
  "Prints",
  "Digital Prints",
  "Wall Decor",
  "Posters",
  "Digital Downloads"
];

const ManageListings = () => {
  const { user, logout } = useAuth();
  const [posters, setPosters] = useState([]);
  const [listings, setListings] = useState({});
  const [loading, setLoading] = useState(true);
  const [generatingId, setGeneratingId] = useState(null);
  const [selectedPoster, setSelectedPoster] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({});
  const [copiedField, setCopiedField] = useState(null);
  const [categories, setCategories] = useState({
    primary: "Art & Collectibles",
    secondary: "Prints"
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    // Auto-select first completed poster
    if (posters.length > 0 && !selectedPoster) {
      const completedPoster = posters.find(p => p.status === "completed");
      if (completedPoster) {
        setSelectedPoster(completedPoster);
      }
    }
  }, [posters, selectedPoster]);

  const fetchData = async () => {
    try {
      const [postersRes, listingsRes] = await Promise.all([
        axios.get(`${API}/posters`),
        axios.get(`${API}/listings`)
      ]);
      
      setPosters(postersRes.data.filter(p => p.status === "completed"));
      
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

  const startEditing = () => {
    const listing = listings[selectedPoster?.id];
    if (listing) {
      setEditData({
        title: listing.title,
        description: listing.description,
        tags: [...listing.tags]
      });
      setEditMode(true);
    }
  };

  const cancelEditing = () => {
    setEditMode(false);
    setEditData({});
  };

  const saveListing = async () => {
    if (!selectedPoster) return;
    
    try {
      const response = await axios.put(`${API}/listings/${selectedPoster.id}`, {
        title: editData.title,
        description: editData.description,
        tags: editData.tags
      });
      setListings(prev => ({ ...prev, [selectedPoster.id]: response.data }));
      setEditMode(false);
      toast.success("Listing updated!");
    } catch (error) {
      toast.error("Failed to update listing");
    }
  };

  const removeTag = (index) => {
    setEditData(prev => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index)
    }));
  };

  const addTag = (e) => {
    if (e.key === 'Enter' && e.target.value.trim()) {
      e.preventDefault();
      if (editData.tags.length < 13) {
        setEditData(prev => ({
          ...prev,
          tags: [...prev.tags, e.target.value.trim().slice(0, 20)]
        }));
        e.target.value = '';
      }
    }
  };

  const copyToClipboard = async (text, field) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
      toast.success("Copied to clipboard!");
    } catch (err) {
      toast.error("Failed to copy");
    }
  };

  const currentListing = selectedPoster ? listings[selectedPoster.id] : null;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-4 flex items-center justify-between">
          <Link to="/workspace" className="font-heading text-xl text-gray-900" data-testid="logo">
            PosterSmith AI
          </Link>
          
          <nav className="flex items-center gap-6">
            <Link 
              to="/workspace" 
              className="text-gray-500 hover:text-gray-900 transition-colors duration-300 font-body text-sm"
              data-testid="workspace-link"
            >
              Workspace
            </Link>
            <Link 
              to="/dashboard" 
              className="text-gray-500 hover:text-gray-900 transition-colors duration-300 font-body text-sm"
              data-testid="dashboard-link"
            >
              My Posters
            </Link>
            <Link 
              to="/listings" 
              className="text-gray-900 font-body text-sm font-medium"
              data-testid="listings-link"
            >
              Manage Listings
            </Link>
            {user?.role === "admin" && (
              <Link 
                to="/admin" 
                className="text-gray-500 hover:text-gray-900 transition-colors duration-300 font-body text-sm"
                data-testid="admin-link"
              >
                Admin
              </Link>
            )}
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button 
                  className="w-10 h-10 bg-violet-500 text-white rounded-full flex items-center justify-center font-body text-sm"
                  data-testid="user-menu-btn"
                >
                  {user?.name?.charAt(0).toUpperCase()}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <div className="px-3 py-2">
                  <p className="font-body text-sm font-medium text-gray-900">{user?.name}</p>
                  <p className="font-body text-xs text-gray-500">{user?.email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="text-red-500 cursor-pointer">
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 md:px-12 py-8">
        {posters.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-2xl border border-gray-200">
            <Store className="w-16 h-16 text-gray-300 mx-auto mb-6" />
            <h2 className="font-heading text-2xl text-gray-900 mb-3">No completed posters</h2>
            <p className="text-gray-500 font-body mb-8">
              Create some posters first to generate listings
            </p>
            <Link 
              to="/workspace" 
              className="inline-flex items-center gap-2 bg-violet-500 text-white px-6 py-3 rounded-full font-body text-sm hover:bg-violet-600 transition-colors"
              data-testid="create-poster-btn"
            >
              <Sparkles className="w-4 h-4" />
              Create Poster
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Poster Selection */}
            <div className="space-y-6">
              {/* Poster Selector Card */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <h2 className="font-heading text-xl text-gray-900 mb-2">Select Poster</h2>
                <p className="text-gray-500 text-sm font-body mb-6">
                  Choose a poster to generate SEO details for your Etsy listing
                </p>

                {/* Poster Thumbnails */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                  {posters.map((poster) => (
                    <button
                      key={poster.id}
                      onClick={() => setSelectedPoster(poster)}
                      className={`aspect-[1/1.414] rounded-lg overflow-hidden border-2 transition-all ${
                        selectedPoster?.id === poster.id 
                          ? 'border-violet-500 ring-2 ring-violet-200' 
                          : 'border-gray-200 hover:border-violet-300'
                      }`}
                      data-testid={`select-poster-${poster.id}`}
                    >
                      <img 
                        src={`${process.env.REACT_APP_BACKEND_URL}${poster.preview_url}`}
                        alt={poster.prompt}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>

                {/* Selected Poster Preview */}
                {selectedPoster && (
                  <div className="flex flex-col items-center">
                    <div className="w-full max-w-xs aspect-[1/1.414] rounded-xl overflow-hidden shadow-lg mb-6">
                      <img 
                        src={`${process.env.REACT_APP_BACKEND_URL}${selectedPoster.preview_url}`}
                        alt={selectedPoster.prompt}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    <p className="text-sm text-gray-500 font-body text-center mb-6 max-w-xs">
                      {selectedPoster.prompt}
                    </p>

                    {!currentListing ? (
                      <button
                        onClick={() => generateListing(selectedPoster.id)}
                        disabled={generatingId === selectedPoster.id}
                        className="w-full max-w-xs bg-violet-500 text-white px-6 py-4 rounded-xl font-body text-sm hover:bg-violet-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                        data-testid="generate-listing-btn"
                      >
                        {generatingId === selectedPoster.id ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-5 h-5" />
                            Generate & Save
                          </>
                        )}
                      </button>
                    ) : (
                      <div className="flex gap-3 w-full max-w-xs">
                        {editMode ? (
                          <>
                            <button
                              onClick={saveListing}
                              className="flex-1 bg-violet-500 text-white px-4 py-3 rounded-xl font-body text-sm hover:bg-violet-600 transition-colors"
                              data-testid="save-listing-btn"
                            >
                              Save Changes
                            </button>
                            <button
                              onClick={cancelEditing}
                              className="px-4 py-3 rounded-xl font-body text-sm border border-gray-200 hover:bg-gray-50 transition-colors"
                              data-testid="cancel-edit-btn"
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={startEditing}
                              className="flex-1 bg-white border border-gray-200 text-gray-700 px-4 py-3 rounded-xl font-body text-sm hover:bg-gray-50 transition-colors"
                              data-testid="edit-listing-btn"
                            >
                              Edit Listing
                            </button>
                            <button
                              onClick={() => generateListing(selectedPoster.id)}
                              disabled={generatingId === selectedPoster.id}
                              className="flex-1 bg-violet-500 text-white px-4 py-3 rounded-xl font-body text-sm hover:bg-violet-600 transition-colors flex items-center justify-center gap-2"
                              data-testid="regenerate-btn"
                            >
                              {generatingId === selectedPoster.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Sparkles className="w-4 h-4" />
                              )}
                              Regenerate
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Listing Details */}
            <div className="space-y-4">
              {currentListing ? (
                <>
                  {/* Listing Title Card */}
                  <div className="bg-white rounded-2xl border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Type className="w-5 h-5 text-violet-500" />
                        <h3 className="font-heading text-lg text-gray-900">Listing Title</h3>
                      </div>
                      <span className="text-sm text-gray-400 font-body">
                        {editMode ? editData.title?.length : currentListing.title?.length}/140 chars
                      </span>
                    </div>
                    
                    {editMode ? (
                      <Input
                        value={editData.title}
                        onChange={(e) => setEditData(prev => ({ ...prev, title: e.target.value }))}
                        className="rounded-xl border-gray-200"
                        maxLength={140}
                        data-testid="edit-title-input"
                      />
                    ) : (
                      <div className="flex items-start justify-between gap-4">
                        <p className="font-body text-gray-700 leading-relaxed" data-testid="listing-title">
                          {currentListing.title}
                        </p>
                        <button
                          onClick={() => copyToClipboard(currentListing.title, 'title')}
                          className="text-gray-400 hover:text-violet-500 transition-colors flex-shrink-0"
                          data-testid="copy-title-btn"
                        >
                          {copiedField === 'title' ? (
                            <Check className="w-5 h-5 text-green-500" />
                          ) : (
                            <Copy className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Categories Card */}
                  <div className="bg-white rounded-2xl border border-gray-200 p-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <Store className="w-5 h-5 text-violet-500" />
                          <h3 className="font-body text-sm font-medium text-gray-900">Primary Category</h3>
                        </div>
                        <Select value={categories.primary} onValueChange={(v) => setCategories(prev => ({ ...prev, primary: v }))}>
                          <SelectTrigger className="rounded-xl border-gray-200" data-testid="primary-category-select">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {PRIMARY_CATEGORIES.map(cat => (
                              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <Store className="w-5 h-5 text-violet-500" />
                          <h3 className="font-body text-sm font-medium text-gray-900">Secondary Category</h3>
                        </div>
                        <Select value={categories.secondary} onValueChange={(v) => setCategories(prev => ({ ...prev, secondary: v }))}>
                          <SelectTrigger className="rounded-xl border-gray-200" data-testid="secondary-category-select">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {SECONDARY_CATEGORIES.map(cat => (
                              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* Etsy Tags Card */}
                  <div className="bg-white rounded-2xl border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Tag className="w-5 h-5 text-violet-500" />
                        <h3 className="font-heading text-lg text-gray-900">Etsy Tags</h3>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-400 font-body">
                          {editMode ? editData.tags?.length : currentListing.tags?.length}/13 tags
                        </span>
                        {!editMode && (
                          <button
                            onClick={() => copyToClipboard(currentListing.tags?.join(", "), 'tags')}
                            className="text-gray-400 hover:text-violet-500 transition-colors"
                            data-testid="copy-tags-btn"
                          >
                            {copiedField === 'tags' ? (
                              <Check className="w-5 h-5 text-green-500" />
                            ) : (
                              <Copy className="w-5 h-5" />
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2" data-testid="listing-tags">
                      {(editMode ? editData.tags : currentListing.tags)?.map((tag, index) => (
                        <span 
                          key={index}
                          className="inline-flex items-center gap-1 bg-violet-50 text-violet-700 px-3 py-1.5 rounded-full text-sm font-body"
                        >
                          {tag}
                          {editMode && (
                            <button
                              onClick={() => removeTag(index)}
                              className="hover:text-violet-900 transition-colors"
                              data-testid={`remove-tag-${index}`}
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </span>
                      ))}
                    </div>
                    
                    {editMode && editData.tags?.length < 13 && (
                      <Input
                        placeholder="Type a tag and press Enter..."
                        onKeyDown={addTag}
                        className="mt-3 rounded-xl border-gray-200"
                        data-testid="add-tag-input"
                      />
                    )}
                  </div>

                  {/* Description Card */}
                  <div className="bg-white rounded-2xl border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <AlignLeft className="w-5 h-5 text-violet-500" />
                        <h3 className="font-heading text-lg text-gray-900">Description</h3>
                      </div>
                      {!editMode && (
                        <button
                          onClick={() => copyToClipboard(currentListing.description, 'description')}
                          className="text-gray-400 hover:text-violet-500 transition-colors"
                          data-testid="copy-description-btn"
                        >
                          {copiedField === 'description' ? (
                            <Check className="w-5 h-5 text-green-500" />
                          ) : (
                            <Copy className="w-5 h-5" />
                          )}
                        </button>
                      )}
                    </div>
                    
                    {editMode ? (
                      <Textarea
                        value={editData.description}
                        onChange={(e) => setEditData(prev => ({ ...prev, description: e.target.value }))}
                        className="rounded-xl border-gray-200 min-h-[300px]"
                        data-testid="edit-description-input"
                      />
                    ) : (
                      <p className="font-body text-gray-600 text-sm whitespace-pre-wrap leading-relaxed" data-testid="listing-description">
                        {currentListing.description}
                      </p>
                    )}
                  </div>
                </>
              ) : selectedPoster ? (
                <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
                  <Sparkles className="w-16 h-16 text-gray-200 mx-auto mb-6" />
                  <h3 className="font-heading text-xl text-gray-900 mb-2">No listing yet</h3>
                  <p className="text-gray-500 font-body mb-6">
                    Click "Generate & Save" to create an Etsy-optimized listing for this poster
                  </p>
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
                  <Store className="w-16 h-16 text-gray-200 mx-auto mb-6" />
                  <h3 className="font-heading text-xl text-gray-900 mb-2">Select a poster</h3>
                  <p className="text-gray-500 font-body">
                    Choose a poster from the left to view or generate its listing
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ManageListings;
