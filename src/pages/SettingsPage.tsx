import { useState } from 'react';
import { Moon, Sun, Bell, Lock, Shield, Globe, ArrowLeft, Save, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import Navbar from '../components/Navbar';

export default function SettingsPage() {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: false,
    smsNotifications: false,
    complaintUpdates: true,
    adminMessages: true,
    language: 'id',
    twoFactorAuth: false
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSettingChange = (key: string) => {
    setSettings({ ...settings, [key]: !settings[key as keyof typeof settings] });
  };

  const handlePasswordChange = () => {
    setError('');
    setSuccess('');

    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setError('Semua field password harus diisi');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('Password baru dan konfirmasi password tidak cocok');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setError('Password baru minimal 6 karakter');
      return;
    }

    setLoading(true);

    // Simulasi API call - ganti dengan implementasi Supabase
    setTimeout(() => {
      setSuccess('Password berhasil diubah!');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setLoading(false);
      setTimeout(() => setSuccess(''), 3000);
    }, 1000);
  };

  const handleSaveSettings = () => {
    setLoading(true);
    // Simulasi save settings - ganti dengan implementasi Supabase
    setTimeout(() => {
      setSuccess('Pengaturan berhasil disimpan!');
      setLoading(false);
      setTimeout(() => setSuccess(''), 3000);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar currentPage="settings" onNavigate={(page) => window.location.href = `#${page}`} />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with Back Button */}
        <button
          onClick={() => window.history.back()}
          className="flex items-center space-x-2 mb-6 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="font-medium">Kembali ke Dashboard</span>
        </button>

        {/* Alert Messages */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center space-x-3">
            <div className="flex-shrink-0 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <span className="text-white text-lg">✓</span>
            </div>
            <p className="text-green-800 dark:text-green-200">{success}</p>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center space-x-3">
            <div className="flex-shrink-0 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-white text-lg">✕</span>
            </div>
            <p className="text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        {/* Page Header */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-blue-500 to-indigo-500 px-8 py-12">
            <h1 className="text-3xl font-bold text-white mb-2">Pengaturan</h1>
            <p className="text-blue-50">Kelola preferensi dan keamanan akun Anda</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Sidebar Navigation */}
          <div className="space-y-3">
            {[
              { id: 'appearance', icon: Sun, label: 'Tampilan' },
              { id: 'notifications', icon: Bell, label: 'Notifikasi' },
              { id: 'security', icon: Lock, label: 'Keamanan' },
              { id: 'privacy', icon: Shield, label: 'Privasi' },
              { id: 'language', icon: Globe, label: 'Bahasa' }
            ].map((item) => (
              <button
                key={item.id}
                className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white shadow-md"
              >
                <item.icon className="h-5 w-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Appearance Section */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                <Sun className="h-6 w-6 mr-2 text-yellow-500" />
                Tampilan
              </h2>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    {theme === 'dark' ? (
                      <Moon className="h-5 w-5 text-indigo-400" />
                    ) : (
                      <Sun className="h-5 w-5 text-yellow-500" />
                    )}
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        Mode Gelap
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {theme === 'dark' ? 'Aktif' : 'Nonaktif'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      toggleTheme();
                      setSuccess('Tema berhasil diubah!');
                      setTimeout(() => setSuccess(''), 3000);
                    }}
                    className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors ${
                      theme === 'dark' ? 'bg-indigo-600' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                        theme === 'dark' ? 'translate-x-8' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Notifications Section */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                <Bell className="h-6 w-6 mr-2 text-blue-500" />
                Notifikasi
              </h2>

              <div className="space-y-3">
                {[
                  { key: 'emailNotifications', label: 'Notifikasi Email', desc: 'Terima pembaruan via email' },
                  { key: 'pushNotifications', label: 'Notifikasi Push', desc: 'Notifikasi browser dan aplikasi' },
                  { key: 'smsNotifications', label: 'Notifikasi SMS', desc: 'Terima SMS untuk laporan penting' },
                  { key: 'complaintUpdates', label: 'Update Laporan', desc: 'Pemberitahuan status laporan' },
                  { key: 'adminMessages', label: 'Pesan Admin', desc: 'Tanggapan dari admin desa' }
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {item.label}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {item.desc}
                      </p>
                    </div>
                    <button
                      onClick={() => handleSettingChange(item.key)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        settings[item.key as keyof typeof settings] ? 'bg-blue-600' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          settings[item.key as keyof typeof settings] ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>

              <button
                onClick={handleSaveSettings}
                disabled={loading}
                className="w-full mt-4 px-6 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2"
              >
                <Save className="h-5 w-5" />
                <span>{loading ? 'Menyimpan...' : 'Simpan Pengaturan'}</span>
              </button>
            </div>

            {/* Security Section */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                <Lock className="h-6 w-6 mr-2 text-red-500" />
                Keamanan
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Password Saat Ini
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? 'text' : 'password'}
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                      className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      placeholder="Masukkan password saat ini"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2"
                    >
                      {showCurrentPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Password Baru
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      placeholder="Masukkan password baru"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2"
                    >
                      {showNewPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Konfirmasi Password Baru
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      placeholder="Ulangi password baru"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>

                <button
                  onClick={handlePasswordChange}
                  disabled={loading}
                  className="w-full px-6 py-3 bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white rounded-lg font-semibold transition-colors"
                >
                  {loading ? 'Mengubah Password...' : 'Ubah Password'}
                </button>
              </div>

              <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      Autentikasi Dua Faktor
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Tambahan lapisan keamanan untuk akun Anda
                    </p>
                  </div>
                  <button
                    onClick={() => handleSettingChange('twoFactorAuth')}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.twoFactorAuth ? 'bg-green-600' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.twoFactorAuth ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Privacy Section */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                <Shield className="h-6 w-6 mr-2 text-green-500" />
                Privasi
              </h2>

              <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <p className="text-sm text-green-800 dark:text-green-200">
                  <strong>Data Anda Aman:</strong> Semua data pribadi Anda dilindungi sesuai kebijakan privasi kami.
                  NIK dan alamat Anda tidak dapat diubah tanpa verifikasi admin desa untuk keamanan.
                </p>
              </div>
            </div>

            {/* Language Section */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                <Globe className="h-6 w-6 mr-2 text-purple-500" />
                Bahasa
              </h2>

              <select
                value={settings.language}
                onChange={(e) => setSettings({ ...settings, language: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
              >
                <option value="id">Bahasa Indonesia</option>
                <option value="en">English</option>
                <option value="jv">Basa Jawa</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
