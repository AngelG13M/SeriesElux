# 🔥 Guía de Configuración de Firebase

## 📋 Pasos para Configurar Firebase

### 1️⃣ Crear Proyecto en Firebase

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Haz clic en **"Agregar proyecto"** o **"Add project"**
3. Nombre del proyecto: `series-sistema` (o el que quieras)
4. Desactiva Google Analytics (no lo necesitas)
5. Clic en **"Crear proyecto"**

### 2️⃣ Crear Base de Datos

1. En el menú lateral, ve a **"Realtime Database"**
2. Clic en **"Crear base de datos"** o **"Create database"**
3. Selecciona ubicación: **Estados Unidos (us-central1)** (la más rápida)
4. Modo de seguridad: **"Empezar en modo de prueba"** (por ahora)
5. Clic en **"Habilitar"**

### 3️⃣ Configurar Reglas de Seguridad

1. En la pestaña **"Reglas"** o **"Rules"**
2. Reemplaza el contenido con esto:

```json
{
  "rules": {
    "users": {
      ".read": true,
      ".write": true
    },
    "tasks": {
      ".read": true,
      ".write": true
    }
  }
}
```

3. Clic en **"Publicar"**

⚠️ **IMPORTANTE**: Estas reglas permiten lectura/escritura pública. Para producción, deberías usar reglas más estrictas.

### 4️⃣ Obtener tu Configuración

1. En el menú lateral, haz clic en el ⚙️ **"Configuración del proyecto"**
2. Baja hasta la sección **"Tus apps"**
3. Haz clic en el ícono **</> (Web)**
4. Nombre de la app: `Series Web App`
5. **NO** marques "También configurar Firebase Hosting"
6. Clic en **"Registrar app"**

Verás algo como esto:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyAaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPp",
  authDomain: "series-sistema-12345.firebaseapp.com",
  databaseURL: "https://series-sistema-12345-default-rtdb.firebaseio.com",
  projectId: "series-sistema-12345",
  storageBucket: "series-sistema-12345.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890abcdef"
};
```

### 5️⃣ Pegar tu Configuración

1. Abre el archivo **`index-nuevo.html`**
2. Busca esta sección (línea ~215):

```javascript
const firebaseConfig = {
  apiKey: "TU_API_KEY_AQUI",
  authDomain: "tu-proyecto.firebaseapp.com",
  // ...
};
```

3. **Reemplaza TODO** con tu configuración de Firebase
4. Guarda el archivo

### 6️⃣ Probar Localmente

1. Abre `index-nuevo.html` en tu navegador
2. Deberías ver la pantalla de login (si no, revisa la consola F12)
3. Inicia sesión con: `admin` / `admin123`
4. Crea un usuario de prueba
5. Crea una tarea y asígnala

### 7️⃣ Subir a Vercel

1. Sube todo a tu repositorio de GitHub:
   ```
   ✅ index-nuevo.html (con tu configuración de Firebase)
   ✅ css/
   ✅ js/
   ```

2. En Vercel:
   - Conecta tu repositorio
   - Deploy automático

### 8️⃣ Probar en Múltiples Dispositivos

1. **PC del Admin**: Abre tu URL de Vercel → Crea tarea
2. **Celular del Usuario**: Abre la misma URL → Ve la tarea asignada
3. **Usuario escanea** → Resultado se guarda en la nube
4. **Admin en PC** → Ve que la tarea está completada

## ✅ ¡Listo!

Ahora tu sistema funciona en:
- ✅ Múltiples dispositivos
- ✅ PC, celular, tablet
- ✅ Cualquier navegador
- ✅ Sincronización en tiempo real
- ✅ **GRATIS** (hasta 100 usuarios simultáneos)

## 🔒 Reglas de Seguridad (Producción)

Para producción, usa reglas más seguras:

```json
{
  "rules": {
    "users": {
      ".read": true,
      ".write": true
    },
    "tasks": {
      ".read": true,
      ".write": true,
      "$taskId": {
        ".validate": "newData.hasChildren(['id', 'name', 'tableData', 'assignedTo', 'status', 'createdAt'])"
      }
    }
  }
}
```

## 📊 Límites del Plan Gratuito

- ✅ 100 conexiones simultáneas
- ✅ 1 GB de almacenamiento
- ✅ 10 GB de transferencia/mes
- ✅ Suficiente para ~100 usuarios activos

## 🆘 Solución de Problemas

### Error: "Permission denied"
- Verifica las reglas en Firebase Console
- Asegúrate que `.read` y `.write` sean `true`

### Error: "Firebase not defined"
- Verifica que los scripts de Firebase se carguen antes de auth.js
- Abre la consola del navegador (F12) para ver el error

### No se conecta a Firebase
- Verifica que tu `firebaseConfig` sea correcta
- Revisa la URL de `databaseURL` en Firebase Console

## 📱 Contacto

Si tienes problemas, revisa:
1. Consola del navegador (F12)
2. Firebase Console → Database → Data
3. Firebase Console → Database → Rules
