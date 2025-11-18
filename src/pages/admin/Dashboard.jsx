import { Link, Outlet, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/ui/Button.jsx';

export default function Dashboard() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const location = useLocation();

  const menuItems = [
    {
      path: '/admin/products',
      label: t('admin.dashboard.productsManagement'),
      icon: <img src="https://res.cloudinary.com/drec8g03e/image/upload/v1762998627/producto_ozuzjz.png" alt="Productos" className="w-7 h-7 lg:w-8 lg:h-8" />
    },
    {
      path: '/admin/clients',
      label: t('admin.dashboard.clientsManagement'),
      icon: <img src="https://res.cloudinary.com/drec8g03e/image/upload/v1762998627/clientes_pootfq.png" alt="Clientes" className="w-7 h-7 lg:w-8 lg:h-8" />
    },
    {
      path: '/admin/orders',
      label: t('admin.dashboard.ordersManagement'),
      icon: <img src="https://res.cloudinary.com/drec8g03e/image/upload/v1762998627/pedidos_yifcqb.png" alt="Pedidos" className="w-7 h-7 lg:w-8 lg:h-8" />
    }
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{t('admin.dashboard.title')}</h1>
          <p className="mt-2 text-sm text-gray-600">
            {t('admin.dashboard.welcome')}, {user?.email}
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">

          <aside className="w-full lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="flex lg:hidden justify-between items-center px-4 py-3 border-b">
                <h2 className="font-semibold text-gray-700">{t('admin.dashboard.menu')}</h2>
              </div>
              <ul className="divide-y divide-gray-200">
                {menuItems.map((item) => (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      className={`flex items-center gap-3 px-4 lg:px-6 py-3 lg:py-4 text-sm lg:text-base transition-colors ${
                        isActive(item.path)
                          ? 'bg-indigo-50 text-indigo-700 font-medium'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <span className="flex items-center justify-center">{item.icon}</span>
                      <span className="truncate">{item.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-4 hidden md:block">
              <Button as={Link} to="/" variant="light" block size="md">{t('admin.dashboard.backToStore')}</Button>
            </div>
          </aside>

          <main className="flex-1 min-w-0">
            <div className="bg-white rounded-lg shadow-md p-4 lg:p-6">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
