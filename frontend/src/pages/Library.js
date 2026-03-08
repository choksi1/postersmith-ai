import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import axios from "axios";
import { toast } from "sonner";
import { 
  Loader2, 
  Download, 
  Trash2, 
  Plus,
  Image as ImageIcon,
  FileText,
  Sparkles,
  Grid,
  List
} from "lucide-react";
import { LoggedInNav, Footer } from "@/components/Navigation";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const Library = () => {
  const { user } = useAuth();
  const [posters, setPosters] = useState([]);
  const [listings, setListings] = useState({});
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [generatingListingId, setGeneratingListingId] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // grid or list

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
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <LoggedInNav />

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-6 md:px-12 py-8 w-full">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-heading text-3xl text-gray-900 mb-2">My Library</h1>
            <p className="text-gray-500 font-body">
              {posters.length} poster{posters.length !== 1 ? 's' : ''} in your collection
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center bg-white border border-gray-200 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${viewMode === 'grid' ? 'bg-gray-100' : ''}`}
                data-testid="grid-view-btn"
              >
                <Grid className="w-4 h-4 text-gray-600" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${viewMode === 'list' ? 'bg-gray-100' : ''}`}
                data-testid="list-view-btn"
              >
                <List className="w-4 h-4 text-gray-600" />
              </button>
            </div>
            <Link 
              to="/workspace" 
              className="bg-violet-500 text-white px-5 py-2.5 rounded-full font-body text-sm hover:bg-violet-600 transition-colors inline-flex items-center gap-2"
              data-testid="create-new-btn"
            >
              <Plus className="w-4 h-4" />
              Create New
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
          </div>
        ) : posters.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-2xl border border-gray-200">
            <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-6" />
            <h2 className="font-heading text-2xl text-gray-900 mb-3">No posters yet</h2>
            <p className="text-gray-500 font-body mb-8">
              Create your first print-ready poster
            </p>
            <Link 
              to="/workspace" 
              className="bg-violet-500 text-white px-6 py-3 rounded-full font-body text-sm hover:bg-violet-600 transition-colors inline-flex items-center gap-2"
              data-testid="empty-create-btn"
            >
              <Plus className="w-4 h-4" />
              Create Poster
            </Link>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {posters.map((poster) => (
              <div 
                key={poster.id} 
                className="bg-white rounded-xl border border-gray-200 overflow-hidden group hover:shadow-lg transition-shadow"
                data-testid={`poster-card-${poster.id}`}
              >
                <div className="aspect-[1/1.414] bg-gray-100 relative overflow-hidden">
                  {poster.status === "completed" && poster.preview_url ? (
                    <img 
                      src={`${process.env.REACT_APP_BACKEND_URL}${poster.preview_url}`}
                      alt={poster.prompt}
                      className="w-full h-full object-cover"
                    />
                  ) : poster.status === "generating" ? (
                    <div className="w-full h-full flex items-center justify-center">
                      <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
                    </div>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <p className="text-gray-400 font-body text-sm">Failed</p>
                    </div>
                  )}
                  
                  {/* Overlay with actions */}
                  {poster.status === "completed" && (
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
                      <button
                        onClick={() => downloadFile(poster.jpg_url, `poster-${poster.id}.jpg`)}
                        className="w-10 h-10 bg-white text-gray-700 rounded-full flex items-center justify-center hover:bg-violet-500 hover:text-white transition-colors duration-300"
                        title="Download JPG"
                        data-testid={`download-jpg-${poster.id}`}
                      >
                        <Download className="w-5 h-5" />
                      </button>
                      {poster.pdf_url && (
                        <button
                          onClick={() => downloadFile(poster.pdf_url, `poster-${poster.id}.pdf`)}
                          className="w-10 h-10 bg-white text-gray-700 rounded-full flex items-center justify-center hover:bg-violet-500 hover:text-white transition-colors duration-300 text-xs font-bold"
                          title="Download PDF"
                          data-testid={`download-pdf-${poster.id}`}
                        >
                          PDF
                        </button>
                      )}
                      <button
                        onClick={() => deletePoster(poster.id)}
                        disabled={deletingId === poster.id}
                        className="w-10 h-10 bg-white text-red-500 rounded-full flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors duration-300"
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
                  <p className="font-body text-sm text-gray-900 truncate mb-2">
                    {poster.prompt}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400 font-body capitalize bg-gray-100 px-2 py-1 rounded">
                      {poster.style_preset}
                    </span>
                    {poster.status === "completed" && (
                      listings[poster.id] ? (
                        <Link
                          to="/listings"
                          className="text-xs text-violet-600 hover:text-violet-700 font-body inline-flex items-center gap-1"
                          data-testid={`view-listing-${poster.id}`}
                        >
                          <FileText className="w-3 h-3" />
                          Listing
                        </Link>
                      ) : (
                        <button
                          onClick={(e) => generateListing(poster.id, e)}
                          disabled={generatingListingId === poster.id}
                          className="text-xs text-violet-600 hover:text-violet-700 font-body inline-flex items-center gap-1"
                          data-testid={`generate-listing-btn-${poster.id}`}
                        >
                          {generatingListingId === poster.id ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <Sparkles className="w-3 h-3" />
                          )}
                          {generatingListingId === poster.id ? "..." : "Generate"}
                        </button>
                      )
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* List View */
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-4 text-xs font-body font-medium text-gray-500 uppercase tracking-wider">Poster</th>
                  <th className="text-left px-6 py-4 text-xs font-body font-medium text-gray-500 uppercase tracking-wider">Style</th>
                  <th className="text-left px-6 py-4 text-xs font-body font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="text-left px-6 py-4 text-xs font-body font-medium text-gray-500 uppercase tracking-wider">Listing</th>
                  <th className="text-right px-6 py-4 text-xs font-body font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {posters.map((poster) => (
                  <tr key={poster.id} className="hover:bg-gray-50" data-testid={`poster-row-${poster.id}`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-16 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                          {poster.preview_url && (
                            <img 
                              src={`${process.env.REACT_APP_BACKEND_URL}${poster.preview_url}`}
                              alt={poster.prompt}
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                        <p className="font-body text-sm text-gray-900 truncate max-w-xs">
                          {poster.prompt}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs text-gray-600 font-body capitalize bg-gray-100 px-2 py-1 rounded">
                        {poster.style_preset}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-body px-2 py-1 rounded ${
                        poster.status === 'completed' ? 'bg-green-100 text-green-700' :
                        poster.status === 'generating' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {poster.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {poster.status === "completed" && (
                        listings[poster.id] ? (
                          <Link
                            to="/listings"
                            className="text-xs text-violet-600 hover:text-violet-700 font-body inline-flex items-center gap-1"
                          >
                            <FileText className="w-3 h-3" />
                            View
                          </Link>
                        ) : (
                          <button
                            onClick={(e) => generateListing(poster.id, e)}
                            disabled={generatingListingId === poster.id}
                            className="text-xs text-violet-600 hover:text-violet-700 font-body inline-flex items-center gap-1"
                          >
                            {generatingListingId === poster.id ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <Sparkles className="w-3 h-3" />
                            )}
                            Generate
                          </button>
                        )
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {poster.status === "completed" && (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => downloadFile(poster.jpg_url, `poster-${poster.id}.jpg`)}
                            className="p-2 text-gray-400 hover:text-violet-600 transition-colors"
                            title="Download JPG"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deletePoster(poster.id)}
                            disabled={deletingId === poster.id}
                            className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                            title="Delete"
                          >
                            {deletingId === poster.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Library;
