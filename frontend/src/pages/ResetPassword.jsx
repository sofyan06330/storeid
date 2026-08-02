import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api/axios';

export default function ResetPassword() {
  
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get('token') || '';
  const email = params.get('email') || '';

  const [form, setForm] = useState({ password: '', confirm_password: '' });
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setMessage('');
    if (form.password !== form.confirm_password) {
      setError('Password dan konfirmasi password tidak sama.');
      return;
    }
    setLoading(true);
    try {
      const res = await api.post('/auth/reset-password', { email, token, ...form });
      setMessage(res.data.message);
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal mereset password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="px-8 py-6">
        <Link to="/" className="text-xl font-extrabold text-navy">StoreID</Link>
      </header>
      <div className="flex-1 flex items-center justify-center px-4 pb-16">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h1 className="text-2xl font-bold text-navy text-center">Buat Password Baru</h1>
          <p className="text-gray-500 text-sm text-center mt-1">Untuk akun {email || 'Anda'}</p>

          {message && <div className="mt-4 bg-green-50 text-green-700 text-sm px-4 py-2.5 rounded-lg">{message}</div>}
          {error && <div className="mt-4 bg-red-50 text-red-600 text-sm px-4 py-2.5 rounded-lg">{error}</div>}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Password Baru</label>
              <input type="password" required minLength={8} className="input-field mt-1" placeholder="••••••••"
                value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Konfirmasi Password Baru</label>
              <input type="password" required className="input-field mt-1" placeholder="••••••••"
                value={form.confirm_password} onChange={e => setForm({ ...form, confirm_password: e.target.value })} />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-60">
              {loading ? 'Menyimpan...' : 'Simpan Password Baru'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
