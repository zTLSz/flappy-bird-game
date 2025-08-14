export class TelegramIntegration {
  constructor() {
    this.isTelegramWebApp = false;
    this.user = null;
    this.init();
  }

  init() {
    // Проверяем, запущена ли игра в Telegram Web App
    if (window.Telegram && window.Telegram.WebApp && this.isTelegramEnvironment()) {
      this.isTelegramWebApp = true;
      this.webApp = window.Telegram.WebApp;
      
      // Инициализируем Web App
      this.webApp.ready();
      
      // Получаем данные пользователя
      this.user = this.webApp.initDataUnsafe?.user;
      
      // Настраиваем тему
      this.setupTheme();
      
      console.log('✅ Telegram Web App инициализирован:', this.user);
    } else {
      console.log('❌ Игра запущена вне Telegram Web App');
    }
  }

  // Проверяем, действительно ли мы в Telegram Web App
  isTelegramEnvironment() {
    // Проверяем наличие initData - это ключевой признак Telegram Web App
    const hasInitData = !!window.Telegram?.WebApp?.initData;
    
    if (!hasInitData) {
      return false;
    }
    
    // Проверяем, что мы в iframe (Telegram Web App всегда в iframe)
    const isInIframe = window.self !== window.top;
    
    if (!isInIframe) {
      return false;
    }
    
    // Проверяем user agent на наличие Telegram
    const userAgent = navigator.userAgent.toLowerCase();
    const hasTelegramInUserAgent = userAgent.includes('telegram');
    
    // Дополнительная проверка - наличие данных пользователя
    const hasUserData = !!window.Telegram?.WebApp?.initDataUnsafe?.user;
    
    return hasInitData && isInIframe && (hasTelegramInUserAgent || hasUserData);
  }

  setupTheme() {
    if (!this.isTelegramWebApp) return;

    // Применяем тему Telegram
    document.documentElement.style.setProperty('--tg-theme-bg-color', this.webApp.themeParams.bg_color || '#ffffff');
    document.documentElement.style.setProperty('--tg-theme-text-color', this.webApp.themeParams.text_color || '#000000');
    document.documentElement.style.setProperty('--tg-theme-button-color', this.webApp.themeParams.button_color || '#2481cc');
    document.documentElement.style.setProperty('--tg-theme-button-text-color', this.webApp.themeParams.button_text_color || '#ffffff');
  }

  // Получить информацию о пользователе
  getUser() {
    return this.user;
  }

  // Получить имя пользователя
  getUserName() {
    if (this.user) {
      return this.user.first_name || this.user.username || 'Игрок';
    }
    return 'Игрок';
  }

  // Получить ID пользователя
  getUserId() {
    return this.user?.id || null;
  }

  // Проверить, запущена ли игра в Telegram
  isInTelegram() {
    return this.isTelegramWebApp;
  }

  // Показать главное меню Telegram
  showMainButton(text, callback) {
    if (!this.isTelegramWebApp) return;

    this.webApp.MainButton.setText(text);
    this.webApp.MainButton.onClick(callback);
    this.webApp.MainButton.show();
  }

  // Скрыть главное меню Telegram
  hideMainButton() {
    if (!this.isTelegramWebApp) return;
    this.webApp.MainButton.hide();
  }

  // Показать всплывающее окно
  showPopup(title, message, buttons = []) {
    if (!this.isTelegramWebApp) return;
    this.webApp.showPopup({ title, message, buttons });
  }

  // Показать алерт
  showAlert(message) {
    if (!this.isTelegramWebApp) return;
    this.webApp.showAlert(message);
  }

  // Показать подтверждение
  showConfirm(message, callback) {
    if (!this.isTelegramWebApp) return;
    this.webApp.showConfirm(message, callback);
  }

  // Закрыть Web App
  close() {
    if (!this.isTelegramWebApp) return;
    this.webApp.close();
  }

  // Получить данные инициализации
  getInitData() {
    if (!this.isTelegramWebApp) return null;
    return this.webApp.initData;
  }

  // Получить безопасные данные инициализации
  getInitDataUnsafe() {
    if (!this.isTelegramWebApp) return null;
    return this.webApp.initDataUnsafe;
  }

  // Метод для отладки - получить всю информацию о состоянии
  getDebugInfo() {
    return {
      isTelegramWebApp: this.isTelegramWebApp,
      hasTelegramSDK: !!window.Telegram,
      hasWebApp: !!window.Telegram?.WebApp,
      hasInitData: !!window.Telegram?.WebApp?.initData,
      hasUserData: !!window.Telegram?.WebApp?.initDataUnsafe?.user,
      isInIframe: window.self !== window.top,
      userAgent: navigator.userAgent,
      user: this.user
    };
  }
}
