import { NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { Palette, LogOut } from 'lucide-react';

export default function Sidebar({ links }) {
  const navigate = useNavigate();
  const { user, clearAuth, refreshToken } = useAuthStore();

  const handleLogout = async () => {
    try { await api.post('/auth/logout', { refreshToken }); } catch {}
    clearAuth();
    toast.success('Logged out');
    navigate('/login');
  };

  return (
    <aside className="w-64 bg-gray-900 text-white h-screen flex flex-col fixed left-0 top-0">
      <div className="p-5 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <Palette size={22} className="text-blue-400" />
          <span className="font-bold text-sm leading-tight">National Painting<br/>Competition</span>
        </div>
        <p className="mt-2 text-xs text-gray-400 truncate">{user?.email}</p>
        <span className="inline-block mt-1 text-xs bg-blue-600 px-2 py-0.5 rounded">{user?.role}</span>
      </div>

      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition ${
                isActive ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`
            }
          >
            {Icon && <Icon size={16} />}
            {label}
          </NavLink>
        ))}
      </nav>

      <button onClick={handleLogout}
        className="flex items-center gap-2 px-5 py-4 text-gray-400 hover:text-red-400 text-sm border-t border-gray-700 transition"
      >
        <LogOut size={16} /> Logout
      </button>
    </aside>
  );
}