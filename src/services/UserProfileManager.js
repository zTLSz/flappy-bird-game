export class UserProfileManager {
  constructor() {
    this.isOnline = false;
    this.checkFirebaseAvailability();
  }

  /**
   * Проверяет доступность Firebase
   */
  checkFirebaseAvailability() {
    this.isOnline = !!(window.firebaseDB && window.firebaseRef && window.firebaseSet && window.firebaseGet);
  }

  /**
   * Создает дефолтные значения для нового профиля
   * @param {Object} telegramUser - объект TelegramUser
   * @returns {Object} дефолтный профиль
   */
  createDefaultProfile(telegramUser) {
    const now = Date.now();
    const userId = telegramUser.getUserId() || `browser_${Date.now()}`;
    const username = telegramUser.getUserName() || 'Игрок';

    return {
      profile: {
        username: username,
        telegramId: telegramUser.getUserId(),
        firstSeen: now,
        lastActive: now,
        totalGamesPlayed: 0,
        bestScore: 0
      },
      coins: {
        balance: 0,
        totalEarned: 0,
        totalSpent: 0,
        lastUpdated: now
      },
      gameHistory: {
        lastGame: null,
        dailyStats: {}
      },
      transactions: {},
      achievements: {
        firstGame: {
          unlocked: false,
          timestamp: null,
          reward: 10
        },
        score10: {
          unlocked: false,
          required: 10,
          current: 0,
          reward: 5
        },
        score25: {
          unlocked: false,
          required: 25,
          current: 0,
          reward: 10
        },
        score50: {
          unlocked: false,
          required: 50,
          current: 0,
          reward: 20
        },
        score100: {
          unlocked: false,
          required: 100,
          current: 0,
          reward: 50
        },
        streak3: {
          unlocked: false,
          required: 3,
          current: 0,
          reward: 15
        },
        streak7: {
          unlocked: false,
          required: 7,
          current: 0,
          reward: 30
        }
      },
      settings: {
        autoWithdraw: false,
        withdrawThreshold: 100,
        notifications: true
      }
    };
  }

  /**
   * Проверяет существование профиля пользователя
   * @param {string} userId - ID пользователя
   * @returns {Promise<boolean>} существует ли профиль
   */
  async profileExists(userId) {
    if (!this.isOnline || !userId) {
      return false;
    }

    try {
      const userRef = window.firebaseRef(window.firebaseDB, `users/${userId}`);
      const snapshot = await window.firebaseGet(userRef);
      return snapshot.exists();
    } catch (error) {
      console.error('❌ Ошибка проверки существования профиля:', error);
      return false;
    }
  }

  /**
   * Создает новый профиль пользователя
   * @param {Object} telegramUser - объект TelegramUser
   * @returns {Promise<Object>} результат создания
   */
  async createProfile(telegramUser) {
    if (!this.isOnline) {
      return { success: false, error: 'Firebase недоступен' };
    }

    const userId = telegramUser.getUserId();
    if (!userId) {
      return { success: false, error: 'ID пользователя не найден' };
    }

    try {
      // Проверяем, не существует ли уже профиль
      const exists = await this.profileExists(userId);
      if (exists) {
        console.log('ℹ️ Профиль уже существует для пользователя:', userId);
        return { success: true, message: 'Профиль уже существует' };
      }

      // Создаем дефолтный профиль
      const defaultProfile = this.createDefaultProfile(telegramUser);
      
      // Сохраняем в Firebase
      const userRef = window.firebaseRef(window.firebaseDB, `users/${userId}`);
      await window.firebaseSet(userRef, defaultProfile);


      // Кэшируем в localStorage для офлайн работы
      this.cacheProfile(userId, defaultProfile);

      return { 
        success: true, 
        message: 'Профиль успешно создан',
        profile: defaultProfile
      };

    } catch (error) {
      console.error('❌ Ошибка создания профиля:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Получает профиль пользователя
   * @param {string} userId - ID пользователя
   * @returns {Promise<Object|null>} профиль пользователя
   */
  async getProfile(userId) {
    if (!userId) {
      return null;
    }

    // Сначала пробуем получить из кэша
    const cachedProfile = this.getCachedProfile(userId);
    
    if (!this.isOnline) {
      return cachedProfile;
    }

    try {
      const userRef = window.firebaseRef(window.firebaseDB, `users/${userId}`);
      const snapshot = await window.firebaseGet(userRef);
      
      if (snapshot.exists()) {
        const profile = snapshot.val();
        // Обновляем кэш
        this.cacheProfile(userId, profile);
        return profile;
      } else {
        console.log('ℹ️ Профиль не найден для пользователя:', userId);
        return null;
      }
    } catch (error) {
      console.error('❌ Ошибка получения профиля:', error);
      return cachedProfile; // Возвращаем кэшированную версию при ошибке
    }
  }

  /**
   * Обновляет профиль пользователя
   * @param {string} userId - ID пользователя
   * @param {Object} updatedProfile - обновленный профиль
   * @returns {Promise<boolean>} успешность обновления
   */
  async updateProfile(userId, updatedProfile) {
    if (!this.isOnline || !userId) {
      return false;
    }

    try {
      const userRef = window.firebaseRef(window.firebaseDB, `users/${userId}`);
      await window.firebaseSet(userRef, updatedProfile);
      
      // Обновляем кэш
      this.cacheProfile(userId, updatedProfile);

      return true;
    } catch (error) {
      console.error('❌ Ошибка обновления профиля:', error);
      return false;
    }
  }

  /**
   * Обновляет время последней активности пользователя
   * @param {string} userId - ID пользователя
   * @returns {Promise<boolean>} успешность обновления
   */
  async updateLastActive(userId) {
    if (!this.isOnline || !userId) {
      return false;
    }

    try {
      const now = Date.now();
      const userRef = window.firebaseRef(window.firebaseDB, `users/${userId}/profile/lastActive`);
      await window.firebaseSet(userRef, now);
      
      // Обновляем кэш
      const cachedProfile = this.getCachedProfile(userId);
      if (cachedProfile) {
        cachedProfile.profile.lastActive = now;
        this.cacheProfile(userId, cachedProfile);
      }

      return true;
    } catch (error) {
      console.error('❌ Ошибка обновления lastActive:', error);
      return false;
    }
  }

  /**
   * Обеспечивает существование профиля (создает если не существует)
   * @param {Object} telegramUser - объект TelegramUser
   * @returns {Promise<Object>} профиль пользователя
   */
  async ensureProfileExists(telegramUser) {
    const userId = telegramUser.getUserId();
    
    if (!userId) {
      console.warn('⚠️ Не удалось получить ID пользователя');
      return null;
    }

    // Проверяем существование профиля
    const exists = await this.profileExists(userId);
    
    if (!exists) {
      // Создаем новый профиль
      const createResult = await this.createProfile(telegramUser);
      if (!createResult.success) {
        console.error('❌ Не удалось создать профиль:', createResult.error);
        return null;
      }
    } else {
      // Обновляем время активности
      await this.updateLastActive(userId);
    }

    // Получаем и возвращаем профиль
    return await this.getProfile(userId);
  }

  /**
   * Кэширует профиль в localStorage
   * @param {string} userId - ID пользователя
   * @param {Object} profile - профиль пользователя
   */
  cacheProfile(userId, profile) {
    try {
      const cacheKey = `userProfile_${userId}`;
      localStorage.setItem(cacheKey, JSON.stringify({
        profile: profile,
        timestamp: Date.now()
      }));
    } catch (error) {
      console.warn('⚠️ Не удалось кэшировать профиль:', error);
    }
  }

  /**
   * Получает профиль из кэша
   * @param {string} userId - ID пользователя
   * @returns {Object|null} кэшированный профиль
   */
  getCachedProfile(userId) {
    try {
      const cacheKey = `userProfile_${userId}`;
      const cached = localStorage.getItem(cacheKey);
      
      if (cached) {
        const data = JSON.parse(cached);
        const cacheAge = Date.now() - data.timestamp;
        
        // Кэш действителен 24 часа
        if (cacheAge < 24 * 60 * 60 * 1000) {
          return data.profile;
        } else {
          // Удаляем устаревший кэш
          localStorage.removeItem(cacheKey);
        }
      }
    } catch (error) {
      console.warn('⚠️ Ошибка чтения кэшированного профиля:', error);
    }
    
    return null;
  }

  /**
   * Очищает кэш профиля
   * @param {string} userId - ID пользователя
   */
  clearCache(userId) {
    try {
      const cacheKey = `userProfile_${userId}`;
      localStorage.removeItem(cacheKey);
    } catch (error) {
      console.warn('⚠️ Ошибка очистки кэша:', error);
    }
  }

  /**
   * Получает отладочную информацию
   * @returns {Object} информация о состоянии
   */
  getDebugInfo() {
    return {
      isOnline: this.isOnline,
      hasFirebaseDB: !!window.firebaseDB,
      hasFirebaseRef: !!window.firebaseRef,
      hasFirebaseSet: !!window.firebaseSet,
      hasFirebaseGet: !!window.firebaseGet
    };
  }
}
