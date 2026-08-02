import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../api/axios';

const MIDTRANS_CLIENT_KEY = import.meta.env.VITE_MIDTRANS_CLIENT_KEY || 'SB-Mid-client-xxxxxxxxxxxxxxxxxxxx';
const MIDTRANS_SNAP_URL = import.meta.env.VITE_MIDTRANS_IS_PRODUCTION === 'true'
  ? 'https://app.midtrans.com/snap/snap.js'
  : 'https://app.sandbox.midtrans.com/snap/snap.js';

export default function Checkout() {
  useEffect(() => {
  document.title = 'Pembayaran | Demo Admin'
}) 
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const script = document.createElement('script');
    script.src = MIDTRANS_SNAP_URL;
    script.setAttribute('data-client-key', MIDTRANS_CLIENT_KEY);
    document.body.appendChild(script);
    return () => document.body.removeChild(script);
  }, []);

  const handleCheckout = async (e) => {
    e.preventDefault();
    setError('');
    if (!address.trim()) {
      setError('Alamat pengiriman wajib diisi.');
      return;
    }
    setLoading(true);
    try {
      const res = await api.post('/orders/checkout', { shipping_address: address });
      const { snap_token, order_code } = res.data.data;

      if (window.snap) {
        window.snap.pay(snap_token, {
          onSuccess: () => navigate(`/orders`),
          onPending: () => navigate(`/orders`),
          onError: () => setError('Pembayaran gagal diproses.'),
          onClose: () => setError('Anda menutup jendela pembayaran sebelum menyelesaikan transaksi.'),
        });
      } else {
        setError('Gagal memuat sistem pembayaran Midtrans.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal membuat pesanan.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-2xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-bold text-navy mb-6">Pembayaran</h1>

        {error && <div className="mb-4 bg-red-50 text-red-600 text-sm px-4 py-2.5 rounded-lg">{error}</div>}

        <form onSubmit={handleCheckout} className="card p-6 space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Alamat Pengiriman Lengkap</label>
            <textarea
              required
              rows={4}
              className="input-field mt-1"
              placeholder="Nama penerima, no. telepon, alamat lengkap, kota, kode pos..."
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>
          <p className="text-xs text-gray-400">
            Anda akan diarahkan ke halaman pembayaran Midtrans (kartu kredit, transfer bank, e-wallet, dsb).
          </p>
          <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-60">
            {loading ? 'Memproses...' : 'Bayar Sekarang'}
          </button>
        </form>
      </div>
    </div>
  );
}
