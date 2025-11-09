/* ========================================
   INICIALIZACIÓN DE LA APLICACIÓN
   ======================================== */

// Esperar a que Firebase esté listo
window.addEventListener('load', async () => {
  try {
    // Inicializar sistema de autenticación
    await AUTH.init();
    console.log('Firebase inicializado correctamente');
    
    // Verificar sesión existente
    if (AUTH.loadSession()) {
      await showMainInterface();
    } else {
      loginScreen.classList.remove('hidden');
    }
  } catch (error) {
    console.error('Error al inicializar:', error);
    alert('Error al conectar con la base de datos. Verifica tu conexión a internet.');
    loginScreen.classList.remove('hidden');
  }
});
