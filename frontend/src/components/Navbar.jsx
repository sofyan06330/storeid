import { Link, useNavigate } from 'react-router-dom';
import { Search, Bell, ShoppingCart, User, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';

export default function Navbar({ cartCount = 0 }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = (e) => {
    if (e.key === 'Enter' && searchTerm.trim()) {
      navigate(`/katalog?search=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-6">
        <Link to="/" className="text-xl font-extrabold text-navy shrink-0">StoreID</Link>
        <Link to="/katalog" className="hidden sm:block text-gray-600 hover:text-navy text-sm font-medium">Katalog</Link>

        <div className="flex-1 max-w-xl relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Cari produk..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleSearch}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-gray-100 border border-transparent focus:bg-white focus:border-brand-orange/50 focus:outline-none text-sm"
          />
        </div>

        <div className="flex items-center gap-4 ml-auto">
          <button className="text-gray-500 hover:text-navy relative">
            <Bell size={22} />
          </button>
          <Link to="/cart" className="text-gray-500 hover:text-navy relative">
            <ShoppingCart size={22} />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-brand-orange text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>

          {user ? (
            <div className="relative">
              <button onClick={() => setMenuOpen(!menuOpen)} className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-full bg-navy text-white flex items-center justify-center font-semibold text-sm">
                  {user.name?.[0]?.toUpperCase()}
                </div>
              </button>
              {menuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-2">
                  <div className="px-4 py-2 border-b border-gray-50">
                    <p className="text-sm font-semibold text-navy">{user.name}</p>
                    <p className="text-xs text-gray-400">{user.role === 'admin' ? 'SUPERUSER' : 'Pelanggan'}</p>
                  </div>
                  {user.role === 'admin' && (
                    <Link to="/admin" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Admin Panel</Link>
                  )}
                  <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Profil Saya</Link>
                  <Link to="/orders" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Pesanan Saya</Link>
                  <button
                    onClick={() => { logout(); navigate('/'); }}
                    className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <LogOut size={14} /> Keluar
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="text-gray-500 hover:text-navy">
              <User size={22} />
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
