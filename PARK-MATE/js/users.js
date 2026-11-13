/**
 * js/users.js
 * PLAIN-TEXT MASTER CREDENTIALS DATABASE (NO ENCRYPTION)
 */

const UsersDB = {
  // Permanent Default Master User (Always Active)
  DEFAULT_USER: {
    regId: "12629947",
    password: "LPU@321",
    name: "Authorized Campus User",
    email: "12629947@lpu.in",
    hasVehicle: true,
    vehicleReg: "PB 08 CC 4821",
    vehicleType: "4w"
  },

  STORAGE_KEY: 'lpu_plaintext_users_file',

  getAllUsers() {
    try {
      const registered = JSON.parse(localStorage.getItem(this.STORAGE_KEY)) || [];
      const filtered = registered.filter(u => u.regId !== this.DEFAULT_USER.regId);
      return [this.DEFAULT_USER, ...filtered];
    } catch (e) {
      return [this.DEFAULT_USER];
    }
  },

  saveUser(userData) {
    const cleanId = String(userData.regId).trim();

    if (cleanId === this.DEFAULT_USER.regId) {
      return { success: false, message: 'This default University Registration ID is already permanently registered.' };
    }

    const allUsers = this.getAllUsers();
    if (allUsers.some(u => u.regId === cleanId)) {
      return { success: false, message: 'This University Registration ID is already registered.' };
    }

    const plainRecord = {
      regId: cleanId,
      password: String(userData.password),
      name: String(userData.name).trim(),
      email: String(userData.email).trim(),
      hasVehicle: Boolean(userData.hasVehicle),
      vehicleReg: userData.vehicleReg || 'None',
      vehicleType: userData.vehicleType || 'None',
      registeredAt: new Date().toLocaleString()
    };

    const registered = JSON.parse(localStorage.getItem(this.STORAGE_KEY)) || [];
    registered.push(plainRecord);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(registered, null, 2));

    return { success: true, user: plainRecord };
  },

  authenticate(regId, password) {
    const cleanId = String(regId).trim();
    const cleanPass = String(password).trim();

    if (cleanId === this.DEFAULT_USER.regId && cleanPass === this.DEFAULT_USER.password) {
      return this.DEFAULT_USER;
    }

    const allUsers = this.getAllUsers();
    return allUsers.find(u => u.regId === cleanId && u.password === cleanPass);
  }
};