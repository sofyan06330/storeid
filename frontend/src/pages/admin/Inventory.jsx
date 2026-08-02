import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Pencil, Trash2 } from 'lucide-react';
import Sidebar from '../../components/Sidebar';
import api from '../../api/axios';

const formatRupiah = (n) => 'Rp ' + Number(n).toLocaleString('id-ID');

export default function Inventory() {
    useEffect(() => {
  document.title = 'Inventory | StoreID'
}) 
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    api.get('/products', { params: { publishedOnly: 'false', limit: 100 } })
      .then(res => setProducts(res.data.data.items))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id) => {
    if (!confirm('Hapus produk ini?')) return;
    await api.delete(`/products/${id}`);
    load();
  };

  const handleTogglePublish = async (id) => {
    try {
      await api.patch(`/products/${id}/publish`);
      load();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal mengubah status publikasi.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <main className="flex-1 p-8">
        <h1 className="text-3xl font-extrabold text-navy">Inventory</h1>
        <p className="text-gray-500 mt-1">Kelola seluruh produk di etalase Anda.</p>

        <div className="card mt-6 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b border-gray-100">
                <th className="p-4 font-medium">Produk</th>
                <th className="p-4 font-medium">SKU</th>
                <th className="p-4 font-medium">Harga</th>
                <th className="p-4 font-medium">Stok</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="p-6 text-center text-gray-400">Memuat...</td></tr>
              ) : products.length === 0 ? (
                <tr><td colSpan={6} className="p-6 text-center text-gray-400">Belum ada produk.</td></tr>
              ) : products.map(p => (
                <tr key={p.id} className="border-b border-gray-50 last:border-0">
                  <td className="p-4 font-medium text-navy">{p.name}</td>
                  <td className="p-4 text-gray-500">{p.sku || '-'}</td>
                  <td className="p-4">{formatRupiah(p.price)}</td>
                  <td className="p-4">{p.stock}</td>
                  <td className="p-4">
                    <button
                      onClick={() => handleTogglePublish(p.id)}
                      title="Klik untuk mengubah status publikasi"
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full transition-colors ${p.is_published ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                    >
                      {p.is_published ? 'Publik' : 'Draft'}
                    </button>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <Link to={`/admin/products/${p.id}/edit`} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"><Pencil size={16}/></Link>
                      <button onClick={() => handleDelete(p.id)} className="p-2 rounded-lg hover:bg-red-50 text-red-500"><Trash2 size={16}/></button>
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
