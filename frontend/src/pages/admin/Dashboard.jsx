import { useEffect, useState } from 'react';
import { Package, ShoppingCart, DollarSign, Users } from 'lucide-react';
import Sidebar from '../../components/Sidebar';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

const formatRupiah = (n) => 'Rp ' + Number(n || 0).toLocaleString('id-ID');

export default function Dashboard() {
    useEffect(() => {
  document.title = 'Beranda Admin | StoreID'
}) 
  const { user } = useAuth();
  const [stats, setStats] = useState({ products: 0, orders: 0, revenue: 0 });

  useEffect(() => {
    Promise.all([
      api.get('/products', { params: { publishedOnly: 'false', limit: 1000 } }),
      api.get('/orders'),
    ]).then(([prodRes, orderRes]) => {
      const orders = orderRes.data.data;
      const revenue = orders.filter(o => o.status === 'paid' || o.status === 'completed')
        .reduce((sum, o) => sum + Number(o.total_amount), 0);
      setStats({ products: prodRes.data.data.pagination.total, orders: orders.length, revenue });
    }).catch(() => {});
  }, []);

  const cards = [
    { label: 'Total Produk', value: stats.products, icon: Package, color: 'bg-blue-50 text-blue-600' },
    { label: 'Total Pesanan', value: stats.orders, icon: ShoppingCart, color: 'bg-orange-50 text-brand-orange' },
    { label: 'Pendapatan', value: formatRupiah(stats.revenue), icon: DollarSign, color: 'bg-green-50 text-green-600' },
    { label: 'Pelanggan Aktif', value: '-', icon: Users, color: 'bg-purple-50 text-purple-600' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <main className="flex-1 p-8">
        <h1 className="text-3xl font-extrabold text-navy">Selamat Datang, {user?.name}</h1>
        <p className="text-gray-500 mt-1">Ringkasan performa toko Anda hari ini.</p>

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
      </main>
    </div>
  );
}
