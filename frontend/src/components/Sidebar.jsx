import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutGrid, Archive, ShoppingCart, Users, BarChart3, Settings, LogOut, PlusCircle, HelpCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const linkClass = ({ isActive }) =>
  `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
    isActive ? 'bg-white/10 text-white' : 'text-white/70 hover:bg-white/5 hover:text-white'
  }`;

export default function Sidebar() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  return (
    <aside className="w-64 bg-navy min-h-screen flex flex-col p-5 shrink-0">
      <div className="mb-8">
        <h1 className="text-white font-extrabold text-xl">StoreID</h1>
        <p className="text-white/50 text-xs">Admin Panel</p>
      </div>

      <nav className="flex flex-col gap-1 flex-1">
        <NavLink to="/admin" end className={linkClass}><LayoutGrid size={18}/> Dashboard</NavLink>
        <NavLink to="/admin/inventory" className={linkClass}><Archive size={18}/> Inventory</NavLink>
        <NavLink to="/admin/orders" className={linkClass}><ShoppingCart size={18}/> Orders</NavLink>
        <NavLink to="/admin/users" className={linkClass}><Users size={18}/> Akun</NavLink>
        <NavLink to="/admin/analytics" className={linkClass}><BarChart3 size={18}/> Analytics</NavLink>
        <NavLink to="/profile" className={linkClass}><Settings size={18}/> Settings</NavLink>
        <button onClick={() => { logout(); navigate('/'); }} className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-white/70 hover:bg-white/5 hover:text-white text-left">
          <LogOut size={18}/> Logout
        </button>
      </nav>

      <button
        onClick={() => navigate('/admin/products/new')}
        className="flex items-center justify-center gap-2 bg-brand-orange hover:bg-brand-orangeDark text-white font-semibold py-3 rounded-lg mb-4 transition-colors"
      >
        <PlusCircle size={18}/> New Product
      </button>
      <button className="flex items-center gap-3 px-4 py-2.5 text-white/50 text-sm">
        <HelpCircle size={18}/> Help Center
      </button>
    </aside>
  );
}
