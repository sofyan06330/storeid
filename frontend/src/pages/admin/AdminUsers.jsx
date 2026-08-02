import { useEffect, useState } from 'react';
import Sidebar from '../../components/Sidebar';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

export default function AdminUsers() {
    useEffect(() => {
  document.title = 'User | StoreID'
}) 
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true);
    api.get('/users')
      .then(res => setUsers(res.data.data))
      .catch(err => setError(err.response?.data?.message || 'Gagal memuat daftar akun.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleToggleStatus = async (u) => {
    const action = u.is_active ? 'menonaktifkan' : 'mengaktifkan';
    if (!confirm(`Yakin ingin ${action} akun "${u.name}"?`)) return;

    setUpdatingId(u.id);
    try {
      const res = await api.patch(`/users/${u.id}/status`);
      const newStatus = res.data.data.is_active;
      setUsers(prev => prev.map(x => x.id === u.id ? { ...x, is_active: newStatus } : x));
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal mengubah status akun.');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <main className="flex-1 p-8">
        <h1 className="text-3xl font-extrabold text-navy">Akun Terdaftar</h1>
        <p className="text-gray-500 mt-1">Kelola seluruh akun pelanggan dan admin di StoreID.</p>

        {error && <div className="mt-4 bg-red-50 text-red-600 text-sm px-4 py-2.5 rounded-lg">{error}</div>}

        <div className="card mt-6 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b border-gray-100">
                <th className="p-4 font-medium">Nama</th>
                <th className="p-4 font-medium">Email</th>
                <th className="p-4 font-medium">No. WhatsApp</th>
                <th className="p-4 font-medium">Role</th>
                <th className="p-4 font-medium">Terdaftar</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="p-6 text-center text-gray-400">Memuat...</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={7} className="p-6 text-center text-gray-400">Belum ada akun terdaftar.</td></tr>
              ) : users.map(u => (
                <tr key={u.id} className="border-b border-gray-50 last:border-0">
                  <td className="p-4 font-medium text-navy">{u.name}</td>
                  <td className="p-4 text-gray-600">{u.email}</td>
                  <td className="p-4 text-gray-600">{u.whatsapp}</td>
                  <td className="p-4">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${u.role === 'admin' ? 'bg-navy/10 text-navy' : 'bg-gray-100 text-gray-600'}`}>
                      {u.role === 'admin' ? 'Admin' : 'Pelanggan'}
                    </span>
                  </td>
                  <td className="p-4 text-gray-500">{new Date(u.created_at).toLocaleDateString('id-ID')}</td>
                  <td className="p-4">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${u.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                      {u.is_active ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </td>
                  <td className="p-4">
                    {u.id === currentUser?.id ? (
                      <span className="text-xs text-gray-400">Akun Anda</span>
                    ) : (
                      <button
                        onClick={() => handleToggleStatus(u)}
                        disabled={updatingId === u.id}
                        className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors disabled:opacity-50 ${
                          u.is_active
                            ? 'border-red-200 text-red-600 hover:bg-red-50'
                            : 'border-green-200 text-green-600 hover:bg-green-50'
                        }`}
                      >
                        {u.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                      </button>
                    )}
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
