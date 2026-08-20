import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';

export default function AdminRoute() {
  const { currentAdmin } = useSelector((state) => state.admin);
  return currentAdmin ? <Outlet /> : <Navigate to="/admin/sign-in" replace />;
}
