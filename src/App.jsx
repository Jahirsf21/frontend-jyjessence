import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import { ToastContainer } from 'react-toastify';
import Header from './components/header';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import MiInformacion from './pages/account/MiInformacion';
import Cart from './pages/cart/Cart';
import Orders from './pages/cart/Orders';
import Dashboard from './pages/admin/Dashboard';
import ProductsManagement from './pages/admin/ProductsManagement';
import ClientsManagement from './pages/admin/ClientsManagement';
import OrdersManagement from './pages/admin/OrdersManagement';
import ButtonNav from './components/ui/ButtonNav';
import { SearchPanelProvider } from './context/SearchPanelContext';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

// Crear QueryClient
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutos
    },
  },
});

// Componente interno para manejar el layout
function AppLayout() {
  const location = useLocation();
  const rutasAutenticacion = ['/auth/login', '/auth/register'];
  const ocultarHeader = rutasAutenticacion.includes(location.pathname);

  // Desactivar restauración automática del scroll del navegador para controlarlo manualmente
  React.useEffect(() => {
    if ('scrollRestoration' in window.history) {
      const prev = window.history.scrollRestoration;
      window.history.scrollRestoration = 'manual';
      return () => {
        window.history.scrollRestoration = prev;
      };
    }
  }, []);

  // Scroll al inicio en cada cambio de ruta o carga inicial
  React.useEffect(() => {
    // Uso setTimeout para garantizar que el layout esté montado antes de forzar el scroll
    setTimeout(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    }, 0);
  }, [location.pathname]);

  return (
    <>
      {/* Header - Solo se muestra si NO estamos en rutas de autenticación */}
      {!ocultarHeader && <Header />}
      <main className={!ocultarHeader ? "w-full px-4 py-8" : ""}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/auth/login" element={<Login />} />
          <Route path="/auth/register" element={<Register />} />
          <Route path="/account/mi-informacion" element={<ProtectedRoute><MiInformacion /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute requiredRole="ADMIN"><Dashboard /></ProtectedRoute>}>
            <Route index element={<Navigate to="/admin/products" replace />} />
            <Route path="products" element={<ProductsManagement />} />
            <Route path="clients" element={<ClientsManagement />} />
            <Route path="orders" element={<OrdersManagement />} />
          </Route>
          <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
          <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <ButtonNav />
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