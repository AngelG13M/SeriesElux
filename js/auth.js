/* ========================================
   SISTEMA DE AUTENTICACIÓN Y TAREAS CON FIREBASE
   ======================================== */

const AUTH = {
  currentUser: null,
  db: null,
  
  async init() {
    // Firebase ya está inicializado en index-nuevo.html
    this.db = firebase.database();
    
    // Crear usuario admin por defecto si no existe
    const adminRef = this.db.ref('users/admin');
    const snapshot = await adminRef.once('value');
    
    if (!snapshot.exists()) {
      await adminRef.set({
        password: 'admin123',
        role: 'admin'
      });
      console.log('Usuario admin creado');
    }
  },
  
  async login(username, password) {
    try {
      const userRef = this.db.ref(`users/${username}`);
      const snapshot = await userRef.once('value');
      const user = snapshot.val();
      
      if (user && user.password === password) {
        this.currentUser = { username, role: user.role };
        localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error en login:', error);
      alert('Error al iniciar sesión. Verifica tu conexión.');
      return false;
    }
  },
  
  logout() {
    this.currentUser = null;
    localStorage.removeItem('currentUser');
  },
  
  isAdmin() {
    return this.currentUser && this.currentUser.role === 'admin';
  },
  
  async addUser(username, password) {
    try {
      const userRef = this.db.ref(`users/${username}`);
      const snapshot = await userRef.once('value');
      
      if (snapshot.exists()) return false;
      
      await userRef.set({
        password: password,
        role: 'user'
      });
      return true;
    } catch (error) {
      console.error('Error al agregar usuario:', error);
      alert('Error al crear usuario. Verifica tu conexión.');
      return false;
    }
  },
  
  async deleteUser(username) {
    if (username === 'admin') return false;
    
    try {
      // Eliminar usuario
      await this.db.ref(`users/${username}`).remove();
      
      // Eliminar tareas asignadas
      const tasksRef = this.db.ref('tasks');
      const snapshot = await tasksRef.once('value');
      const tasks = snapshot.val() || {};
      
      for (const taskId in tasks) {
        if (tasks[taskId].assignedTo === username) {
          await this.db.ref(`tasks/${taskId}`).remove();
        }
      }
      
      return true;
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
      alert('Error al eliminar usuario. Verifica tu conexión.');
      return false;
    }
  },
  
  async createTask(taskName, tableData) {
    try {
      const taskId = Date.now().toString();
      const task = {
        id: taskId,
        name: taskName,
        tableData: tableData,
        assignedTo: null, // Nadie asignado inicialmente
        takenBy: null, // Quién tomó/está haciendo la tarea
        completedBy: null, // Quién completó la tarea
        status: 'pending',
        createdAt: new Date().toISOString(),
        result: null
      };
      
      await this.db.ref(`tasks/${taskId}`).set(task);
      return task;
    } catch (error) {
      console.error('Error al crear tarea:', error);
      alert('Error al crear tarea. Verifica tu conexión.');
      return null;
    }
  },

  async takeTask(taskId, username) {
    try {
      await this.db.ref(`tasks/${taskId}`).update({
        takenBy: username,
        assignedTo: username // Para compatibilidad con código existente
      });
      return true;
    } catch (error) {
      console.error('Error al tomar tarea:', error);
      return false;
    }
  },
  
  async getTasksByUser(username) {
    try {
      const tasksRef = this.db.ref('tasks');
      const snapshot = await tasksRef.once('value');
      const tasks = snapshot.val() || {};
      
      // Mostrar: tareas sin asignar (disponibles) + tareas que este usuario está haciendo
      return Object.values(tasks).filter(t => 
        t.assignedTo === null || // Tareas disponibles para todos
        t.assignedTo === username || // Tareas que este usuario tomó
        t.takenBy === username // Tareas que este usuario está haciendo
      );
    } catch (error) {
      console.error('Error al obtener tareas:', error);
      return [];
    }
  },
  
  async getAllTasks() {
    try {
      const tasksRef = this.db.ref('tasks');
      const snapshot = await tasksRef.once('value');
      const tasks = snapshot.val() || {};
      
      return Object.values(tasks);
    } catch (error) {
      console.error('Error al obtener tareas:', error);
      return [];
    }
  },
  
  async getTaskById(id) {
    try {
      const taskRef = this.db.ref(`tasks/${id}`);
      const snapshot = await taskRef.once('value');
      return snapshot.val();
    } catch (error) {
      console.error('Error al obtener tarea:', error);
      return null;
    }
  },
  
  async updateTaskStatus(id, status, result = null, completedBy = null) {
    try {
      const updates = { status };
      if (result) updates.result = result;
      if (status === 'completed') {
        updates.completedAt = new Date().toISOString();
        if (completedBy) updates.completedBy = completedBy;
      }
      
      await this.db.ref(`tasks/${id}`).update(updates);
    } catch (error) {
      console.error('Error al actualizar tarea:', error);
      alert('Error al actualizar tarea. Verifica tu conexión.');
    }
  },

  async saveTaskProgress(id, progress) {
    try {
      await this.db.ref(`tasks/${id}/progress`).set(progress);
      // También actualizar estado a 'in-progress' si no está completada
      const taskRef = this.db.ref(`tasks/${id}/status`);
      const statusSnapshot = await taskRef.once('value');
      if (statusSnapshot.val() === 'pending') {
        await taskRef.set('in-progress');
      }
    } catch (error) {
      console.error('Error al guardar progreso:', error);
      // No mostrar alerta para no interrumpir el escaneo
    }
  },

  async loadTaskProgress(id) {
    try {
      const progressRef = this.db.ref(`tasks/${id}/progress`);
      const snapshot = await progressRef.once('value');
      return snapshot.val();
    } catch (error) {
      console.error('Error al cargar progreso:', error);
      return null;
    }
  },
  
  async deleteTask(id) {
    try {
      await this.db.ref(`tasks/${id}`).remove();
      return true;
    } catch (error) {
      console.error('Error al eliminar tarea:', error);
      alert('Error al eliminar tarea. Verifica tu conexión.');
      return false;
    }
  },
  
  async getAllUsers() {
    try {
      const usersRef = this.db.ref('users');
      const snapshot = await usersRef.once('value');
      return snapshot.val() || {};
    } catch (error) {
      console.error('Error al obtener usuarios:', error);
      return {};
    }
  },
  
  loadSession() {
    const saved = localStorage.getItem('currentUser');
    if (saved) {
      this.currentUser = JSON.parse(saved);
      return true;
    }
    return false;
  }
};
