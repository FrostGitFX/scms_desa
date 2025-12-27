import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/AdminDashboard';
import UserProfilePage from './pages/UserProfilePage';
import AdminProfilePage from './pages/AdminProfilePage';

// Import pages yang ada saja - comment yang belum ada
// import CreateComplaintPage from './pages/CreateComplaintPage';
// import MyComplaintsPage from './pages/MyComplaintsPage';
// import AllComplaintsPage from './pages/AllComplaintsPage';
// import ComplaintDetailPage from './pages/ComplaintDetailPage';
// import StatisticsPage from './pages/StatisticsPage';
// import UsersPage from './pages/UsersPage';
// import SettingsPage from './pages/SettingsPage';

function AppContent() {
  const { user, isAdmin, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState('landing');
  const [selectedComplaintId, setSelectedComplaintId] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && user) {
      // Redirect to appropriate dashboard based on role
      if (currentPage === 'landing' || currentPage === 'login' || currentPage === 'register') {
        setCurrentPage(isAdmin ? 'admin-dashboard' : 'dashboard');
      }
    } else if (!loading && !user) {
      // Redirect to landing if not authenticated
      if (currentPage !== 'landing' && currentPage !== 'login' && currentPage !== 'register') {
        setCurrentPage('landing');
      }
    }
  }, [user, loading, isAdmin]);

  const handleNavigate = (page: string, complaintId?: string) => {
    setCurrentPage(page);
    if (complaintId) {
      setSelectedComplaintId(complaintId);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center transition-colors duration-200">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
          <p className="text-gray-600 dark:text-gray-400 mt-4 text-lg">Memuat aplikasi...</p>
        </div>
      </div>
    );
  }

  // Public pages
  if (!user) {
    switch (currentPage) {
      case 'login':
        return <LoginPage onNavigate={handleNavigate} />;
      case 'register':
        return <RegisterPage onNavigate={handleNavigate} />;
      default:
        return <LandingPage onNavigate={handleNavigate} />;
    }
  }

  // Profile page - role-based routing
  if (currentPage === 'profile') {
    return isAdmin
      ? <AdminProfilePage onNavigate={handleNavigate} />
      : <UserProfilePage onNavigate={handleNavigate} />;
  }

  // Admin pages
  if (isAdmin) {
    switch (currentPage) {
      case 'admin-dashboard':
        return <AdminDashboard onNavigate={handleNavigate} />;
      // Uncomment when you have these components
      // case 'all-complaints':
      //   return <AllComplaintsPage onNavigate={handleNavigate} />;
      // case 'complaint-detail':
      //   return selectedComplaintId ? (
      //     <ComplaintDetailPage
      //       complaintId={selectedComplaintId}
      //       onNavigate={handleNavigate}
      //     />
      //   ) : (
      //     <AdminDashboard onNavigate={handleNavigate} />
      //   );
      // case 'statistics':
      //   return <StatisticsPage onNavigate={handleNavigate} />;
      // case 'users':
      //   return <UsersPage onNavigate={handleNavigate} />;
      // case 'settings':
      //   return <SettingsPage onNavigate={handleNavigate} />;
      default:
        return <AdminDashboard onNavigate={handleNavigate} />;
    }
  }

  // User pages
  switch (currentPage) {
    case 'dashboard':
      return <UserDashboard onNavigate={handleNavigate} />;
    // Uncomment when you have these components
    // case 'create-complaint':
    //   return <CreateComplaintPage onNavigate={handleNavigate} />;
    // case 'my-complaints':
    //   return <MyComplaintsPage onNavigate={handleNavigate} />;
    // case 'complaint-detail':
    //   return selectedComplaintId ? (
    //     <ComplaintDetailPage
    //       complaintId={selectedComplaintId}
    //       onNavigate={handleNavigate}
    //     />
    //   ) : (
    //     <UserDashboard onNavigate={handleNavigate} />
    //   );
    // case 'settings':
    //   return <SettingsPage onNavigate={handleNavigate} />;
    default:
      return <UserDashboard onNavigate={handleNavigate} />;
  }
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}
