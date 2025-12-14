import { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, CreditCard, ArrowLeft, Camera, Save, X, Shield, Calendar } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import Navbar from '../components/Navbar';

export default function ProfilePage() {
  const { user, profile, refreshProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    email: '',
    phone: '',
    avatar_url: ''
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (profile) {
      setEditData({
        email: user?.email || '',
        phone: profile.phone || '',
        avatar_url: profile.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.full_name)}&background=10b981&color=fff&size=200`
      });
    }
  }, [profile, user]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setError('Ukuran file maksimal 2MB');
        return;
      }

      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
      setError('');
    }
  };

  const uploadAvatar = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user?.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading avatar:', error);
      return null;
    }
  };

  const handleSave = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      let avatarUrl = editData.avatar_url;

      // Upload avatar jika ada gambar baru
      if (imageFile) {
        const uploadedUrl = await uploadAvatar(imageFile);
        if (uploadedUrl) {
          avatarUrl = uploadedUrl;
        } else {
          throw new Error('Gagal mengupload foto profil');
        }
      }

      // Update profile di database
      const { error: updateError } = await supabase
        .from('users')
        .update({
          phone: editData.phone,
          avatar_url: avatarUrl
        })
        .eq('id', user?.id);

      if (updateError) throw updateError;

      // Update email jika berbeda
      if (editData.email !== user?.email) {
        const { error: emailError } = await supabase.auth.updateUser({
          email: editData.email
        });
        if (emailError) throw emailError;
      }

      await refreshProfile();
      setSuccess('Profil berhasil diperbarui!');
      setIsEditing(false);
      setPreviewImage(null);
      setImageFile(null);

      setTimeout(() => setSuccess(''), 3000);
    } catch (error: any) {
      console.error('Error updating profile:', error);
      setError(error.message || 'Gagal memperbarui profil. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditData({
      email: user?.email || '',
      phone: profile?.phone || '',
      avatar_url: profile?.avatar_url || ''
    });
    setPreviewImage(null);
    setImageFile(null);
    setIsEditing(false);
    setError('');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-2 border-emerald-500"></div>
          <p className="text-gray-600 dark:text-gray-400 mt-4 text-lg">Memuat profil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar currentPage="profile" onNavigate={(page) => window.location.href = `#${page}`} />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
            <X className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0" />
            <p className="text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        {/* Profile Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-emerald-500 to-teal-500 px-8 py-12 relative">
            <div className="absolute top-4 right-4">
              <span className="px-3 py-1 bg-white/30 backdrop-blur-sm text-white text-sm font-medium rounded-full capitalize">
                {profile.role === 'admin' ? 'Admin' : 'Warga'}
              </span>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Profil Saya</h1>
            <p className="text-emerald-50">Kelola informasi profil Anda</p>
          </div>

          <div className="px-8 py-8">
            {/* Avatar Section */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6 mb-8 pb-8 border-b dark:border-gray-700">
              <div className="relative">
                <div className="w-32 h-32 rounded-full overflow-hidden bg-gradient-to-br from-emerald-400 to-teal-500 p-1">
                  <img
                    src={previewImage || editData.avatar_url}
                    alt={profile.full_name}
                    className="w-full h-full rounded-full object-cover bg-white dark:bg-gray-700"
                  />
                </div>
                {isEditing && (
                  <label className="absolute bottom-0 right-0 w-10 h-10 bg-emerald-500 hover:bg-emerald-600 rounded-full flex items-center justify-center cursor-pointer shadow-lg transition-all hover:scale-110">
                    <Camera className="h-5 w-5 text-white" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                  {profile.full_name}
                </h2>
                <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400">
                  <Shield className="h-4 w-4" />
                  <span className="text-sm">NIK: {profile.nik}</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400 mt-1">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm">Bergabung: {formatDate(profile.created_at)}</span>
                </div>
              </div>

              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-medium transition-colors shadow-md hover:shadow-lg"
                >
                  Edit Profil
                </button>
              )}
            </div>

            {/* Information Grid */}
            <div className="space-y-6">
              {/* NIK - Read Only */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Nomor Induk Kependudukan (NIK)
                </label>
                <div className="flex items-center space-x-3 px-4 py-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                  <CreditCard className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                  <span className="font-mono text-gray-900 dark:text-gray-200">{profile.nik}</span>
                  <span className="ml-auto px-2 py-0.5 bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 text-xs rounded">
                    Tidak dapat diubah
                  </span>
                </div>
              </div>

              {/* Email - Editable */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Alamat Email
                </label>
                {isEditing ? (
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500 dark:text-gray-400" />
                    <input
                      type="email"
                      value={editData.email}
                      onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
                      placeholder="email@example.com"
                    />
                  </div>
                ) : (
                  <div className="flex items-center space-x-3 px-4 py-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                    <Mail className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                    <span className="text-gray-900 dark:text-gray-200">{user?.email}</span>
                  </div>
                )}
              </div>

              {/* Phone - Editable */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Nomor Telepon / WhatsApp
                </label>
                {isEditing ? (
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500 dark:text-gray-400" />
                    <input
                      type="tel"
                      value={editData.phone}
                      onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
                      placeholder="0812-3456-7890"
                    />
                  </div>
                ) : (
                  <div className="flex items-center space-x-3 px-4 py-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                    <Phone className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                    <span className="text-gray-900 dark:text-gray-200">{profile.phone || '-'}</span>
                  </div>
                )}
              </div>

              {/* Address - Read Only */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Alamat Lengkap
                </label>
                <div className="flex items-start space-x-3 px-4 py-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                  <MapPin className="h-5 w-5 text-gray-500 dark:text-gray-400 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-900 dark:text-gray-200">{profile.address}</span>
                  <span className="ml-auto px-2 py-0.5 bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 text-xs rounded whitespace-nowrap">
                    Tidak dapat diubah
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              {isEditing && (
                <div className="flex space-x-4 pt-4">
                  <button
                    onClick={handleSave}
                    disabled={loading}
                    className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-400 text-white rounded-lg font-semibold transition-all shadow-md hover:shadow-lg"
                  >
                    <Save className="h-5 w-5" />
                    <span>{loading ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
                  </button>
                  <button
                    onClick={handleCancel}
                    disabled={loading}
                    className="flex-1 px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg font-semibold transition-all"
                  >
                    Batal
                  </button>
                </div>
              )}
            </div>

            {/* Info Box */}
            <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center mt-0.5">
                  <span className="text-white text-xs">ℹ</span>
                </div>
                <div>
                  <p className="text-sm text-blue-900 dark:text-blue-200 font-semibold mb-1">
                    Informasi Penting
                  </p>
                  <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
                    <li>• Data NIK dan Alamat tidak dapat diubah untuk keamanan data</li>
                    <li>• Untuk mengubah NIK atau Alamat, hubungi admin desa</li>
                    <li>• Foto profil maksimal 2MB (format: JPG, PNG)</li>
                    <li>• Pastikan nomor telepon aktif untuk notifikasi laporan</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
