import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ImagePlus } from 'lucide-react';
import Sidebar from '../../components/Sidebar';
import api from '../../api/axios';

export default function AddProduct() {
    useEffect(() => {
  document.title = 'Tambah Produk | StoreID'
}) 
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    name: '', description: '', price: '', stock: '', sku: '', category_id: '', compare_at_price: '',
  });
  const [specPairs, setSpecPairs] = useState([{ key: '', value: '' }]);
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [publish, setPublish] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/products/categories').then(res => setCategories(res.data.data));
    if (isEdit) {
      api.get(`/products/${id}`).then(res => {
        const p = res.data.data;
        setForm({
          name: p.name, description: p.description, price: p.price,
          stock: p.stock, sku: p.sku || '', category_id: p.category_id || '',
          compare_at_price: p.compare_at_price || '',
        });
        setPublish(Boolean(p.is_published));
        const spec = typeof p.specifications === 'string' ? JSON.parse(p.specifications || '{}') : (p.specifications || {});
        const pairs = Object.entries(spec).map(([key, value]) => ({ key, value }));
        setSpecPairs(pairs.length > 0 ? pairs : [{ key: '', value: '' }]);
      });
    }
  }, [id]);

  const updateSpecPair = (index, field, value) => {
    setSpecPairs(prev => prev.map((p, i) => i === index ? { ...p, [field]: value } : p));
  };
  const addSpecPair = () => setSpecPairs(prev => [...prev, { key: '', value: '' }]);
  const removeSpecPair = (index) => setSpecPairs(prev => prev.filter((_, i) => i !== index));

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files).slice(0, 5);
    setImages(files);
    setPreviews(files.map(f => URL.createObjectURL(f)));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.name || !form.price) {
      setError('Nama produk dan harga wajib diisi.');
      return;
    }
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      fd.append('is_published', publish);

      const specObj = {};
      specPairs.forEach(({ key, value }) => { if (key.trim()) specObj[key.trim()] = value; });
      fd.append('specifications', JSON.stringify(specObj));

      images.forEach(img => fd.append('images', img));

      if (isEdit) {
        await api.put(`/products/${id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      } else {
        await api.post('/products', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      }
      navigate('/admin/inventory');
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal menyimpan produk.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <main className="flex-1 p-8 max-w-6xl">
        <h1 className="text-3xl font-extrabold text-navy">{isEdit ? 'Edit Produk' : 'Tambah Produk'}</h1>
        <p className="text-gray-500 mt-1">Lengkapi informasi produk di bawah untuk menambahkan item baru ke etalase Anda.</p>

        {error && <div className="mt-4 bg-red-50 text-red-600 text-sm px-4 py-2.5 rounded-lg">{error}</div>}

        <form onSubmit={handleSubmit} className="mt-6 grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <div className="card p-6">
              <h2 className="font-bold text-navy mb-4">Informasi Produk</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Nama Produk</label>
                  <input className="input-field mt-1" placeholder="Contoh: Sepatu Lari Pro-Dynamic v2"
                    value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Deskripsi</label>
                  <textarea rows={5} className="input-field mt-1" placeholder="Jelaskan fitur, material, dan keunggulan produk Anda..."
                    value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
                </div>
              </div>
            </div>

            <div className="card p-6">
              <h2 className="font-bold text-navy mb-4">Harga & Stok</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Harga (Rp)</label>
                  <input type="number" className="input-field mt-1" placeholder="Rp 0"
                    value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Harga Coret (opsional)</label>
                  <input type="number" className="input-field mt-1" placeholder="Kosongkan jika tidak diskon"
                    value={form.compare_at_price} onChange={e => setForm({ ...form, compare_at_price: e.target.value })} />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Stok</label>
                  <input type="number" className="input-field mt-1" placeholder="0"
                    value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">SKU (Stock Keeping Unit)</label>
                  <input className="input-field mt-1" placeholder="TD-INV-001"
                    value={form.sku} onChange={e => setForm({ ...form, sku: e.target.value })} />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Kategori</label>
                  <select className="input-field mt-1" value={form.category_id} onChange={e => setForm({ ...form, category_id: e.target.value })}>
                    <option value="">Pilih Kategori</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div className="card p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-bold text-navy">Spesifikasi Produk</h2>
                <span className="text-xs text-gray-400">Tampil di tab "Spesifikasi" halaman detail</span>
              </div>
              <div className="space-y-3">
                {specPairs.map((pair, i) => (
                  <div key={i} className="flex gap-2">
                    <input
                      className="input-field flex-1" placeholder="Contoh: Prosesor"
                      value={pair.key} onChange={e => updateSpecPair(i, 'key', e.target.value)}
                    />
                    <input
                      className="input-field flex-1" placeholder="Contoh: Octa-core 3.2GHz"
                      value={pair.value} onChange={e => updateSpecPair(i, 'value', e.target.value)}
                    />
                    <button type="button" onClick={() => removeSpecPair(i)} className="px-3 text-gray-400 hover:text-red-500">✕</button>
                  </div>
                ))}
              </div>
              <button type="button" onClick={addSpecPair} className="text-brand-orange text-sm font-semibold mt-3 hover:underline">
                + Tambah Spesifikasi
              </button>
            </div>
          </div>

          <div className="space-y-6">
            <div className="card p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-bold text-navy">Foto Produk</h2>
                <span className="text-xs text-gray-400">Maks 5 foto</span>
              </div>
              <label className="border-2 border-dashed border-gray-200 rounded-xl h-64 flex flex-col items-center justify-center cursor-pointer hover:border-brand-orange/50 transition-colors overflow-hidden">
                {previews[0] ? (
                  <img src={previews[0]} className="w-full h-full object-cover" />
                ) : (
                  <>
                    <ImagePlus className="text-gray-400" size={28} />
                    <span className="text-navy font-semibold text-sm mt-2">Klik untuk Unggah</span>
                    <span className="text-xs text-gray-400 mt-1">Format: JPG, PNG (Max 5MB)</span>
                  </>
                )}
                <input type="file" accept="image/jpeg,image/png" multiple hidden onChange={handleImageChange} />
              </label>
              <div className="grid grid-cols-3 gap-2 mt-3">
                {previews.slice(1, 4).map((src, i) => (
                  <div key={i} className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                    <img src={src} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>

            <div className="card p-6 space-y-3">
              <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-60">
                {loading ? 'Menyimpan...' : 'Simpan Produk'}
              </button>
              <button type="button" onClick={() => navigate('/admin/inventory')} className="btn-outline w-full">Batal</button>
              <p className="text-xs text-gray-400 text-center">
                Dengan menyimpan, Anda menyetujui syarat & ketentuan penjualan TokoDinamis.
              </p>
            </div>

            <div className="card p-6">
              <h2 className="font-bold text-navy mb-3">Status Visibilitas</h2>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Publikasikan Langsung</span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={publish}
                  onClick={() => setPublish(prev => !prev)}
                  className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${publish ? 'bg-brand-orange' : 'bg-gray-200'}`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${publish ? 'translate-x-5' : ''}`} />
                </button>
              </div>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
