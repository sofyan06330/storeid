import { useEffect, useState } from 'react';
import { DollarSign, ShoppingCart, Package, Users } from 'lucide-react';
import Sidebar from '../../components/Sidebar';
import api from '../../api/axios';

const formatRupiah = (n) => 'Rp ' + Number(n || 0).toLocaleString('id-ID');

const STATUS_LABEL = {
  pending: 'Pending', paid: 'Sudah Dibayar', processing: 'Diproses', shipped: 'Dikirim',
  completed: 'Selesai', failed: 'Gagal', expired: 'Kedaluwarsa', cancelled: 'Dibatalkan',
};

export default function Analytics() {
    useEffect(() => {
  document.title = 'Analytics | StoreID'
}) 
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/analytics/summary')
      .then(res => setData(res.data.data))
      .catch(err => setError(err.response?.data?.message || 'Gagal memuat data analitik.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar />
        <main className="flex-1 p-8"><p className="text-gray-400">Memuat data analitik...</p></main>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar />
        <main className="flex-1 p-8"><p className="text-red-500">{error || 'Data tidak tersedia.'}</p></main>
      </div>
    );
  }

  const cards = [
    { label: 'Total Pendapatan', value: formatRupiah(data.totals.revenue), icon: DollarSign, color: 'bg-green-50 text-green-600' },
    { label: 'Total Pesanan', value: data.totals.orders, icon: ShoppingCart, color: 'bg-orange-50 text-brand-orange' },
    { label: 'Total Produk', value: data.totals.products, icon: Package, color: 'bg-blue-50 text-blue-600' },
    { label: 'Total Pelanggan', value: data.totals.users, icon: Users, color: 'bg-purple-50 text-purple-600' },
  ];

  const maxRevenue = Math.max(1, ...data.revenueByDay.map(d => Number(d.revenue)));
  const maxStatusCount = Math.max(1, ...data.statusBreakdown.map(s => s.count));
  const maxSold = Math.max(1, ...data.topProducts.map(p => Number(p.total_sold)));

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <main className="flex-1 p-8">
        <h1 className="text-3xl font-extrabold text-navy">Analytics</h1>
        <p className="text-gray-500 mt-1">Ringkasan performa penjualan StoreID.</p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mt-8">
          {cards.map(c => (
            <div key={c.label} className="card p-5">
              <div className={`w-11 h-11 rounded-lg flex items-center justify-center ${c.color}`}>
                <c.icon size={20} />
              </div>
              <p className="text-2xl font-bold text-navy mt-4">{c.value}</p>
              <p className="text-sm text-gray-500">{c.label}</p>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mt-8">
          {/* Tren Pendapatan 14 hari */}
          <div className="lg:col-span-2 card p-6">
            <h2 className="font-bold text-navy mb-1">Tren Pendapatan (14 Hari Terakhir)</h2>
            <p className="text-xs text-gray-400 mb-6">Dari pesanan berstatus dibayar/diproses/dikirim/selesai</p>
            {data.revenueByDay.length === 0 ? (
              <p className="text-gray-400 text-sm py-10 text-center">Belum ada transaksi pada rentang ini.</p>
            ) : (
              <div className="flex items-end gap-2 h-48">
                {data.revenueByDay.map(d => (
                  <div key={d.date} className="flex-1 flex flex-col items-center justify-end h-full group relative">
                    <div
                      className="w-full bg-brand-orange/80 hover:bg-brand-orange rounded-t-md transition-colors relative"
                      style={{ height: `${Math.max(4, (Number(d.revenue) / maxRevenue) * 100)}%` }}
                    >
                      <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] text-gray-500 opacity-0 group-hover:opacity-100 whitespace-nowrap transition-opacity">
                        {formatRupiah(d.revenue)}
                      </span>
                    </div>
                    <span className="text-[10px] text-gray-400 mt-2 rotate-0">
                      {new Date(d.date).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit' })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Status Pesanan */}
          <div className="card p-6">
            <h2 className="font-bold text-navy mb-6">Status Pesanan</h2>
            <div className="space-y-3">
              {data.statusBreakdown.length === 0 ? (
                <p className="text-gray-400 text-sm">Belum ada pesanan.</p>
              ) : data.statusBreakdown.map(s => (
                <div key={s.status}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-600">{STATUS_LABEL[s.status] || s.status}</span>
                    <span className="font-semibold text-navy">{s.count}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-navy rounded-full" style={{ width: `${(s.count / maxStatusCount) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Produk Terlaris */}
        <div className="card p-6 mt-6">
          <h2 className="font-bold text-navy mb-6">5 Produk Terlaris</h2>
          {data.topProducts.length === 0 ? (
            <p className="text-gray-400 text-sm">Belum ada produk terjual.</p>
          ) : (
            <div className="space-y-4">
              {data.topProducts.map((p, i) => (
                <div key={p.id} className="flex items-center gap-4">
                  <span className="w-6 text-center font-bold text-gray-300">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-navy truncate">{p.name}</p>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mt-1.5">
                      <div className="h-full bg-brand-orange rounded-full" style={{ width: `${(Number(p.total_sold) / maxSold) * 100}%` }} />
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-semibold text-navy">{p.total_sold} terjual</p>
                    <p className="text-xs text-gray-400">{formatRupiah(p.total_revenue)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
