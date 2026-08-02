import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import api from '../api/axios';

const formatRupiah = (n) => 'Rp ' + Number(n).toLocaleString('id-ID');

const statusStyle = {
  pending: 'bg-yellow-100 text-yellow-700',
  paid: 'bg-green-100 text-green-700',
  processing: 'bg-blue-100 text-blue-700',
  shipped: 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
  failed: 'bg-red-100 text-red-700',
  expired: 'bg-gray-100 text-gray-600',
  cancelled: 'bg-gray-100 text-gray-600',
};

const statusLabel = {
  pending: 'Menunggu Pembayaran', paid: 'Sudah Dibayar', processing: 'Diproses',
  shipped: 'Dikirim', completed: 'Selesai', failed: 'Gagal', expired: 'Kedaluwarsa', cancelled: 'Dibatalkan',
};

export default function Orders() {
  useEffect(() => {
  document.title = 'Pesanan | StoreID'
}) 
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/orders/my-orders').then(res => setOrders(res.data.data)).finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-bold text-navy mb-6">Pesanan Saya</h1>
        {loading ? (
          <p className="text-gray-400">Memuat pesanan...</p>
        ) : orders.length === 0 ? (
          <div className="card p-10 text-center text-gray-400">Belum ada pesanan.</div>
        ) : (
          <div className="space-y-4">
            {orders.map(o => (
              <div key={o.id} className="card p-5 flex items-center justify-between flex-wrap gap-3">
                <div>
                  <p className="font-semibold text-navy">{o.order_code}</p>
                  <p className="text-xs text-gray-400 mt-1">{new Date(o.created_at).toLocaleString('id-ID')}</p>
                </div>
                <p className="font-bold text-navy">{formatRupiah(o.total_amount)}</p>
                <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${statusStyle[o.status] || 'bg-gray-100 text-gray-600'}`}>
                  {statusLabel[o.status] || o.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
