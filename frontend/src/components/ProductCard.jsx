import { Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '');

function formatRupiah(num) {
  return 'Rp ' + Number(num).toLocaleString('id-ID');
}

export default function ProductCard({ product, onAddToCart }) {
  const images = typeof product.images === 'string' ? JSON.parse(product.images || '[]') : (product.images || []);
  const img = images[0] ? `${API_BASE}${images[0]}` : null;
  const hasDiscount = product.compare_at_price && Number(product.compare_at_price) > Number(product.price);
  const discountPct = hasDiscount ? Math.round((1 - product.price / product.compare_at_price) * 100) : 0;

  return (
    <div className="card overflow-hidden group hover:shadow-md transition-shadow">
      <Link to={`/produk/${product.id}`} className="block">
        <div className="relative aspect-square bg-gray-100">
          {hasDiscount && (
            <span className="absolute top-3 left-3 bg-brand-orange text-white text-[10px] font-bold px-2 py-1 rounded z-10">
              DISKON {discountPct}%
            </span>
          )}
          {img ? (
            <img src={img} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300 text-sm">Tanpa Gambar</div>
          )}
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
            className="absolute top-3 right-3 bg-white rounded-full p-2 shadow-sm hover:bg-red-50 z-10"
          >
            <Heart size={16} className="text-gray-400" />
          </button>
        </div>
        <div className="px-4 pt-4">
          <p className="text-xs text-gray-400">{product.category_name || 'Umum'}</p>
          <h3 className="font-semibold text-navy text-sm mt-1 line-clamp-2 min-h-[2.5rem] group-hover:text-brand-orange transition-colors">{product.name}</h3>
          <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
            <span className="text-yellow-500">★</span>
            <span>{product.rating || '4.8'}</span>
            {product.location && <span>| {product.location}</span>}
          </div>
          <p className="text-brand-orange font-bold mt-2">{formatRupiah(product.price)}</p>
        </div>
      </Link>
      <div className="p-4 pt-3">
        <button
          onClick={() => onAddToCart?.(product)}
          className="w-full bg-navy hover:bg-navy-light text-white text-sm font-semibold py-2.5 rounded-lg transition-colors"
        >
          Tambah ke Keranjang
        </button>
      </div>
    </div>
  );
}
