import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import axios from "axios";
import { toast } from "sonner";
import { 
  Loader2, 
  Users, 
  Image as ImageIcon,
  CheckCircle,
  XCircle,
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { LoggedInNav, Footer } from "@/components/Navigation";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const AdminPanel = () => {
  const { user } = useAuth();
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <LoggedInNav />

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-6 md:px-12 py-8 w-full">
        <div className="mb-8">
          <h1 className="font-heading text-3xl text-gray-900 mb-2">Admin Panel</h1>
          <p className="text-gray-500 font-body">
            Manage users and monitor platform activity
          </p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-xl border border-gray-200 p-6" data-testid="stat-users">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-violet-100 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-violet-600" />
                </div>
              </div>
              <p className="text-3xl font-heading text-gray-900 mb-1">{stats.total_users}</p>
              <p className="text-sm text-gray-500 font-body">Total Users</p>
            </div>
            
            <div className="bg-white rounded-xl border border-gray-200 p-6" data-testid="stat-posters">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <ImageIcon className="w-5 h-5 text-blue-600" />
                </div>
              </div>
              <p className="text-3xl font-heading text-gray-900 mb-1">{stats.total_posters}</p>
              <p className="text-sm text-gray-500 font-body">Total Posters</p>
            </div>
            
            <div className="bg-white rounded-xl border border-gray-200 p-6" data-testid="stat-completed">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
              </div>
              <p className="text-3xl font-heading text-gray-900 mb-1">{stats.completed_posters}</p>
              <p className="text-sm text-gray-500 font-body">Completed</p>
            </div>
            
            <div className="bg-white rounded-xl border border-gray-200 p-6" data-testid="stat-failed">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <XCircle className="w-5 h-5 text-red-600" />
                </div>
              </div>
              <p className="text-3xl font-heading text-gray-900 mb-1">{stats.failed_posters}</p>
              <p className="text-sm text-gray-500 font-body">Failed</p>
            </div>
          </div>
        )}

        {/* Users Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="font-heading text-xl text-gray-900">Users</h2>
          </div>
          
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-body text-xs uppercase tracking-wider text-gray-500">Name</TableHead>
                <TableHead className="font-body text-xs uppercase tracking-wider text-gray-500">Email</TableHead>
                <TableHead className="font-body text-xs uppercase tracking-wider text-gray-500">Role</TableHead>
                <TableHead className="font-body text-xs uppercase tracking-wider text-gray-500">Joined</TableHead>
                <TableHead className="font-body text-xs uppercase tracking-wider text-gray-500 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u.id} data-testid={`user-row-${u.id}`}>
                  <TableCell className="font-body text-gray-900">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-violet-100 rounded-full flex items-center justify-center text-violet-600 text-sm font-medium font-body">
                        {u.name?.charAt(0).toUpperCase()}
                      </div>
                      <span>{u.name}</span>
                      {u.id === user?.id && (
                        <span className="text-xs text-violet-600 bg-violet-50 px-2 py-0.5 rounded-full">(you)</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-body text-gray-500">{u.email}</TableCell>
                  <TableCell>
                    {u.id === user?.id ? (
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-violet-500" />
                        <span className="font-body text-gray-900 capitalize">{u.role}</span>
                      </div>
                    ) : (
                      <Select
                        value={u.role}
                        onValueChange={(value) => updateUserRole(u.id, value)}
                        disabled={updatingUser === u.id}
                      >
                        <SelectTrigger className="w-28 border-gray-200 rounded-lg" data-testid={`role-select-${u.id}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="creator">Creator</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  </TableCell>
                  <TableCell className="font-body text-gray-500">
                    {new Date(u.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    {u.id !== user?.id && (
                      <button
                        onClick={() => deleteUser(u.id)}
                        disabled={deletingUser === u.id}
                        className="p-2 text-gray-400 hover:text-red-500 transition-colors"
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

      <Footer />
    </div>
  );
};

export default AdminPanel;
