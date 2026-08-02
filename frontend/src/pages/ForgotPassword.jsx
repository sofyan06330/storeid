import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

export default function ForgotPassword() {
  
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setMessage('');
    setLoading(true);
    try {
      const res = await api.post('/auth/forgot-password', { email });
      setMessage(res.data.message);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal mengirim tautan reset password.');
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
          <h1 className="text-2xl font-bold text-navy text-center">Lupa Password?</h1>
          <p className="text-gray-500 text-sm text-center mt-1">Masukkan email Anda, kami akan mengirim tautan reset password.</p>

          {message && <div className="mt-4 bg-green-50 text-green-700 text-sm px-4 py-2.5 rounded-lg">{message}</div>}
          {error && <div className="mt-4 bg-red-50 text-red-600 text-sm px-4 py-2.5 rounded-lg">{error}</div>}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Email</label>
              <input type="email" required className="input-field mt-1" placeholder="nama@gmail.com"
                value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-60">
              {loading ? 'Mengirim...' : 'Reset Sekarang'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Ingat password Anda?{' '}
            <Link to="/login" className="text-brand-orange font-semibold hover:underline">Kembali ke Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
