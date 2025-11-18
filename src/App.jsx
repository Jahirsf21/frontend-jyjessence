import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import { ToastContainer } from 'react-toastify';
import Header from './components/header';
import Footer from './components/footer';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import MiInformacion from './pages/account/MiInformacion';
import Cart from './pages/cart/Cart';
import Orders from './pages/cart/Orders';
import Accessibility from './pages/Accessibility';
import Dashboard from './pages/admin/Dashboard';
import ProductsManagement from './pages/admin/ProductsManagement';
import ProductForm from './pages/admin/ProductForm';
import ClientsManagement from './pages/admin/ClientsManagement';
import OrdersManagement from './pages/admin/OrdersManagement';
import ButtonNav from './components/ui/ButtonNav';
import SearchPanel from './components/ui/SearchPanel';
import { SearchPanelProvider } from './context/SearchPanelContext';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, 
    },
  },
});

function AppLayout() {
  const location = useLocation();
  const rutasAutenticacion = ['/auth/login', '/auth/register'];
  const ocultarHeader = rutasAutenticacion.includes(location.pathname);

  React.useEffect(() => {
    if ('scrollRestoration' in window.history) {
      const prev = window.history.scrollRestoration;
      window.history.scrollRestoration = 'manual';
      return () => {
        window.history.scrollRestoration = prev;
      };
    }
  }, []);

  React.useEffect(() => {
    setTimeout(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    }, 0);
  }, [location.pathname]);

  return (
    <>
      {!ocultarHeader && <Header />}
      <main className={!ocultarHeader ? "w-full px-4 py-8" : ""}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/auth/login" element={<Login />} />
          <Route path="/auth/register" element={<Register />} />
          <Route path="/account/mi-informacion" element={<ProtectedRoute><MiInformacion /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute requiredRole="ADMIN"><Dashboard /></ProtectedRoute>}>
            <Route index element={<Navigate to="/admin/products" replace />} />
            <Route path="products">
              <Route index element={<ProductsManagement />} />
              <Route path="new" element={<ProductForm />} />
              <Route path="edit/:id" element={<ProductForm />} />
            </Route>
            <Route path="clients" element={<ClientsManagement />} />
            <Route path="orders" element={<OrdersManagement />} />
          </Route>
          <Route path="/cart" element={<Cart />} />
          <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
          <Route path="/accessibility" element={<Accessibility />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <SearchPanel />
      <ButtonNav />
      <Footer />
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SearchPanelProvider>
          <Router>
            <AppLayout />
            <ToastContainer
              position="top-right"
              autoClose={3000}
              hideProgressBar={false}
              newestOnTop={false}
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="light"
            />
          </Router>
        </SearchPanelProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;