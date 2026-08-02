import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ChevronRight, Minus, Plus, ShoppingCart, ShieldCheck, Truck, RotateCcw, Star } from 'lucide-react';
import Navbar from '../components/Navbar';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '');
const formatRupiah = (n) => 'Rp ' + Number(n).toLocaleString('id-ID');

const TABS = [
  { key: 'deskripsi', label: 'Deskripsi' },
  { key: 'spesifikasi', label: 'Spesifikasi' },
  { key: 'diskusi', label: 'Diskusi' },
  { key: 'ulasan', label: 'Ulasan' },
];

export default function ProductDetail() {
  useEffect(() => {
  document.title = 'Detail Produk | StoreID'
}) 
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cartCount, setCartCount] = useState(0);

  const [activeImage, setActiveImage] = useState(0);
  const [selectedVariants, setSelectedVariants] = useState({});
  const [qty, setQty] = useState(1);
  const [activeTab, setActiveTab] = useState('deskripsi');
  const [submitting, setSubmitting] = useState(false);
  const [actionMsg, setActionMsg] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    api.get(`/products/${id}/detail`)
      .then(res => {
        const data = res.data.data;
        setProduct(data);
        setActiveImage(0);
        setQty(1);
        // Pilih varian pertama di tiap grup sebagai default
        const defaults = {};
        Object.entries(data.variants || {}).forEach(([group, options]) => {
          if (options.length > 0) defaults[group] = options[0];
        });
        setSelectedVariants(defaults);
      })
      .catch(err => {
        console.error(err);
        setError(err.response?.data?.message || 'Gagal memuat detail produk.');
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <p className="text-center text-gray-400 py-24">Memuat detail produk...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <p className="text-center text-red-500 py-24">{error || 'Produk tidak ditemukan.'}</p>
      </div>
    );
  }

  const images = typeof product.images === 'string' ? JSON.parse(product.images || '[]') : (product.images || []);
  const extraFromVariants = Object.values(selectedVariants).reduce((sum, v) => sum + Number(v?.extra_price || 0), 0);
  const finalPrice = Number(product.price) + extraFromVariants;
  const hasDiscount = product.compare_at_price && Number(product.compare_at_price) > finalPrice;
  const discountPct = hasDiscount ? Math.round((1 - finalPrice / Number(product.compare_at_price)) * 100) : 0;

  const specifications = typeof product.specifications === 'string'
    ? JSON.parse(product.specifications || '{}')
    : (product.specifications || {});

  const ratingSummary = product.rating_summary || { average: product.rating || 0, total: 0, breakdown: {} };
  const maxBreakdownCount = Math.max(1, ...Object.values(ratingSummary.breakdown || {}));

  const selectVariant = (group, option) => {
    setSelectedVariants(prev => ({ ...prev, [group]: option }));
  };

  const changeQty = (delta) => {
    setQty(prev => Math.min(product.stock || 1, Math.max(1, prev + delta)));
  };

  const handleAddToCart = async (redirectToCheckout = false) => {
    if (!user) return navigate('/login');
    setSubmitting(true);
    setActionMsg('');
    try {
      await api.post('/cart', { product_id: product.id, qty });
      setCartCount(c => c + 1);
      if (redirectToCheckout) {
        navigate('/checkout');
      } else {
        setActionMsg('Produk berhasil ditambahkan ke keranjang.');
      }
    } catch (err) {
      setActionMsg(err.response?.data?.message || 'Gagal menambahkan ke keranjang.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar cartCount={cartCount} />

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6 flex-wrap">
          <Link to="/" className="hover:text-navy">Beranda</Link>
          <ChevronRight size={14} />
          {product.category_name && (
            <>
              <Link to={`/katalog?category=${product.category_slug}`} className="hover:text-navy">{product.category_name}</Link>
              <ChevronRight size={14} />
            </>
          )}
          <span className="text-navy font-medium">{product.name}</span>
        </nav>

        <div className="grid lg:grid-cols-2 gap-10">
          {/* ===== Galeri Foto ===== */}
          <div className="flex gap-4">
            <div className="flex flex-col gap-3">
              {images.length === 0 ? (
                <div className="w-16 h-16 rounded-lg bg-gray-100" />
              ) : images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${activeImage === i ? 'border-brand-orange' : 'border-gray-200 hover:border-gray-300'}`}
                >
                  <img src={`${API_BASE}${img}`} alt={`${product.name} ${i + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
            <div className="flex-1 aspect-square bg-white rounded-xl border border-gray-100 overflow-hidden flex items-center justify-center">
              {images[activeImage] ? (
                <img src={`${API_BASE}${images[activeImage]}`} alt={product.name} className="w-full h-full object-contain" />
              ) : (
                <span className="text-gray-300 text-sm">Tanpa Gambar</span>
              )}
            </div>
          </div>

          {/* ===== Info Produk ===== */}
          <div>
            <h1 className="text-2xl font-bold text-navy">{product.name}</h1>
            <div className="flex items-center gap-3 text-sm mt-2 text-gray-600 flex-wrap">
              <span className="flex items-center gap-1 text-yellow-500 font-semibold">
                <Star size={16} fill="currentColor" /> {ratingSummary.average}
              </span>
              <span className="text-gray-400">({ratingSummary.total.toLocaleString('id-ID')} Ulasan)</span>
              <span className="text-gray-300">|</span>
              <span>Terjual {product.sold_count >= 1000 ? `${(product.sold_count / 1000).toFixed(1)}rb+` : (product.sold_count || 0)}</span>
            </div>

            <div className="mt-4 bg-orange-50/60 border border-orange-100 rounded-xl p-4">
              {hasDiscount && (
                <p className="text-gray-400 text-sm line-through">{formatRupiah(product.compare_at_price)}</p>
              )}
              <div className="flex items-center gap-3 flex-wrap">
                <p className="text-brand-orange text-2xl font-extrabold">{formatRupiah(finalPrice)}</p>
                {hasDiscount && (
                  <span className="bg-brand-orange/10 text-brand-orange text-xs font-bold px-2.5 py-1 rounded-full">Hemat {discountPct}%</span>
                )}
              </div>
            </div>

            {Object.entries(product.variants || {}).map(([group, options]) => (
              <div key={group} className="mt-5">
                <p className="text-sm font-medium text-gray-700 mb-2">{group}: <span className="text-navy font-semibold">{selectedVariants[group]?.value}</span></p>
                <div className="flex flex-wrap gap-2">
                  {options.map(opt => {
                    const isActive = selectedVariants[group]?.id === opt.id;
                    if (group.toLowerCase() === 'warna') {
                      return (
                        <button
                          key={opt.id}
                          onClick={() => selectVariant(group, opt)}
                          title={opt.value}
                          className={`w-9 h-9 rounded-full border-2 transition-all ${isActive ? 'border-brand-orange scale-110' : 'border-gray-200'}`}
                          style={{ backgroundColor: opt.color_hex || '#ccc' }}
                        />
                      );
                    }
                    return (
                      <button
                        key={opt.id}
                        onClick={() => selectVariant(group, opt)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${isActive ? 'border-brand-orange bg-orange-50 text-brand-orange' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}
                      >
                        {opt.value}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            <div className="mt-6 flex items-center gap-4">
              <div className="flex items-center border border-gray-200 rounded-lg">
                <button onClick={() => changeQty(-1)} className="p-2.5 hover:bg-gray-50"><Minus size={16} /></button>
                <span className="w-10 text-center text-sm font-medium">{qty}</span>
                <button onClick={() => changeQty(1)} className="p-2.5 hover:bg-gray-50"><Plus size={16} /></button>
              </div>
              <p className="text-sm text-gray-500">Stok tersedia: <span className="font-medium text-navy">{product.stock} unit</span></p>
            </div>

            {actionMsg && (
              <p className={`mt-4 text-sm px-4 py-2 rounded-lg ${actionMsg.includes('berhasil') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>{actionMsg}</p>
            )}

            <div className="mt-5 flex gap-3">
              <button
                onClick={() => handleAddToCart(false)}
                disabled={submitting || product.stock < 1}
                className="btn-outline flex-1 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <ShoppingCart size={18} /> Keranjang
              </button>
              <button
                onClick={() => handleAddToCart(true)}
                disabled={submitting || product.stock < 1}
                className="btn-primary flex-1 disabled:opacity-50"
              >
                {product.stock < 1 ? 'Stok Habis' : 'Beli Sekarang'}
              </button>
            </div>

            <div className="flex items-center gap-6 mt-6 pt-6 border-t border-gray-100 text-sm text-gray-500 flex-wrap">
              <span className="flex items-center gap-1.5"><ShieldCheck size={16} className="text-green-600" /> Garansi {product.warranty || '1 Thn'}</span>
              {Boolean(product.free_shipping) && <span className="flex items-center gap-1.5"><Truck size={16} className="text-green-600" /> Bebas Ongkir</span>}
              <span className="flex items-center gap-1.5"><RotateCcw size={16} className="text-green-600" /> {product.return_days || 7} Hari Retur</span>
            </div>
          </div>
        </div>

        {/* ===== Tabs: Deskripsi / Spesifikasi / Diskusi / Ulasan ===== */}
        <div className="mt-12 grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="flex gap-6 border-b border-gray-200">
              {TABS.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${activeTab === tab.key ? 'border-brand-orange text-navy' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="py-6">
              {activeTab === 'deskripsi' && (
                <div className="prose prose-sm max-w-none text-gray-600 whitespace-pre-line">
                  {product.description || 'Belum ada deskripsi untuk produk ini.'}
                </div>
              )}

              {activeTab === 'spesifikasi' && (
                <div>
                  {Object.keys(specifications).length === 0 ? (
                    <p className="text-gray-400 text-sm">Belum ada spesifikasi detail untuk produk ini.</p>
                  ) : (
                    <div className="card p-6">
                      <h3 className="font-bold text-navy mb-4">Spesifikasi Detail</h3>
                      <div className="grid sm:grid-cols-2 gap-x-8 gap-y-4 text-sm">
                        {Object.entries(specifications).map(([key, value]) => (
                          <div key={key}>
                            <p className="text-gray-400">{key}</p>
                            <p className="font-medium text-navy mt-0.5">{value}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'diskusi' && (
                <p className="text-gray-400 text-sm">Fitur diskusi tanya-jawab produk akan segera hadir.</p>
              )}

              {activeTab === 'ulasan' && (
                <div className="space-y-4">
                  {(product.reviews || []).length === 0 ? (
                    <p className="text-gray-400 text-sm">Belum ada ulasan untuk produk ini.</p>
                  ) : (
                    product.reviews.map(r => (
                      <ReviewItem key={r.id} review={r} />
                    ))
                  )}
                </div>
              )}
            </div>
          </div>

          {/* ===== Sidebar Ulasan Pembeli ===== */}
          <div className="card p-6 h-fit">
            <h3 className="font-bold text-navy mb-4">Ulasan Pembeli</h3>
            <div className="flex items-center gap-4 mb-4">
              <div className="text-center">
                <p className="text-3xl font-extrabold text-navy">{ratingSummary.average}</p>
                <p className="text-xs text-gray-400">dari 5</p>
              </div>
              <div className="flex-1 space-y-1">
                {[5, 4, 3, 2, 1].map(star => (
                  <div key={star} className="flex items-center gap-2 text-xs text-gray-500">
                    <span className="w-2">{star}</span>
                    <Star size={10} className="text-yellow-500" fill="currentColor" />
                    <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-brand-orange"
                        style={{ width: `${((ratingSummary.breakdown?.[star] || 0) / maxBreakdownCount) * 100}%` }}
                      />
                    </div>
                    <span className="w-6 text-right">{ratingSummary.breakdown?.[star] || 0}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4 mt-5 pt-5 border-t border-gray-100">
              {(product.reviews || []).slice(0, 2).length === 0 ? (
                <p className="text-gray-400 text-sm">Belum ada ulasan.</p>
              ) : (
                product.reviews.slice(0, 2).map(r => <ReviewItem key={r.id} review={r} compact />)
              )}
            </div>

            {ratingSummary.total > 2 && (
              <button onClick={() => setActiveTab('ulasan')} className="text-brand-orange text-sm font-semibold mt-4 hover:underline">
                Lihat Semua Ulasan
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ReviewItem({ review, compact = false }) {
  return (
    <div className={compact ? '' : 'card p-4'}>
      <div className="flex items-center gap-1 mb-1">
        {[1, 2, 3, 4, 5].map(i => (
          <Star key={i} size={13} className={i <= review.rating ? 'text-yellow-500' : 'text-gray-200'} fill="currentColor" />
        ))}
      </div>
      {review.comment && <p className="text-sm text-gray-600 italic">"{review.comment}"</p>}
      <p className="text-xs text-gray-400 mt-2">
        Oleh: <span className="font-medium text-gray-600">{review.user_name}</span> · {timeAgo(review.created_at)}
      </p>
    </div>
  );
}

function timeAgo(dateStr) {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const diffH = Math.floor(diffMs / (1000 * 60 * 60));
  if (diffH < 1) return 'Baru saja';
  if (diffH < 24) return `${diffH} jam yang lalu`;
  const diffD = Math.floor(diffH / 24);
  if (diffD < 30) return `${diffD} hari yang lalu`;
  return new Date(dateStr).toLocaleDateString('id-ID');
}
