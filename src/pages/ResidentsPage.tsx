import { useState, useEffect } from 'react';
import { Users, Search, Filter, X, Mail, Phone, MapPin, CreditCard, Calendar, ArrowLeft, Eye } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { User } from '../lib/types';
import Navbar from '../components/Navbar';

interface ResidentsPageProps {
  onNavigate: (page: string) => void;
}

export default function ResidentsPage({ onNavigate }: ResidentsPageProps) {
  const [residents, setResidents] = useState<User[]>([]);
  const [filteredResidents, setFilteredResidents] = useState<User[]>([]);
  const [selectedResident, setSelectedResident] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResidents();
  }, []);

  const fetchResidents = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('role', 'user')
        .order('full_name', { ascending: true });

      if (error) throw error;

      const residentsData = (data as User[]).map(resident => ({
        ...resident,
        avatar_url: resident.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(resident.full_name)}&background=10b981&color=fff&size=200`
      }));

      setResidents(residentsData);
      setFilteredResidents(residentsData);
    } catch (error) {
      console.error('Error fetching residents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    if (!term) {
      setFilteredResidents(residents);
      return;
    }

    const filtered = residents.filter(resident =>
      resident.full_name.toLowerCase().includes(term.toLowerCase()) ||
      resident.nik.includes(term) ||
      (resident.phone && resident.phone.includes(term))
    );
    setFilteredResidents(filtered);
  };

  const handleSort = (sortType: string) => {
    setSortBy(sortType);
    const sorted = [...filteredResidents].sort((a, b) => {
      switch(sortType) {
        case 'name':
          return a.full_name.localeCompare(b.full_name);
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        default:
          return 0;
      }
    });
    setFilteredResidents(sorted);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar currentPage="users" onNavigate={onNavigate} />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
            <p className="text-gray-600 dark:text-gray-400 mt-4">Memuat data warga...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar currentPage="users" onNavigate={onNavigate} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => onNavigate('admin-dashboard')}
            className="flex items-center space-x-2 mb-4 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="font-medium">Kembali ke Dashboard</span>
          </button>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Data Warga
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Kelola dan lihat data seluruh warga terdaftar
              </p>
            </div>
            <div className="px-6 py-3 bg-white dark:bg-gray-800 rounded-xl shadow-md">
              <div className="flex items-center space-x-3">
                <Users className="h-8 w-8 text-emerald-500" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Total Warga
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {residents.length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* List Panel */}
          <div className={`${selectedResident ? 'lg:col-span-1' : 'lg:col-span-3'} bg-white dark:bg-gray-800 rounded-xl shadow-md`}>
            <div className="p-6">
              {/* Search and Filter */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500 dark:text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                    placeholder="Cari nama, NIK, atau telepon..."
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => handleSearch('')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2"
                    >
                      <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    </button>
                  )}
                </div>

                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500 dark:text-gray-400" />
                  <select
                    value={sortBy}
                    onChange={(e) => handleSort(e.target.value)}
                    className="pl-10 pr-8 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none appearance-none cursor-pointer"
                  >
                    <option value="name">Urutkan: Nama</option>
                    <option value="newest">Urutkan: Terbaru</option>
                  </select>
                </div>
              </div>

              {/* Residents List */}
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {filteredResidents.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="h-16 w-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                    <p className="text-gray-600 dark:text-gray-400">
                      Tidak ada data warga yang sesuai
                    </p>
                  </div>
                ) : (
                  filteredResidents.map((resident) => (
                    <div
                      key={resident.id}
                      onClick={() => setSelectedResident(resident)}
                      className={`flex items-center space-x-4 p-4 rounded-lg cursor-pointer transition-all ${
                        selectedResident?.id === resident.id
                          ? 'bg-emerald-50 dark:bg-emerald-900/20 border-2 border-emerald-500'
                          : 'bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600'
                      }`}
                    >
                      <img
                        src={resident.avatar_url}
                        alt={resident.full_name}
                        className="w-14 h-14 rounded-full object-cover border-2 border-white dark:border-gray-700 shadow-md"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                          {resident.full_name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                          NIK: {resident.nik}
                        </p>
                      </div>
                      <Eye className="h-5 w-5 text-gray-400" />
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Detail Panel */}
          {selectedResident && (
            <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-md">
              <div className="p-6">
                <div className="flex items-start justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Detail Warga
                  </h2>
                  <button
                    onClick={() => setSelectedResident(null)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <X className="h-5 w-5 text-gray-500" />
                  </button>
                </div>

                {/* Profile Section */}
                <div className="flex items-start space-x-6 mb-8 pb-8 border-b dark:border-gray-700">
                  <img
                    src={selectedResident.avatar_url}
                    alt={selectedResident.full_name}
                    className="w-24 h-24 rounded-full object-cover border-4 border-white dark:border-gray-700 shadow-lg"
                  />
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      {selectedResident.full_name}
                    </h3>
                    <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400 mb-3">
                      <Calendar className="h-4 w-4" />
                      <span>Bergabung: {formatDate(selectedResident.created_at)}</span>
                    </div>
                  </div>
                </div>

                {/* Information Details */}
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Nomor Induk Kependudukan (NIK)
                    </label>
                    <div className="flex items-center space-x-3 px-4 py-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                      <CreditCard className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                      <span className="font-mono text-gray-900 dark:text-gray-200">
                        {selectedResident.nik}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Nomor Telepon / WhatsApp
                    </label>
                    <div className="flex items-center space-x-3 px-4 py-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                      <Phone className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                      <span className="text-gray-900 dark:text-gray-200">
                        {selectedResident.phone || '-'}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Alamat Lengkap
                    </label>
                    <div className="flex items-start space-x-3 px-4 py-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                      <MapPin className="h-5 w-5 text-gray-500 dark:text-gray-400 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-900 dark:text-gray-200">
                        {selectedResident.address}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
