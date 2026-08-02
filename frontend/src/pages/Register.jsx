import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Calendar } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Register() {

  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '', whatsapp: '', birth_date: '', email: '',
    password: '', confirm_password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const update = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm_password) {
      setError('Password dan konfirmasi password tidak sama.');
      return;
    }
    setLoading(true);
    try {
      await register(form);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registrasi gagal. Coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <header className="px-8 py-6 flex justify-between items-center max-w-4xl mx-auto">
        <span className="text-xl font-extrabold text-navy">StoreID</span>
      </header>

      <div className="max-w-md mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-16">
        <h1 className="text-2xl font-bold text-navy text-center">Belum mempunyai akun?</h1>
        <p className="text-gray-500 text-sm text-center mt-1">Daftar akun terlebih dahulu</p>

        {error && <div className="mt-4 bg-red-50 text-red-600 text-sm px-4 py-2.5 rounded-lg">{error}</div>}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Nama Lengkap</label>
            <input required className="input-field mt-1" placeholder="Nama Anda" value={form.name} onChange={update('name')} />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">No. WhatsApp</label>
            <input required className="input-field mt-1" placeholder="08354xxxx" value={form.whatsapp} onChange={update('whatsapp')} />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Tanggal Lahir</label>
            <div className="relative">
              <input type="date" className="input-field mt-1 pr-10" value={form.birth_date} onChange={update('birth_date')} />
              <Calendar size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Email</label>
            <input type="email" required className="input-field mt-1" placeholder="nama@gmail.com" value={form.email} onChange={update('email')} />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Password</label>
            <input type="password" required minLength={8} className="input-field mt-1" placeholder="••••••••" value={form.password} onChange={update('password')} />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Konfirmasi Password</label>
            <input type="password" required className="input-field mt-1" placeholder="••••••••" value={form.confirm_password} onChange={update('confirm_password')} />
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-60">
            {loading ? 'Memproses...' : 'Daftar'}
          </button>
        </form>

        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-gray-200" /><span className="text-xs text-gray-400">atau</span><div className="flex-1 h-px bg-gray-200" />
        </div>

        <p className="text-center text-sm text-gray-500">
          Sudah mempunyai akun?{' '}
          <Link to="/login" className="text-brand-orange font-semibold hover:underline">Login Sekarang</Link>
        </p>
      </div>
    </div>
  );
}
