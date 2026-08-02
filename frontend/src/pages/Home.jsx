import { useEffect, useState } from 'react';
import { Truck, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import ProductCard from '../components/ProductCard';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const categories = [
  { name: 'Elektronik', slug: 'elektronik', color: 'from-gray-700 to-gray-900' },
  { name: 'Fashion', slug: 'fashion', color: 'from-amber-700 to-amber-900' },
  { name: 'Rumah Tangga', slug: 'rumah-tangga', color: 'from-slate-400 to-slate-600' },
  { name: 'Kecantikan', slug: 'kecantikan', color: 'from-emerald-700 to-emerald-900' },
];

export default function Home() {
  useEffect(() => {
  document.title = 'Beranda | StoreID'
}) 
  const [products, setProducts] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [productError, setProductError] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    setLoadingProducts(true);
    setProductError('');
    api.get('/products', { params: { limit: 8, sort: 'popular' } })
      .then(res => setProducts(res.data.data?.items || []))
      .catch(err => {
        console.error('Gagal memuat produk:', err);
        setProductError(err.response?.data?.message || 'Gagal memuat produk. Periksa koneksi ke server.');
      })
      .finally(() => setLoadingProducts(false));
  }, []);

  const addToCart = async (product) => {
    if (!user) return navigate('/login');
    try {
      await api.post('/cart', { product_id: product.id, qty: 1 });
      setCartCount(c => c + 1);
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menambahkan ke keranjang');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar cartCount={cartCount} />

      {/* Hero */}
      <section className="relative bg-navy overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-navy-dark via-navy to-navy/70" />
        <div className="relative max-w-7xl mx-auto px-6 py-24 md:py-32">
          <span className="inline-block bg-brand-orange text-white text-xs font-bold px-4 py-1.5 rounded-full">EKSKLUFSIF ! </span>
          <h1 className="text-white text-4xl md:text-5xl font-extrabold mt-5 max-w-2xl leading-tight">
           Khusus pengguna baru - Nikmati gratis ongkir dan diskon hingga 50%
          </h1>
          <p className="text-white/70 mt-4 max-w-xl">
           Lorem Ipsum is simply dummy text of the printing and typesetting industry.
          </p>
          <Link to="/katalog" className="btn-primary mt-8 inline-flex items-center gap-2">
            Ayo Belanja! <ChevronRight size={18} />
          </Link>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-6 py-14">
        <div className="flex justify-between items-end mb-6">
          <div>
            <h2 className="text-2xl font-bold text-navy">Kategori Populer</h2>
            <p className="text-gray-500 text-sm mt-1">Temukan kebutuhan Anda berdasarkan kategori</p>
          </div>
          <Link to="/katalog" className="text-brand-orange font-semibold text-sm flex items-center gap-1">Lihat Semua <ChevronRight size={16} /></Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {categories.map(cat => (
            <Link to={`/katalog?category=${cat.slug}`} key={cat.slug} className={`relative h-44 rounded-xl overflow-hidden bg-gradient-to-br ${cat.color} cursor-pointer group block`}>
              <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors" />
              <span className="absolute bottom-4 left-4 bg-white text-navy text-sm font-semibold px-3 py-1.5 rounded-full">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Banner */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="bg-navy rounded-2xl px-8 py-6 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <Truck className="text-brand-orange" size={32} />
            <div>
              <p className="text-white font-semibold">Gratis Ongkir ke Seluruh Indonesia</p>
              <p className="text-white/60 text-sm">Tanpa minimum pembelian untuk pengguna baru</p>
            </div>
          </div>
          <button className="bg-white text-navy font-semibold px-5 py-2.5 rounded-lg text-sm">Klaim Voucher</button>
        </div>
      </section>

      {/* Products */}
      <section className="max-w-7xl mx-auto px-6 py-14">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-navy">Produk Terlaris</h2>
          <div className="flex gap-2">
            <button className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-100"><ChevronLeft size={18} /></button>
            <button className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-100"><ChevronRight size={18} /></button>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {loadingProducts ? (
            <p className="text-gray-400 col-span-4 text-center py-10">Memuat produk...</p>
          ) : productError ? (
            <p className="text-red-500 col-span-4 text-center py-10">{productError}</p>
          ) : products.length === 0 ? (
            <p className="text-gray-400 col-span-4 text-center py-10">
              Belum ada produk yang dipublikasikan. Jika Anda admin, pastikan toggle "Publikasikan Langsung" aktif saat menambah/mengedit produk.
            </p>
          ) : (
            products.map(p => <ProductCard key={p.id} product={p} onAddToCart={addToCart} />)
          )}
        </div>
      </section>

      <footer className="bg-navy-dark text-white/70 mt-10">
       
        <div className="border-t border-white/10 py-5 text-center text-xs"> Copyright © {new Date().getFullYear()} <span className="font-semibold">StoreID. Developer by Moch Sofyan Indra Pratama.</span></div>
      </footer>
    </div>
  );
}
