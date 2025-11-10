import api from './api';

/**
 * Servicio para manejo de imágenes con Cloudinary
 */
export const imageService = {
  /**
   * Sube una o múltiples imágenes a Cloudinary
   * @param {File|File[]} files - Archivo(s) de imagen
   * @returns {Promise<Object|Object[]>} - Datos de la(s) imagen(es) subida(s)
   */
  async uploadImage(archivos) {
    try {
      const datosFormulario = new FormData();
      const arrayArchivos = Array.isArray(archivos) ? archivos : [archivos];
      
      arrayArchivos.forEach(archivo => {
        datosFormulario.append('images', archivo);
      });

      const endpoint = import.meta.env.DEV 
        ? '/productos/upload-image' 
        : '/imagenes/upload';

      const respuesta = await api.post(endpoint, datosFormulario, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      return Array.isArray(archivos) ? respuesta.data.data : respuesta.data.data[0];
    } catch (error) {
      throw new Error(
        error.response?.data?.error || 'Error al subir la imagen'
      );
    }
  },

  async deleteImage(idsPublicos) {
    try {
      const esArray = Array.isArray(idsPublicos);
      
      const endpoint = import.meta.env.DEV 
        ? '/productos/delete-image' 
        : '/imagenes/delete';
      
      const respuesta = await api.delete(endpoint, {
        data: esArray ? { publicIds: idsPublicos } : { publicId: idsPublicos }
      });

      return respuesta.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.error || 'Error al eliminar la imagen'
      );
    }
  },

  validateImage(archivo) {
    const tiposPermitidos = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const tamanoMaximo = 5 * 1024 * 1024;

    if (!tiposPermitidos.includes(archivo.type)) {
      return { isValid: false, error: 'Solo se permiten imágenes (JPEG, PNG, GIF, WebP)' };
    }

    if (archivo.size > tamanoMaximo) {
      return { isValid: false, error: 'La imagen no puede superar los 5MB' };
    }

    return { isValid: true };
  },

  extractPublicId(url) {
    if (!url) return null;
    
    try {
      const partes = url.split('/');
      const indiceUpload = partes.indexOf('upload');
      
      if (indiceUpload === -1) return null;
      
      const partesRuta = partes.slice(indiceUpload + 2);
      const idPublico = partesRuta.join('/').split('.')[0];
      
      return idPublico;
    } catch (error) {
      console.error('Error extrayendo publicId:', error);
      return null;
    }
  }
};
