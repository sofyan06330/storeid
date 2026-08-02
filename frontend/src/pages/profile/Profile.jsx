import { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

export default function Profile() {
  useEffect(() => {
  document.title = 'Profil | StoreID'
}) 
  const { setUser } = useAuth();
  const [profile, setProfile] = useState({ name: '', whatsapp: '', birth_date: '', email: '' });
  const [pwd, setPwd] = useState({ old_password: '', new_password: '', confirm_password: '' });
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [pwdMsg, setPwdMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    api.get('/auth/me').then(res => setProfile(res.data.data));
  }, []);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setMsg({ type: '', text: '' });
    try {
      const res = await api.put('/auth/update-profile', profile);
      setMsg({ type: 'success', text: res.data.message });
      const stored = JSON.parse(localStorage.getItem('td_user'));
      const updated = { ...stored, name: profile.name };
      localStorage.setItem('td_user', JSON.stringify(updated));
      setUser(updated);
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Gagal memperbarui profil.' });
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setPwdMsg({ type: '', text: '' });
    if (pwd.new_password !== pwd.confirm_password) {
      setPwdMsg({ type: 'error', text: 'Password baru dan konfirmasi tidak sama.' });
      return;
    }
    try {
      const res = await api.put('/auth/update-password', pwd);
      setPwdMsg({ type: 'success', text: res.data.message });
      setPwd({ old_password: '', new_password: '', confirm_password: '' });
    } catch (err) {
      setPwdMsg({ type: 'error', text: err.response?.data?.message || 'Gagal memperbarui password.' });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-2xl mx-auto px-6 py-10 space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-navy mb-6">Profil Saya</h1>
          <div className="card p-6">
            {msg.text && <div className={`mb-4 text-sm px-4 py-2.5 rounded-lg ${msg.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>{msg.text}</div>}
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Nama Lengkap</label>
                <input className="input-field mt-1" value={profile.name || ''} onChange={e => setProfile({ ...profile, name: e.target.value })} />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">No. WhatsApp</label>
                <input className="input-field mt-1" value={profile.whatsapp || ''} onChange={e => setProfile({ ...profile, whatsapp: e.target.value })} />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Email</label>
                <input disabled className="input-field mt-1 opacity-60" value={profile.email || ''} />
              </div>
              <button className="btn-primary">Simpan Perubahan</button>
            </form>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-bold text-navy mb-4">Ubah Password</h2>
          <div className="card p-6">
            {pwdMsg.text && <div className={`mb-4 text-sm px-4 py-2.5 rounded-lg ${pwdMsg.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>{pwdMsg.text}</div>}
            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Password Lama</label>
                <input type="password" className="input-field mt-1" value={pwd.old_password} onChange={e => setPwd({ ...pwd, old_password: e.target.value })} />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Password Baru</label>
                <input type="password" className="input-field mt-1" value={pwd.new_password} onChange={e => setPwd({ ...pwd, new_password: e.target.value })} />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Konfirmasi Password Baru</label>
                <input type="password" className="input-field mt-1" value={pwd.confirm_password} onChange={e => setPwd({ ...pwd, confirm_password: e.target.value })} />
              </div>
              <button className="btn-outline">Ubah Password</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
