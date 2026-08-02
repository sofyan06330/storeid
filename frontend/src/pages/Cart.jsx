import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Minus, Plus } from 'lucide-react';
import Navbar from '../components/Navbar';
import api from '../api/axios';

const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '');
const formatRupiah = (n) => 'Rp ' + Number(n).toLocaleString('id-ID');

export default function Cart() {
  useEffect(() => {
  document.title = 'Tambah Keranjang | StoreID'
}) 
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const loadCart = async () => {
    setLoading(true);
    try {
      const res = await api.get('/cart');
      setItems(res.data.data.items);
      setTotal(res.data.data.total);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadCart(); }, []);

  const updateQty = async (cartId, qty) => {
    if (qty < 1) return;
    await api.put(`/cart/${cartId}`, { qty });
    loadCart();
  };

  const removeItem = async (cartId) => {
    await api.delete(`/cart/${cartId}`);
    loadCart();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar cartCount={items.length} />
      <div className="max-w-5xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-bold text-navy mb-6">Keranjang Belanja</h1>

        {loading ? (
          <p className="text-gray-400">Memuat keranjang...</p>
        ) : items.length === 0 ? (
          <div className="card p-10 text-center text-gray-400">
            Keranjang Anda masih kosong.
            <div className="mt-4"><Link to="/" className="text-brand-orange font-semibold">Mulai Belanja →</Link></div>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-4">
              {items.map(item => {
                const img = item.images?.[0] ? `${API_BASE}${item.images[0]}` : null;
                return (
                  <div key={item.cart_id} className="card p-4 flex items-center gap-4">
                    <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                      {img && <img src={img} alt={item.name} className="w-full h-full object-cover" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-navy truncate">{item.name}</p>
                      <p className="text-brand-orange font-bold mt-1">{formatRupiah(item.price)}</p>
                    </div>
                    <div className="flex items-center gap-2 border border-gray-200 rounded-lg">
                      <button onClick={() => updateQty(item.cart_id, item.qty - 1)} className="p-2 hover:bg-gray-50"><Minus size={14}/></button>
                      <span className="w-6 text-center text-sm">{item.qty}</span>
                      <button onClick={() => updateQty(item.cart_id, item.qty + 1)} className="p-2 hover:bg-gray-50"><Plus size={14}/></button>
                    </div>
                    <button onClick={() => removeItem(item.cart_id)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg"><Trash2 size={18}/></button>
                  </div>
                );
              })}
            </div>

            <div className="card p-6 h-fit">
              <h2 className="font-bold text-navy mb-4">Ringkasan Belanja</h2>
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Subtotal</span><span>{formatRupiah(total)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600 mb-4">
                <span>Ongkos Kirim</span><span className="text-green-600 font-medium">Gratis</span>
              </div>
              <div className="flex justify-between font-bold text-navy border-t border-gray-100 pt-4 mb-6">
                <span>Total</span><span>{formatRupiah(total)}</span>
              </div>
              <button onClick={() => navigate('/checkout')} className="btn-primary w-full">Lanjutkan Pesanan</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
