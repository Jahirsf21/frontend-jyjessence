import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ecommerceFacade from '../../patterns/EcommerceFacade';

function ProductDetails() {
  const { t } = useTranslation();
  const { id } = useParams();
  const [producto, setProducto] = useState(null);

  useEffect(() => {
    const cargarProducto = async () => {
      const catalogo = await ecommerceFacade.getCatalog();
      const prod = catalogo.find(p => String(p.idProducto) === String(id));
      setProducto(prod || null);
    };
    cargarProducto();
  }, [id]);

  if (!producto) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center text-gray-500">
        {t('product.notFound', { defaultValue: 'Producto no encontrado.' })}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="flex-1 flex items-center justify-center">
          <img src={producto.imagenesUrl?.[0] || producto.primaryImage} alt={producto.nombre} className="w-full max-w-xs h-64 object-cover rounded-xl shadow-md" />
        </div>
        <div className="flex-1 flex flex-col gap-4">
          <h1 className="text-3xl font-bold text-gray-900">{producto.nombre}</h1>
          <div className="text-sm text-gray-500">{producto.marca}</div>
          <div className="text-sm text-gray-500">{t(`category.${producto.categoria}`, { defaultValue: producto.categoria })}</div>
          <div className="text-sm text-gray-500">{t(`gender.${producto.genero}`, { defaultValue: producto.genero })}</div>
          <div className="font-bold text-blue-600 text-2xl">₡{producto.precio.toLocaleString('es-CR')}</div>
          <div className="text-gray-700 text-base mb-2">{producto.descripcion}</div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetails;
