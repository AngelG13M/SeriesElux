// ========================================
// CONFIGURACIÓN DE FIREBASE
// ========================================
// 
// INSTRUCCIONES:
// 1. Crea tu proyecto en https://console.firebase.google.com/
// 2. Copia tu configuración de Firebase
// 3. Reemplaza los valores de "TU_..." con los tuyos
// 4. Pega este objeto en index-nuevo.html (línea ~215)
//
// ========================================

const firebaseConfig = {
  apiKey: "TU_API_KEY_AQUI",
  authDomain: "tu-proyecto.firebaseapp.com",
  databaseURL: "https://tu-proyecto-default-rtdb.firebaseio.com",
  projectId: "tu-proyecto",
  storageBucket: "tu-proyecto.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};

// ========================================
// EJEMPLO REAL:
// ========================================
/*
const firebaseConfig = {
  apiKey: "AIzaSyAaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPp",
  authDomain: "series-sistema-12345.firebaseapp.com",
  databaseURL: "https://series-sistema-12345-default-rtdb.firebaseio.com",
  projectId: "series-sistema-12345",
  storageBucket: "series-sistema-12345.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890abcdef"
};
*/

// ========================================
// IMPORTANTE:
// ========================================
// NO compartas tu apiKey públicamente
// Configura las reglas de seguridad en Firebase Console
// Lee FIREBASE_SETUP.md para más detalles
