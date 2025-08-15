export class TelegramUser {
  constructor() {
    this.userName = null;
    this.userId = null;
    this.isTelegramWebApp = false;
    this.init();
  }

  init() {
    // Проверяем, запущена ли игра в Telegram Web App
    const isTelegram = window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.initData;
    
    if (isTelegram) {
      this.isTelegramWebApp = true;
      const user = window.Telegram.WebApp.initDataUnsafe?.user;
      
      if (user) {
        this.userName = user.first_name || user.username || 'Игрок';
        this.userId = user.id;
        console.log('✅ Telegram пользователь найден:', this.userName, '(ID:', this.userId, ')');
      } else {
        this.userName = 'Игрок';
        console.log('⚠️ Telegram Web App, но данные пользователя не найдены');
      }
    } else {
      this.userName = 'Игрок';
      console.log('🌐 Игра запущена в браузере');
    }
  }

  // Получить имя пользователя
  getUserName() {
    return this.userName;
  }

  // Получить ID пользователя
  getUserId() {
    return this.userId;
  }

  // Проверить, запущена ли игра в Telegram
  isInTelegram() {
    return this.isTelegramWebApp;
  }

  // Получить отладочную информацию
  getDebugInfo() {
    return {
      isTelegramWebApp: this.isTelegramWebApp,
      userName: this.userName,
      userId: this.userId,
      hasTelegramSDK: !!window.Telegram,
      hasWebApp: !!window.Telegram?.WebApp,
      hasInitData: !!window.Telegram?.WebApp?.initData,
      hasUserData: !!window.Telegram?.WebApp?.initDataUnsafe?.user
    };
  }
}
