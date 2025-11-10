import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Traducciones
const resources = {
  es: {
    translation: {
      // Navegación
      "nav.home": "Inicio",
      "nav.catalog": "Catálogo",
      "nav.cart": "Carrito",
      "nav.orders": "Mis Pedidos",
      "nav.myAccount": "Mi Cuenta",
      "nav.login": "Iniciar Sesión",
      "nav.register": "Registrarse",
      "nav.logout": "Cerrar Sesión",
      "nav.admin": "Administración",
      
      // Header
      "header.searchPlaceholder": "Buscar productos...",
      
      // Perfil
      "profile.general": "General",
      "profile.help": "Ayuda",
      
      // Autenticación
      "auth.email": "Correo Electrónico",
      "auth.password": "Contraseña",
      "auth.confirmPassword": "Confirmar Contraseña",
      "auth.name": "Nombre",
      "auth.lastName": "Apellidos",
      "auth.cedula": "Cédula",
      "auth.phone": "Teléfono",
      "auth.gender": "Género",
      "auth.male": "Masculino",
      "auth.female": "Femenino",
      "auth.other": "Otro",
      "auth.login": "Iniciar Sesión",
      "auth.register": "Registrarse",
      "auth.loginTitle": "Bienvenido a JyJ Essence",
      "auth.registerTitle": "Crear Cuenta",
      "auth.noAccount": "¿No tienes cuenta?",
      "auth.hasAccount": "¿Ya tienes cuenta?",
      "auth.cedulaValidated": "Cédula validada exitosamente",
      
      // Dirección
      "address.addAddress": "¿Desea agregar una dirección? (Opcional)",
      "address.province": "Provincia",
      "address.canton": "Cantón",
      "address.district": "Distrito",
      "address.neighborhood": "Barrio",
      "address.directions": "Señas",
      "address.postalCode": "Código Postal",
      "address.reference": "Punto de Referencia",
      "address.provincePlaceholder": "San José",
      "address.cantonPlaceholder": "Central",
      "address.districtPlaceholder": "Carmen",
      "address.neighborhoodPlaceholder": "Ejemplo: Los Yoses",
      "address.directionsPlaceholder": "200 metros norte de la iglesia...",
      "address.postalCodePlaceholder": "10101",
      "address.referencePlaceholder": "Frente al parque central",
      
      // Validaciones
      "auth.emailRequired": "El correo electrónico es requerido",
      "auth.emailInvalid": "El correo electrónico no es válido",
      "auth.passwordRequired": "La contraseña es requerida",
      "auth.passwordMinLength": "La contraseña debe tener al menos 6 caracteres",
      "auth.confirmPasswordRequired": "Debe confirmar la contraseña",
      "auth.passwordMismatch": "Las contraseñas no coinciden",
      "auth.cedulaRequired": "La cédula es requerida",
      "auth.cedulaInvalidFormat": "El formato de cédula no es válido",
      "auth.nameRequired": "El nombre es requerido",
      "auth.lastNameRequired": "Los apellidos son requeridos",
      "auth.genderRequired": "El género es requerido",
      "auth.phoneRequired": "El teléfono es requerido",
      "auth.phoneInvalidFormat": "El formato de teléfono no es válido",
      
      // Productos
      "product.name": "Nombre",
      "product.description": "Descripción",
      "product.price": "Precio",
      "product.stock": "Stock",
      "product.category": "Categoría",
      "product.gender": "Género",
      "product.addToCart": "Agregar al Carrito",
      "product.outOfStock": "Agotado",
  "products.catalogTitle": "Catálogo de Productos",
  "products.catalogSubtitle": "Explora nuestra selección de fragancias exclusivas",
  "products.foundCount": "{{count}} {{count, plural, one {producto encontrado} other {productos encontrados}}}",
  "products.noResults": "No se encontraron productos con los filtros seleccionados",
  "products.stock": "Stock: {{stock}}",
  "filters.clearFilters": "Limpiar Filtros",
      
      // Categorías
      "category.FLORAL": "Floral",
      "category.FRUTAL": "Frutal",
      "category.ORIENTAL": "Oriental",
      "category.AMADERADO": "Amaderado",
      "category.FRESCO": "Fresco",
      
      // Género
      "gender.MASCULINO": "Masculino",
      "gender.FEMENINO": "Femenino",
      "gender.UNISEX": "Unisex",
      
      // Carrito
      "cart.title": "Carrito de Compras",
      "cart.empty": "Tu carrito está vacío",
      "cart.quantity": "Cantidad",
      "cart.subtotal": "Subtotal",
      "cart.total": "Total",
      "cart.remove": "Eliminar",
      "cart.undo": "Deshacer",
      "cart.redo": "Rehacer",
  "cart.authRequired": "Debes iniciar sesión para ver tu carrito",
  "cart.loadError": "Error al cargar el carrito",
  "cart.loadErrorTitle": "Error al cargar el carrito",
  "cart.retry": "Reintentar",
  "cart.sessionExpiredTitle": "Sesión expirada",
  "cart.sessionExpiredText": "Por favor, inicia sesión nuevamente",
  "cart.updateQuantityError": "Error al actualizar cantidad",
  "cart.removeConfirmTitle": "¿Eliminar producto?",
  "cart.removeConfirmText": "¿Estás seguro de eliminar \"{{nombre}}\" del carrito?",
  "cart.removedTitle": "Eliminado",
  "cart.removedText": "Producto eliminado del carrito",
  "cart.removeError": "Error al eliminar producto",
  "cart.finalizedTitle": "Pedido creado",
  "cart.finalizedText": "Tu pedido ha sido registrado exitosamente",
  "cart.finalizeError": "Error al finalizar pedido",
  "cart.emptyTitle": "Tu carrito está vacío",
  "cart.emptySubtitle": "¡Explora nuestro catálogo y agrega productos!",
  "cart.viewProducts": "Ver Productos",
  "cart.unitPrice": "Precio unitario",
  "cart.summaryTitle": "Resumen del Pedido",
  "cart.shipping": "Envío",
  "cart.shippingFree": "Gratis",
  "cart.finalizeButton": "Finalizar Pedido",
  "cart.keepBuying": "Seguir Comprando",
  "cart.securePlaceholderRemoved": "Pedido sin pasarela de pago. Próximamente integración de pagos.",
  "cart.itemCount": "{{count}} {{count, plural, one {producto} other {productos}}} en tu carrito",
  "cart.selectAddress": "Selecciona una dirección de envío",
  "cart.addressRequired": "Debes seleccionar una dirección antes de finalizar",
  "address.noAddresses": "No tienes direcciones registradas",
      
  // Pedidos (historial)
  "orders.title": "Mis Pedidos",
  "orders.count": "{{count}} {{count, plural, one {pedido encontrado} other {pedidos encontrados}}}",
  "orders.none": "No tienes pedidos aún",
  "orders.filter.todos": "Todos",
  "orders.filter.pendiente": "Pendiente",
  "orders.filter.procesando": "Procesando",
  "orders.filter.enviado": "Enviado",
  "orders.filter.entregado": "Entregado",
  "orders.filter.cancelado": "Cancelado",
  "orders.emptyFilter": "No hay pedidos con el estado \"{{estado}}\"",
  "orders.shippingAddress": "Dirección de Envío",
  "orders.products": "Productos",
  "orders.amountTotal": "Monto Total",
  "orders.quantity": "Cantidad",
  "orders.order": "Pedido #{{id}}",
  "orders.date": "Fecha",
  "orders.items": "Artículos del Pedido",
  "orders.viewDetails": "Ver Detalles",
      
      // Pedidos
      "order.title": "Mis Pedidos",
      "order.number": "Pedido #",
      "order.date": "Fecha",
      "order.status": "Estado",
      "order.total": "Total",
      "order.details": "Ver Detalles",
      
      // Admin
      "admin.products": "Gestión de Productos",
      "admin.addProduct": "Agregar Producto",
      "admin.editProduct": "Editar Producto",
      "admin.deleteProduct": "Eliminar Producto",
      "admin.save": "Guardar",
      "admin.cancel": "Cancelar",
      
      // Mensajes
      "message.success": "Operación exitosa",
      "message.error": "Ocurrió un error",
      "message.loading": "Cargando...",
      "message.addedToCart": "Producto agregado al carrito",
      "message.removedFromCart": "Producto eliminado del carrito",
      "message.orderPlaced": "Pedido realizado con éxito",
      "message.invalidCedula": "Cédula inválida",
      "message.loginError": "Credenciales incorrectas",
      "message.loginSuccess": "Sesión iniciada correctamente",
      "message.registerSuccess": "Cuenta creada exitosamente",
      "message.registerError": "Error al registrarse",
      "message.cedulaValidated": "Datos obtenidos del TSE exitosamente",
      "message.cedulaValidationError": "No se pudo validar la cédula",
      
      // Errores de Login
      "error.login.title": "Error de autenticación",
      "error.login.emailNotFound": "No existe una cuenta con este correo electrónico",
      "error.login.emailNotFoundTitle": "Correo no encontrado",
      "error.login.wrongPassword": "La contraseña ingresada es incorrecta",
      "error.login.wrongPasswordTitle": "Contraseña incorrecta",
      "error.login.tryAgain": "Intentar de nuevo",
      
      // Errores de Registro
      "error.register.title": "Error en el registro",
      "error.register.cedulaDuplicate": "Ya existe un usuario registrado con esta cédula",
      "error.register.cedulaDuplicateTitle": "Cédula ya registrada",
      "error.register.emailDuplicate": "Ya existe una cuenta con este correo electrónico",
      "error.register.emailDuplicateTitle": "Correo ya registrado",
      "error.register.cedulaInvalid": "La cédula proporcionada no es válida",
      "error.register.cedulaInvalidTitle": "Cédula inválida",
      "error.register.cedulaNotFound": "Cédula no encontrada en el sistema del TSE",
      "error.register.cedulaNotFoundTitle": "Cédula no encontrada",
      "error.register.passwordMismatch": "Por favor asegúrate de que ambas contraseñas sean iguales",
      "error.register.passwordMismatchTitle": "Las contraseñas no coinciden",
      "error.register.tryAgain": "Intentar de nuevo",
      
      // Éxitos
      "success.login.title": "¡Bienvenido!",
      "success.login.message": "Has iniciado sesión correctamente",
      "success.register.title": "¡Registro exitoso!",
      "success.register.message": "Tu cuenta ha sido creada correctamente",
      "success.register.button": "Ir a iniciar sesión",
      "success.cedula.title": "¡Cédula validada!",
      "success.cedula.message": "Datos obtenidos del TSE exitosamente",
      
      // Botones
      "button.understood": "Entendido",
      "button.tryAgain": "Intentar de nuevo",
      "button.goToLogin": "Ir a iniciar sesión",
      
      // Común
      "common.search": "Buscar",
      "common.filter": "Filtrar",
      "common.sort": "Ordenar",
      "common.clear": "Limpiar",
      "common.apply": "Aplicar",
      "common.close": "Cerrar",
      "common.confirm": "Confirmar",
      "common.delete": "Eliminar",
      "common.edit": "Editar",
      "common.save": "Guardar",
      "common.cancel": "Cancelar",
      
  // Home / Landing
  "home.welcome": "Bienvenido a",
  "home.heroSubtitle": "Descubre las fragancias más exclusivas y elegantes del mercado",
  "home.featureQualityTitle": "Calidad Premium",
  "home.featureQualityText": "Fragancias de las mejores marcas internacionales",
  "home.featureShippingTitle": "Envío Rápido",
  "home.featureShippingText": "Recibe tus productos en tiempo récord",
  "home.featureOrderTitle": "Pedidos Seguros",
  "home.featureOrderText": "Proceso de pedido sencillo y confiable",
    }
  },
  en: {
    translation: {
      // Navigation
      "nav.home": "Home",
      "nav.catalog": "Catalog",
      "nav.cart": "Cart",
      "nav.orders": "My Orders",
      "nav.myAccount": "My Account",
      "nav.login": "Login",
      "nav.register": "Sign Up",
      "nav.logout": "Logout",
      "nav.admin": "Administration",
      
      // Header
      "header.searchPlaceholder": "Search products...",
      
      // Profile
      "profile.general": "General",
      "profile.help": "Help",
      
      // Authentication
      "auth.email": "Email",
      "auth.password": "Password",
      "auth.confirmPassword": "Confirm Password",
      "auth.name": "Name",
      "auth.lastName": "Last Name",
      "auth.cedula": "ID Number",
      "auth.phone": "Phone",
      "auth.gender": "Gender",
      "auth.male": "Male",
      "auth.female": "Female",
      "auth.other": "Other",
      "auth.login": "Login",
      "auth.register": "Sign Up",
      "auth.loginTitle": "Welcome to JyJ Essence",
      "auth.registerTitle": "Create Account",
      "auth.noAccount": "Don't have an account?",
      "auth.hasAccount": "Already have an account?",
      "auth.cedulaValidated": "ID validated successfully",
      
      // Address
      "address.addAddress": "Would you like to add an address? (Optional)",
      "address.province": "Province",
      "address.canton": "Canton",
      "address.district": "District",
      "address.neighborhood": "Neighborhood",
      "address.directions": "Directions",
      "address.postalCode": "Postal Code",
      "address.reference": "Reference Point",
      "address.provincePlaceholder": "San José",
      "address.cantonPlaceholder": "Central",
      "address.districtPlaceholder": "Carmen",
      "address.neighborhoodPlaceholder": "Example: Los Yoses",
      "address.directionsPlaceholder": "200 meters north of the church...",
      "address.postalCodePlaceholder": "10101",
      "address.referencePlaceholder": "In front of the central park",
      
      // Validations
      "auth.emailRequired": "Email is required",
      "auth.emailInvalid": "Email is not valid",
      "auth.passwordRequired": "Password is required",
      "auth.passwordMinLength": "Password must be at least 6 characters",
      "auth.confirmPasswordRequired": "You must confirm the password",
      "auth.passwordMismatch": "Passwords do not match",
      "auth.cedulaRequired": "ID number is required",
      "auth.cedulaInvalidFormat": "ID format is not valid",
      "auth.nameRequired": "Name is required",
      "auth.lastNameRequired": "Last name is required",
      "auth.genderRequired": "Gender is required",
      "auth.phoneRequired": "Phone is required",
      "auth.phoneInvalidFormat": "Phone format is not valid",
      
      // Products
      "product.name": "Name",
      "product.description": "Description",
      "product.price": "Price",
      "product.stock": "Stock",
      "product.category": "Category",
      "product.gender": "Gender",
      "product.addToCart": "Add to Cart",
      "product.outOfStock": "Out of Stock",
  "products.catalogTitle": "Product Catalog",
  "products.catalogSubtitle": "Explore our selection of exclusive fragrances",
  "products.foundCount": "{{count}} {{count, plural, one {product found} other {products found}}}",
  "products.noResults": "No products found with selected filters",
  "products.stock": "Stock: {{stock}}",
  "filters.clearFilters": "Clear Filters",
      
      // Categories
      "category.FLORAL": "Floral",
      "category.FRUTAL": "Fruity",
      "category.ORIENTAL": "Oriental",
      "category.AMADERADO": "Woody",
      "category.FRESCO": "Fresh",
      
      // Gender
      "gender.MASCULINO": "Male",
      "gender.FEMENINO": "Female",
      "gender.UNISEX": "Unisex",
      
      // Cart
      "cart.title": "Shopping Cart",
      "cart.empty": "Your cart is empty",
      "cart.quantity": "Quantity",
      "cart.subtotal": "Subtotal",
      "cart.total": "Total",
      "cart.remove": "Remove",
      "cart.undo": "Undo",
      "cart.redo": "Redo",
  "cart.authRequired": "You must login to view your cart",
  "cart.loadError": "Error loading cart",
  "cart.loadErrorTitle": "Error loading cart",
  "cart.retry": "Retry",
  "cart.sessionExpiredTitle": "Session expired",
  "cart.sessionExpiredText": "Please login again",
  "cart.updateQuantityError": "Error updating quantity",
  "cart.removeConfirmTitle": "Remove product?",
  "cart.removeConfirmText": "Are you sure you want to remove \"{{nombre}}\" from the cart?",
  "cart.removedTitle": "Removed",
  "cart.removedText": "Product removed from cart",
  "cart.removeError": "Error removing product",
  "cart.finalizedTitle": "Order created",
  "cart.finalizedText": "Your order has been registered successfully",
  "cart.finalizeError": "Error finalizing order",
  "cart.emptyTitle": "Your cart is empty",
  "cart.emptySubtitle": "Browse our catalog and add products!",
  "cart.viewProducts": "View Products",
  "cart.unitPrice": "Unit price",
  "cart.summaryTitle": "Order Summary",
  "cart.shipping": "Shipping",
  "cart.shippingFree": "Free",
  "cart.finalizeButton": "Place Order",
  "cart.keepBuying": "Keep Shopping",
  "cart.securePlaceholderRemoved": "Order without payment gateway. Payment integration coming soon.",
  "cart.itemCount": "{{count}} {{count, plural, one {product} other {products}}} in your cart",
  "cart.selectAddress": "Select a shipping address",
  "cart.addressRequired": "You must select an address before placing the order",
  "address.noAddresses": "You have no saved addresses",
      
  // Orders (history)
  "orders.title": "My Orders",
  "orders.count": "{{count}} {{count, plural, one {order found} other {orders found}}}",
  "orders.none": "You have no orders yet",
  "orders.filter.todos": "All",
  "orders.filter.pendiente": "Pending",
  "orders.filter.procesando": "Processing",
  "orders.filter.enviado": "Shipped",
  "orders.filter.entregado": "Delivered",
  "orders.filter.cancelado": "Cancelled",
  "orders.emptyFilter": "No orders with status \"{{estado}}\"",
  "orders.shippingAddress": "Shipping Address",
  "orders.products": "Products",
  "orders.amountTotal": "Total Amount",
  "orders.quantity": "Quantity",
  "orders.order": "Order #{{id}}",
  "orders.date": "Date",
  "orders.items": "Order Items",
  "orders.viewDetails": "View Details",
      
      // Orders
      "order.title": "My Orders",
      "order.number": "Order #",
      "order.date": "Date",
      "order.status": "Status",
      "order.total": "Total",
      "order.details": "View Details",
      
      // Admin
      "admin.products": "Product Management",
      "admin.addProduct": "Add Product",
      "admin.editProduct": "Edit Product",
      "admin.deleteProduct": "Delete Product",
      "admin.save": "Save",
      "admin.cancel": "Cancel",
      
      // Messages
      "message.success": "Operation successful",
      "message.error": "An error occurred",
      "message.loading": "Loading...",
      "message.addedToCart": "Product added to cart",
      "message.removedFromCart": "Product removed from cart",
      "message.orderPlaced": "Order placed successfully",
      "message.invalidCedula": "Invalid ID number",
      "message.loginError": "Invalid credentials",
      "message.loginSuccess": "Login successful",
      "message.registerSuccess": "Account created successfully",
      "message.registerError": "Registration error",
      "message.cedulaValidated": "Data obtained from TSE successfully",
      "message.cedulaValidationError": "Could not validate ID number",
      
      // Login Errors
      "error.login.title": "Authentication error",
      "error.login.emailNotFound": "No account exists with this email",
      "error.login.emailNotFoundTitle": "Email not found",
      "error.login.wrongPassword": "The password entered is incorrect",
      "error.login.wrongPasswordTitle": "Incorrect password",
      "error.login.tryAgain": "Try again",
      
      // Registration Errors
      "error.register.title": "Registration error",
      "error.register.cedulaDuplicate": "A user is already registered with this ID number",
      "error.register.cedulaDuplicateTitle": "ID already registered",
      "error.register.emailDuplicate": "An account already exists with this email",
      "error.register.emailDuplicateTitle": "Email already registered",
      "error.register.cedulaInvalid": "The provided ID number is not valid",
      "error.register.cedulaInvalidTitle": "Invalid ID number",
      "error.register.cedulaNotFound": "ID number not found in TSE system",
      "error.register.cedulaNotFoundTitle": "ID number not found",
      "error.register.passwordMismatch": "Please make sure both passwords match",
      "error.register.passwordMismatchTitle": "Passwords do not match",
      "error.register.tryAgain": "Try again",
      
      // Success
      "success.login.title": "Welcome!",
      "success.login.message": "You have successfully logged in",
      "success.register.title": "Registration successful!",
      "success.register.message": "Your account has been created successfully",
      "success.register.button": "Go to login",
      "success.cedula.title": "ID validated!",
      "success.cedula.message": "Data obtained from TSE successfully",
      
      // Buttons
      "button.understood": "Understood",
      "button.tryAgain": "Try again",
      "button.goToLogin": "Go to login",
      
      // Common
      "common.search": "Search",
      "common.filter": "Filter",
      "common.sort": "Sort",
      "common.clear": "Clear",
      "common.apply": "Apply",
      "common.close": "Close",
      "common.confirm": "Confirm",
      "common.delete": "Delete",
      "common.edit": "Edit",
      "common.save": "Save",
      "common.cancel": "Cancel",
      
  // Home / Landing
  "home.welcome": "Welcome to",
  "home.heroSubtitle": "Discover the most exclusive and elegant fragrances",
  "home.featureQualityTitle": "Premium Quality",
  "home.featureQualityText": "Fragrances from top international brands",
  "home.featureShippingTitle": "Fast Shipping",
  "home.featureShippingText": "Receive your products in record time",
  "home.featureOrderTitle": "Secure Orders",
  "home.featureOrderText": "Simple and reliable ordering process",
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'es',
    interpolation: {
      escapeValue: false // React ya protege contra XSS
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage']
    }
  });

export default i18n;
