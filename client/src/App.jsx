import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import About from './pages/About';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import Profile from './pages/Profile';
import Header from './components/Header';
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';
import AdminLayout from './components/AdminLayout';
import AdminSignIn from './pages/AdminSignIn';
import AdminDashboard from './pages/admin/AdminDashboard';
import Users from './pages/admin/Users';
import Security from './pages/admin/Security';
import Sessions from './pages/admin/Sessions';
import Authentication from './pages/admin/Authentication';
import Analytics from './pages/admin/Analytics';
import Settings from './pages/admin/Settings';
import UserDetail from './pages/admin/UserDetail';

function AppShell() {
  const { pathname } = useLocation();
  const isAdmin = pathname.startsWith('/admin');

  return (
    <>
      {!isAdmin && <Header />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/sign-in" element={<SignIn />} />
        <Route path="/sign-up" element={<SignUp />} />
        <Route element={<PrivateRoute />}>
          <Route path="/profile" element={<Profile />} />
        </Route>
        <Route path="/admin/sign-in" element={<AdminSignIn />} />
        <Route element={<AdminRoute />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<Users />} />
            <Route path="/admin/users/:id" element={<UserDetail />} />
            <Route path="/admin/security" element={<Security />} />
            <Route path="/admin/sessions" element={<Sessions />} />
            <Route path="/admin/authentication" element={<Authentication />} />
            <Route path="/admin/analytics" element={<Analytics />} />
            <Route path="/admin/settings" element={<Settings />} />
          </Route>
        </Route>
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  );
}
