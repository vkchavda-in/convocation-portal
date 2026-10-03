'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Users, UserPlus, Edit2, Trash2, Shield, Loader2,
  Check, X
} from 'lucide-react';
import { toast } from 'sonner';

interface User {
  id: string;
  username: string;
  name: string | null;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'EDITOR';
  isActive: boolean;
  createdAt: string;
}

export const dynamic = 'force-dynamic';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    name: '',
    role: 'EDITOR',
    isActive: true,
  });
  const [saving, setSaving] = useState(false);

  // Delete state
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<User | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch('/api/users');
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      } else {
        toast.error('Failed to load users');
      }
    } catch {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleOpenModal = (user?: User) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        username: user.username,
        password: '',
        name: user.name || '',
        role: user.role,
        isActive: user.isActive,
      });
    } else {
      setEditingUser(null);
      setFormData({
        username: '',
        password: '',
        name: '',
        role: 'EDITOR',
        isActive: true,
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const isEditing = !!editingUser;
      const url = isEditing ? `/api/users/${editingUser.id}` : '/api/users';
      const method = isEditing ? 'PUT' : 'POST';
      
      const payload: any = { ...formData };
      if (isEditing && !payload.password) {
        delete payload.password; // Don't send empty password when editing
      }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success(isEditing ? 'User updated successfully' : 'User created successfully');
        setIsModalOpen(false);
        fetchUsers();
      } else {
        const err = await res.json();
        toast.error(err.error || 'Failed to save user');
      }
    } catch {
      toast.error('Network error');
    } finally {
      setSaving(false);
    }
  };

  const deleteUser = async (user: User) => {
    setDeletingId(user.id);
    try {
      const res = await fetch(`/api/users/${user.id}`, { method: 'DELETE' });
      if (res.ok) {
        setUsers((prev) => prev.filter((p) => p.id !== user.id));
        toast.success('User deleted');
        setConfirmDelete(null);
      } else {
        const err = await res.json();
        toast.error(err.error || 'Failed to delete user');
      }
    } catch {
      toast.error('Network error');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* Page Header */}
      <div className="sticky top-0 z-10 shrink-0 bg-white border-b border-slate-200 px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-slate-400" />
            <h1 className="text-sm font-semibold text-slate-800">User Management</h1>
          </div>
          {!loading && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium bg-slate-100 text-slate-500">
              {users.length}
            </span>
          )}
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="inline-flex items-center gap-1.5 text-white text-xs font-medium px-3 py-1.5 rounded transition-colors bg-blue-600 hover:bg-blue-700"
        >
          <UserPlus className="w-3.5 h-3.5" />
          Add User
        </button>
      </div>

      {/* Content */}
      <div className="px-6 py-4 flex-1">
        <div className="bg-white border border-slate-200 rounded overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-16 gap-2 text-slate-400">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-xs">Loading users…</span>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-16">
              <Users className="w-8 h-8 text-slate-200 mx-auto mb-3" />
              <p className="text-sm font-medium text-slate-500 mb-1">No users found</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="px-4 py-2 text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wider">User</th>
                  <th className="px-4 py-2 text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Role</th>
                  <th className="px-4 py-2 text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-2 text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Joined</th>
                  <th className="px-4 py-2 text-right text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-slate-50 hover:bg-slate-50/60 transition-colors">
                    <td className="px-4 py-3">
                      <p className="text-xs font-medium text-slate-800">{user.name || 'No Name'}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5 font-mono">{user.username}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-medium ${
                        user.role === 'SUPER_ADMIN' ? 'bg-purple-100 text-purple-700' :
                        user.role === 'ADMIN' ? 'bg-blue-100 text-blue-700' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        <Shield className="w-2.5 h-2.5" />
                        {user.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                        user.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {user.isActive ? <Check className="w-2.5 h-2.5" /> : <X className="w-2.5 h-2.5" />}
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[10px] text-slate-400">
                      {new Date(user.createdAt).toLocaleDateString('en-IN', {
                        day: '2-digit', month: 'short', year: 'numeric',
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenModal(user)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setConfirmDelete(user)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Delete"
                          disabled={user.role === 'SUPER_ADMIN'}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Add/Edit User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-800">
                {editingUser ? 'Edit User' : 'Add New User'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="e.g. John Doe"
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Username</label>
                <input
                  type="text"
                  required
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="e.g. jdoe"
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Password {editingUser && <span className="text-slate-400 font-normal">(Leave blank to keep unchanged)</span>}
                </label>
                <input
                  type="password"
                  required={!editingUser}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder={editingUser ? "Enter new password..." : "Enter strong password"}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                >
                  <option value="EDITOR">Editor (Manage Content Only)</option>
                  <option value="ADMIN">Admin (Manage Everything except Users)</option>
                  <option value="SUPER_ADMIN">Super Admin (Full Access)</option>
                </select>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="isActive" className="text-xs text-slate-700 cursor-pointer">
                  Account is Active
                </label>
              </div>

              <div className="pt-4 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs border border-slate-200 text-slate-600 rounded hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 text-xs text-white bg-blue-600 hover:bg-blue-700 rounded transition-colors disabled:opacity-50 flex items-center gap-1.5"
                >
                  {saving && <Loader2 className="w-3 h-3 animate-spin" />}
                  {editingUser ? 'Update User' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirmation dialog */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setConfirmDelete(null)}>
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm mx-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-sm font-semibold text-slate-800 mb-1">Delete user?</h3>
            <p className="text-xs text-slate-500 mb-4">
              <strong>{confirmDelete.name}</strong> will be permanently deleted. This cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setConfirmDelete(null)}
                className="px-3 py-1.5 text-xs border border-slate-200 text-slate-600 rounded hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteUser(confirmDelete)}
                disabled={!!deletingId}
                className="px-3 py-1.5 text-xs text-white bg-red-600 hover:bg-red-700 rounded transition-colors disabled:opacity-50 flex items-center gap-1.5"
              >
                {deletingId ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
