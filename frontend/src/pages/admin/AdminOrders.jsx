import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye } from 'lucide-react';
import Sidebar from '../../components/Sidebar';
import api from '../../api/axios';

const formatRupiah = (n) => 'Rp ' + Number(n).toLocaleString('id-ID');

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'paid', label: 'Sudah Dibayar' },
  { value: 'processing', label: 'Diproses' },
  { value: 'shipped', label: 'Dikirim' },
  { value: 'completed', label: 'Selesai' },
  { value: 'cancelled', label: 'Dibatalkan' },
  { value: 'failed', label: 'Gagal' },
  { value: 'expired', label: 'Kedaluwarsa' },
];

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

export default function AdminOrders() {
    useEffect(() => {
  document.title = 'Pesanan | StoreID'
}) 
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [errorId, setErrorId] = useState(null);

  const load = () => {
    setLoading(true);
    api.get('/orders').then(res => setOrders(res.data.data)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    setErrorId(null);
    const prevOrders = orders;
    // Optimistic update supaya dropdown terasa responsif
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    try {
      await api.patch(`/orders/${orderId}/status`, { status: newStatus });
    } catch (err) {
      setOrders(prevOrders); // rollback jika gagal
      setErrorId(orderId);
      alert(err.response?.data?.message || 'Gagal memperbarui status pesanan.');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <main className="flex-1 p-8">
        <h1 className="text-3xl font-extrabold text-navy">Pesanan</h1>
        <p className="text-gray-500 mt-1">Seluruh pesanan dari pelanggan.</p>

        <div className="card mt-6 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b border-gray-100">
                <th className="p-4 font-medium">Kode Pesanan</th>
                <th className="p-4 font-medium">Pelanggan</th>
                <th className="p-4 font-medium">Total</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Tanggal</th>
                <th className="p-4 font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="p-6 text-center text-gray-400">Memuat...</td></tr>
              ) : orders.length === 0 ? (
                <tr><td colSpan={6} className="p-6 text-center text-gray-400">Belum ada pesanan.</td></tr>
              ) : orders.map(o => (
                <tr key={o.id} className="border-b border-gray-50 last:border-0">
                  <td className="p-4 font-medium">
                    <Link to={`/admin/orders/${o.id}`} className="text-brand-orange hover:underline">{o.order_code}</Link>
                  </td>
                  <td className="p-4">{o.customer_name}</td>
                  <td className="p-4">{formatRupiah(o.total_amount)}</td>
                  <td className="p-4">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusStyle[o.status] || 'bg-gray-100 text-gray-600'}`}>
                      {STATUS_OPTIONS.find(s => s.value === o.status)?.label || o.status}
                    </span>
                  </td>
                  <td className="p-4 text-gray-500">{new Date(o.created_at).toLocaleDateString('id-ID')}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <select
                        value={o.status}
                        disabled={updatingId === o.id}
                        onChange={(e) => handleStatusChange(o.id, e.target.value)}
                        className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:border-brand-orange/50 disabled:opacity-50"
                      >
                        {STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                      </select>
                      <Link to={`/admin/orders/${o.id}`} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500" title="Lihat Detail">
                        <Eye size={16} />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
