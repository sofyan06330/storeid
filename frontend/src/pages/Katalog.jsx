import { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, SlidersHorizontal } from 'lucide-react';
import Navbar from '../components/Navbar';
import ProductCard from '../components/ProductCard';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const SORT_OPTIONS = [
  { key: 'popular', label: 'Terpopuler' },
  { key: 'lowest', label: 'Terendah' },
  { key: 'highest', label: 'Tertinggi' },
  { key: 'newest', label: 'Terbaru' },
];

const RATING_OPTIONS = [4, 3];
const LIMIT = 12;

export default function Katalog() {
  useEffect(() => {
  document.title = 'Katalog | StoreID'
}) 
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cartCount, setCartCount] = useState(0);

  // Filter state, diinisialisasi dari query string (agar link dari Home berfungsi)
  const [selectedCategories, setSelectedCategories] = useState(
    searchParams.get('category') ? searchParams.get('category').split(',') : []
  );
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [minRating, setMinRating] = useState(searchParams.get('minRating') || '');
  const [selectedLocations, setSelectedLocations] = useState(
    searchParams.get('location') ? searchParams.get('location').split(',') : []
  );
  const [sort, setSort] = useState(searchParams.get('sort') || 'popular');
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1);
  const [search, setSearch] = useState(searchParams.get('search') || '');

  // Ambil opsi filter (kategori + lokasi) sekali di awal
  useEffect(() => {
    api.get('/products/filters').then(res => {
      setCategories(res.data.data.categories);
      setLocations(res.data.data.locations);
    }).catch(() => {});
  }, []);

  const fetchProducts = useCallback(() => {
    setLoading(true);
    setError('');
    const params = {
      page, limit: LIMIT, sort,
      publishedOnly: 'true',
    };
    if (search) params.search = search;
    if (selectedCategories.length) params.category = selectedCategories.join(',');
    if (minPrice) params.minPrice = minPrice;
    if (maxPrice) params.maxPrice = maxPrice;
    if (minRating) params.minRating = minRating;
    if (selectedLocations.length) params.location = selectedLocations.join(',');

    api.get('/products', { params })
      .then(res => {
        setItems(res.data.data.items);
        setPagination(res.data.data.pagination);
      })
      .catch(err => {
        console.error(err);
        setError(err.response?.data?.message || 'Gagal memuat produk.');
      })
      .finally(() => setLoading(false));
  }, [page, sort, selectedCategories, minPrice, maxPrice, minRating, selectedLocations, search]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  // Sinkronkan filter aktif ke URL supaya bisa di-share / back button jalan normal
  useEffect(() => {
    const next = {};
    if (search) next.search = search;
    if (selectedCategories.length) next.category = selectedCategories.join(',');
    if (minPrice) next.minPrice = minPrice;
    if (maxPrice) next.maxPrice = maxPrice;
    if (minRating) next.minRating = minRating;
    if (selectedLocations.length) next.location = selectedLocations.join(',');
    if (sort !== 'popular') next.sort = sort;
    if (page !== 1) next.page = page;
    setSearchParams(next, { replace: true });
  }, [selectedCategories, minPrice, maxPrice, minRating, selectedLocations, sort, page, search]);

  const toggleCategory = (slug) => {
    setPage(1);
    setSelectedCategories(prev => prev.includes(slug) ? prev.filter(s => s !== slug) : [...prev, slug]);
  };

  const toggleLocation = (loc) => {
    setPage(1);
    setSelectedLocations(prev => prev.includes(loc) ? prev.filter(l => l !== loc) : [...prev, loc]);
  };

  const toggleRating = (val) => {
    setPage(1);
    setMinRating(prev => String(prev) === String(val) ? '' : String(val));
  };

  const applyPriceFilter = (e) => {
    e.preventDefault();
    setPage(1);
    fetchProducts();
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setMinPrice('');
    setMaxPrice('');
    setMinRating('');
    setSelectedLocations([]);
    setSort('popular');
    setSearch('');
    setPage(1);
  };

  const addToCart = async (product) => {
    if (!user) return navigate('/login');
    try {
      await api.post('/cart', { product_id: product.id, qty: 1 });
      setCartCount(c => c + 1);
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menambahkan ke keranjang');
    }
  };

  const hasActiveFilters = selectedCategories.length || minPrice || maxPrice || minRating || selectedLocations.length || sort !== 'popular' || search;

  // Label ringkasan hasil, meniru "Menampilkan 1-12 dari 48 produk untuk "Pakaian Pria""
  const start = pagination.total === 0 ? 0 : (pagination.page - 1) * LIMIT + 1;
  const end = Math.min(pagination.page * LIMIT, pagination.total);
  const activeCategoryNames = categories
    .filter(c => selectedCategories.includes(c.slug))
    .map(c => c.name)
    .join(', ');
  const summaryLabel = activeCategoryNames || search;

  // Bangun daftar tombol pagination dengan ellipsis, mis: 1 2 3 ... 8
  const pageButtons = () => {
    const total = pagination.totalPages;
    const current = pagination.page;
    const items = [];
    const pushRange = (from, to) => {
      for (let i = from; i <= to; i++) items.push(i);
    };
    if (total <= 7) {
      pushRange(1, total);
    } else if (current <= 4) {
      pushRange(1, 5);
      items.push('...');
      items.push(total);
    } else if (current >= total - 3) {
      items.push(1);
      items.push('...');
      pushRange(total - 4, total);
    } else {
      items.push(1);
      items.push('...');
      pushRange(current - 1, current + 1);
      items.push('...');
      items.push(total);
    }
    return items;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar cartCount={cartCount} />

      <div className="max-w-7xl mx-auto px-6 py-8 flex gap-8 items-start">
        {/* ===== Sidebar Filter ===== */}
        <aside className="w-64 shrink-0 card p-5 hidden md:block sticky top-20">
          <div className="flex items-center gap-2 mb-5">
            <SlidersHorizontal size={18} className="text-navy" />
            <h2 className="font-bold text-navy text-lg">Filter</h2>
          </div>

          <div className="mb-6">
            <h3 className="text-xs font-bold text-gray-400 tracking-wide mb-3">KATEGORI</h3>
            <div className="space-y-2.5">
              {categories.map(cat => (
                <label key={cat.id} className="flex items-center gap-2.5 cursor-pointer text-sm">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-gray-300 text-brand-orange focus:ring-brand-orange/40"
                    checked={selectedCategories.includes(cat.slug)}
                    onChange={() => toggleCategory(cat.slug)}
                  />
                  <span className={selectedCategories.includes(cat.slug) ? 'text-brand-orange font-medium' : 'text-gray-700'}>{cat.name}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-xs font-bold text-gray-400 tracking-wide mb-3">RENTANG HARGA (RP)</h3>
            <form onSubmit={applyPriceFilter} className="space-y-2">
              <input type="number" min="0" placeholder="Min" className="input-field py-2 text-sm"
                value={minPrice} onChange={e => setMinPrice(e.target.value)} />
              <input type="number" min="0" placeholder="Max" className="input-field py-2 text-sm"
                value={maxPrice} onChange={e => setMaxPrice(e.target.value)} />
              <button type="submit" className="hidden">Terapkan</button>
            </form>
          </div>

          <div className="mb-6">
            <h3 className="text-xs font-bold text-gray-400 tracking-wide mb-3">RATING MINIMUM</h3>
            <div className="space-y-2.5">
              {RATING_OPTIONS.map(r => (
                <label key={r} className="flex items-center gap-2.5 cursor-pointer text-sm">
                  <input
                    type="radio"
                    name="minRating"
                    className="w-4 h-4 border-gray-300 text-brand-orange focus:ring-brand-orange/40"
                    checked={String(minRating) === String(r)}
                    onChange={() => toggleRating(r)}
                  />
                  <span className="text-gray-700 flex items-center gap-1">
                    <span className="text-yellow-500">★</span> {r} Keatas
                  </span>
                </label>
              ))}
            </div>
          </div>

          {locations.length > 0 && (
            <div className="mb-6">
              <h3 className="text-xs font-bold text-gray-400 tracking-wide mb-3">LOKASI</h3>
              <div className="space-y-2.5">
                {locations.map(loc => (
                  <label key={loc} className="flex items-center gap-2.5 cursor-pointer text-sm">
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded border-gray-300 text-brand-orange focus:ring-brand-orange/40"
                      checked={selectedLocations.includes(loc)}
                      onChange={() => toggleLocation(loc)}
                    />
                    <span className="text-gray-700">{loc}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={clearFilters}
            disabled={!hasActiveFilters}
            className="w-full bg-navy hover:bg-navy-light disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold py-2.5 rounded-lg transition-colors"
          >
            Hapus Filter
          </button>
        </aside>

        {/* ===== Konten Utama ===== */}
        <main className="flex-1 min-w-0">
          <div className="flex justify-between items-start flex-wrap gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-navy">Katalog Produk</h1>
              <p className="text-gray-500 text-sm mt-1">
                {pagination.total === 0
                  ? 'Tidak ada produk yang cocok dengan filter Anda.'
                  : `Menampilkan ${start}-${end} dari ${pagination.total} produk${summaryLabel ? ` untuk "${summaryLabel}"` : ''}`}
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-gray-500 mr-1">Urutkan:</span>
              {SORT_OPTIONS.map(opt => (
                <button
                  key={opt.key}
                  onClick={() => { setSort(opt.key); setPage(1); }}
                  className={`text-sm font-medium px-4 py-2 rounded-full transition-colors ${sort === opt.key ? 'bg-navy text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <p className="text-gray-400 text-center py-20">Memuat produk...</p>
          ) : error ? (
            <p className="text-red-500 text-center py-20">{error}</p>
          ) : items.length === 0 ? (
            <div className="card p-16 text-center text-gray-400">
              Tidak ada produk yang cocok. Coba ubah atau hapus filter.
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
                {items.map(p => <ProductCard key={p.id} product={p} onAddToCart={addToCart} />)}
              </div>

              {pagination.totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-10">
                  <button
                    disabled={pagination.page <= 1}
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    className="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  {pageButtons().map((p, i) => p === '...' ? (
                    <span key={`ellipsis-${i}`} className="w-9 h-9 flex items-center justify-center text-gray-400">...</span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${pagination.page === p ? 'bg-navy text-white' : 'border border-gray-200 text-gray-600 hover:bg-gray-100'}`}
                    >
                      {p}
                    </button>
                  ))}
                  <button
                    disabled={pagination.page >= pagination.totalPages}
                    onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                    className="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
