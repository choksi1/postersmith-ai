import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import axios from "axios";
import { toast } from "sonner";
import { 
  Loader2, 
  Users, 
  Image as ImageIcon,
  CheckCircle,
  XCircle,
  LogOut,
  Shield,
  Trash2
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const AdminPanel = () => {
  const { user, logout } = useAuth();
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingUser, setUpdatingUser] = useState(null);
  const [deletingUser, setDeletingUser] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [usersRes, statsRes] = await Promise.all([
        axios.get(`${API}/admin/users`),
        axios.get(`${API}/admin/stats`)
      ]);
      setUsers(usersRes.data);
      setStats(statsRes.data);
    } catch (error) {
      toast.error("Failed to load admin data");
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId, newRole) => {
    setUpdatingUser(userId);
    try {
      await axios.put(`${API}/admin/users/${userId}`, { role: newRole });
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
      toast.success("User role updated");
    } catch (error) {
      toast.error("Failed to update user");
    } finally {
      setUpdatingUser(null);
    }
  };

  const deleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user? This will also delete all their posters.")) {
      return;
    }
    
    setDeletingUser(userId);
    try {
      await axios.delete(`${API}/admin/users/${userId}`);
      setUsers(users.filter(u => u.id !== userId));
      toast.success("User deleted");
    } catch (error) {
      const message = error.response?.data?.detail || "Failed to delete user";
      toast.error(message);
    } finally {
      setDeletingUser(null);
    }
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
              to="/admin" 
              className="text-studio-text font-body text-sm font-medium"
              data-testid="admin-link"
            >
              Admin
            </Link>
            
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

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 md:px-12 py-12">
        <div className="mb-12">
          <h1 className="font-heading text-3xl text-studio-text mb-2">Admin Panel</h1>
          <p className="text-studio-muted font-body">
            Manage users and monitor platform activity
          </p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
            <div className="bg-white border border-studio-border p-6" data-testid="stat-users">
              <div className="flex items-center gap-3 mb-3">
                <Users className="w-5 h-5 text-studio-sage" />
                <p className="text-sm text-studio-muted font-body uppercase tracking-widest">Users</p>
              </div>
              <p className="text-3xl font-heading text-studio-text">{stats.total_users}</p>
            </div>
            
            <div className="bg-white border border-studio-border p-6" data-testid="stat-posters">
              <div className="flex items-center gap-3 mb-3">
                <ImageIcon className="w-5 h-5 text-studio-sage" />
                <p className="text-sm text-studio-muted font-body uppercase tracking-widest">Posters</p>
              </div>
              <p className="text-3xl font-heading text-studio-text">{stats.total_posters}</p>
            </div>
            
            <div className="bg-white border border-studio-border p-6" data-testid="stat-completed">
              <div className="flex items-center gap-3 mb-3">
                <CheckCircle className="w-5 h-5 text-studio-sage" />
                <p className="text-sm text-studio-muted font-body uppercase tracking-widest">Completed</p>
              </div>
              <p className="text-3xl font-heading text-studio-text">{stats.completed_posters}</p>
            </div>
            
            <div className="bg-white border border-studio-border p-6" data-testid="stat-failed">
              <div className="flex items-center gap-3 mb-3">
                <XCircle className="w-5 h-5 text-studio-error" />
                <p className="text-sm text-studio-muted font-body uppercase tracking-widest">Failed</p>
              </div>
              <p className="text-3xl font-heading text-studio-text">{stats.failed_posters}</p>
            </div>
          </div>
        )}

        {/* Users Table */}
        <div className="bg-white border border-studio-border">
          <div className="p-6 border-b border-studio-border">
            <h2 className="font-heading text-xl text-studio-text">Users</h2>
          </div>
          
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-body text-xs uppercase tracking-widest text-studio-muted">Name</TableHead>
                <TableHead className="font-body text-xs uppercase tracking-widest text-studio-muted">Email</TableHead>
                <TableHead className="font-body text-xs uppercase tracking-widest text-studio-muted">Role</TableHead>
                <TableHead className="font-body text-xs uppercase tracking-widest text-studio-muted">Joined</TableHead>
                <TableHead className="font-body text-xs uppercase tracking-widest text-studio-muted">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u.id} data-testid={`user-row-${u.id}`}>
                  <TableCell className="font-body text-studio-text">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-studio-subtle flex items-center justify-center text-studio-text text-sm font-body">
                        {u.name?.charAt(0).toUpperCase()}
                      </div>
                      {u.name}
                      {u.id === user?.id && (
                        <span className="text-xs text-studio-sage">(you)</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-body text-studio-muted">{u.email}</TableCell>
                  <TableCell>
                    {u.id === user?.id ? (
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-studio-sage" />
                        <span className="font-body text-studio-text capitalize">{u.role}</span>
                      </div>
                    ) : (
                      <Select
                        value={u.role}
                        onValueChange={(value) => updateUserRole(u.id, value)}
                        disabled={updatingUser === u.id}
                      >
                        <SelectTrigger className="w-32 border-studio-border rounded-none" data-testid={`role-select-${u.id}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="creator">Creator</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  </TableCell>
                  <TableCell className="font-body text-studio-muted">
                    {new Date(u.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {u.id !== user?.id && (
                      <button
                        onClick={() => deleteUser(u.id)}
                        disabled={deletingUser === u.id}
                        className="text-studio-error hover:text-red-700 transition-colors duration-300"
                        data-testid={`delete-user-${u.id}`}
                      >
                        {deletingUser === u.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </main>
    </div>
  );
};

export default AdminPanel;
