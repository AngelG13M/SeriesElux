# 📦 Sistema de Series con Roles + Firebase

Sistema de gestión de escaneo de series con autenticación y asignación de tareas. **Funciona en múltiples dispositivos** gracias a Firebase.

## 🚀 Inicio Rápido

1. **Configura Firebase** (5 minutos)
   - Lee [`FIREBASE_SETUP.md`](FIREBASE_SETUP.md) con instrucciones paso a paso
   - Crea tu proyecto en [Firebase Console](https://console.firebase.google.com/)
   - Pega tu configuración en `index-nuevo.html`

2. **Prueba localmente**
   - Abre `index-nuevo.html` en tu navegador
   - Login: `admin` / `admin123`

3. **Despliega en Vercel**
   - Sube a GitHub
   - Conecta con Vercel
   - ¡Listo! Funciona en PC y celular

## 📁 Estructura del Proyecto

```
SeriesElux-master/
├── index-nuevo.html          # Archivo HTML principal (USAR ESTE)
├── index.html                # Versión antigua (localStorage)
├── css/
│   └── styles.css           # Estilos CSS organizados
├── js/
│   ├── auth.js              # Autenticación con Firebase
│   ├── core.js              # Funciones núcleo
│   ├── ui-admin.js          # Interfaz de administrador
│   ├── ui-user.js           # Interfaz de usuario
│   ├── scanner.js           # Lógica de escaneo
│   └── init.js              # Inicialización
├── FIREBASE_SETUP.md        # ⭐ Guía de configuración
└── README.md                # Este archivo
```

## ⚙️ Características

### Para Administradores
- ✅ Crear y gestionar usuarios
- ✅ Crear tareas con tablas de productos
- ✅ Asignar tareas a usuarios específicos
- ✅ Ver estado de todas las tareas

### Para Usuarios
- ✅ Ver tareas asignadas
- ✅ Escanear series en 3 modos diferentes
- ✅ Guardar resultados automáticamente
- ✅ Descargar/copiar resultados

## 💾 Almacenamiento

**Firebase Realtime Database** (Nube de Google):
- ✅ Sincronización en tiempo real
- ✅ Funciona en múltiples dispositivos
- ✅ Admin crea tarea en PC → Usuario ve en celular
- ✅ Usuario completa en celular → Admin ve resultado en PC
- ✅ Gratis hasta 100 usuarios simultáneos

Datos guardados:
- `users/` - Usuarios y contraseñas
- `tasks/` - Tareas con estado y resultados

## 🔧 Tecnologías

- **HTML5** - Estructura
- **CSS3** - Estilos modernos
- **JavaScript (Vanilla)** - Lógica sin frameworks
- **Firebase** - Base de datos en tiempo real
- **Vercel** - Hosting gratuito

## 📝 Diferencias con la Versión Anterior

| Característica | `index.html` (Antiguo) | `index-nuevo.html` (Nuevo) |
|----------------|------------------------|----------------------------|
| Almacenamiento | localStorage | Firebase (Nube) |
| Múltiples dispositivos | ❌ No | ✅ Sí |
| Sincronización | ❌ No | ✅ Tiempo real |
| Requiere configuración | No | Sí (5 min) |
| Costo | Gratis | Gratis (hasta 100 usuarios) |

## 🔐 Seguridad

✅ **Con Firebase**:
- Datos en la nube de Google
- Respaldo automático
- Accesible desde cualquier dispositivo
- Reglas de seguridad configurables

⚠️ **Nota**: La configuración actual permite acceso público. Para producción, implementa reglas más estrictas (ver `FIREBASE_SETUP.md`).

## 🆘 Ayuda

- 📖 **Configuración**: Lee [`FIREBASE_SETUP.md`](FIREBASE_SETUP.md)
- 🐛 **Errores**: Revisa la consola del navegador (F12)
- 🔥 **Firebase**: [Documentación oficial](https://firebase.google.com/docs/database)
