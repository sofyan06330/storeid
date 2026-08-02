import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
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

export default function AdminOrderDetail() {
    useEffect(() => {
  document.title = 'Detail Pesanan | StoreID'
}) 
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const load = () => {
    setLoading(true);
    api.get(`/orders/${id}`)
      .then(res => setOrder(res.data.data))
      .catch(err => setError(err.response?.data?.message || 'Gagal memuat pesanan.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [id]);

  const handleStatusChange = async (newStatus) => {
    setSaving(true);
    setMsg('');
    try {
      await api.patch(`/orders/${id}/status`, { status: newStatus });
      setOrder(prev => ({ ...prev, status: newStatus }));
      setMsg('Status pesanan berhasil diperbarui.');
    } catch (err) {
      setMsg(err.response?.data?.message || 'Gagal memperbarui status.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <main className="flex-1 p-8 max-w-4xl">
        <button onClick={() => navigate('/admin/orders')} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-navy mb-4">
          <ArrowLeft size={16} /> Kembali ke Pesanan
        </button>

        {loading ? (
          <p className="text-gray-400">Memuat...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : order && (
          <>
            <div className="flex justify-between items-start flex-wrap gap-4 mb-6">
              <div>
                <h1 className="text-2xl font-bold text-navy">{order.order_code}</h1>
                <p className="text-gray-500 text-sm mt-1">{new Date(order.created_at).toLocaleString('id-ID')}</p>
              </div>
              <div className="text-right">
                <label className="text-xs text-gray-400 block mb-1">Status Pesanan</label>
                <select
                  value={order.status}
                  disabled={saving}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:border-brand-orange/50 disabled:opacity-50"
                >
                  {STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
            </div>

            {msg && (
              <div className={`mb-4 text-sm px-4 py-2.5 rounded-lg ${msg.includes('berhasil') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>{msg}</div>
            )}

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div className="card p-5">
                <h2 className="font-bold text-navy mb-3">Informasi Pelanggan</h2>
                <div className="text-sm space-y-1.5 text-gray-600">
                  <p><span className="text-gray-400">Nama:</span> {order.customer_name}</p>
                  <p><span className="text-gray-400">Email:</span> {order.customer_email}</p>
                  <p><span className="text-gray-400">WhatsApp:</span> {order.customer_whatsapp}</p>
                </div>
              </div>
              <div className="card p-5">
                <h2 className="font-bold text-navy mb-3">Alamat Pengiriman</h2>
                <p className="text-sm text-gray-600 whitespace-pre-line">{order.shipping_address}</p>
              </div>
            </div>

            <div className="card p-5 mb-6">
              <h2 className="font-bold text-navy mb-3">Metode Pembayaran</h2>
              <p className="text-sm text-gray-600">{order.payment_type || 'Belum tersedia'}</p>
              {order.paid_at && <p className="text-xs text-gray-400 mt-1">Dibayar pada {new Date(order.paid_at).toLocaleString('id-ID')}</p>}
            </div>

            <div className="card overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 border-b border-gray-100">
                    <th className="p-4 font-medium">Produk</th>
                    <th className="p-4 font-medium">Harga</th>
                    <th className="p-4 font-medium">Jumlah</th>
                    <th className="p-4 font-medium">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items?.map(item => (
                    <tr key={item.id} className="border-b border-gray-50 last:border-0">
                      <td className="p-4 font-medium text-navy">{item.product_name}</td>
                      <td className="p-4">{formatRupiah(item.price)}</td>
                      <td className="p-4">{item.qty}</td>
                      <td className="p-4 font-medium">{formatRupiah(item.subtotal)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={3} className="p-4 text-right font-semibold text-navy">Total</td>
                    <td className="p-4 font-bold text-brand-orange">{formatRupiah(order.total_amount)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
