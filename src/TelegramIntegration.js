export class TelegramIntegration {
  constructor() {
    this.isTelegramWebApp = false;
    this.user = null;
    this.init();
  }

  init() {
    console.log('🔍 Начинаем инициализацию Telegram Integration...');
    
    // Проверяем наличие Telegram SDK
    if (!window.Telegram) {
      console.log('❌ Telegram SDK не найден');
      return;
    }
    
    if (!window.Telegram.WebApp) {
      console.log('❌ Telegram WebApp не найден');
      return;
    }
    
    console.log('✅ Telegram SDK и WebApp найдены');
    
    // Проверяем, запущена ли игра в Telegram Web App
    if (this.isTelegramEnvironment()) {
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
      console.log('📊 Отладочная информация:', this.getDebugInfo());
    }
  }

  // Проверяем, действительно ли мы в Telegram Web App
  isTelegramEnvironment() {
    console.log('🔍 Проверяем среду Telegram...');
    
    // Проверяем наличие initData - это ключевой признак Telegram Web App
    const hasInitData = !!window.Telegram?.WebApp?.initData;
    console.log('📋 hasInitData:', hasInitData);
    
    if (!hasInitData) {
      console.log('❌ initData не найден');
      return false;
    }
    
    // Проверяем, что мы в iframe (Telegram Web App всегда в iframe)
    const isInIframe = window.self !== window.top;
    console.log('🖼️ isInIframe:', isInIframe);
    
    // Проверяем user agent на наличие Telegram
    const userAgent = navigator.userAgent.toLowerCase();
    const hasTelegramInUserAgent = userAgent.includes('telegram');
    console.log('🤖 hasTelegramInUserAgent:', hasTelegramInUserAgent);
    console.log('📱 User Agent:', userAgent);
    
    // Дополнительная проверка - наличие данных пользователя
    const hasUserData = !!window.Telegram?.WebApp?.initDataUnsafe?.user;
    console.log('👤 hasUserData:', hasUserData);
    
    // Упрощенная проверка: достаточно initData и iframe
    const result = hasInitData && isInIframe;
    console.log('🎯 Результат проверки:', result);
    
    return result;
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
      const name = this.user.first_name || this.user.username || 'Игрок';
      console.log('👤 getUserName:', name);
      return name;
    }
    console.log('👤 getUserName: Игрок (пользователь не найден)');
    return 'Игрок';
  }

  // Получить ID пользователя
  getUserId() {
    const id = this.user?.id || null;
    console.log('🆔 getUserId:', id);
    return id;
  }

  // Проверить, запущена ли игра в Telegram
  isInTelegram() {
    console.log('🔍 isInTelegram:', this.isTelegramWebApp);
    return this.isTelegramWebApp;
  }

  // Показать главное меню Telegram
  showMainButton(text, callback) {
    console.log('🔘 showMainButton:', text, 'isTelegramWebApp:', this.isTelegramWebApp);
    if (!this.isTelegramWebApp) {
      console.log('❌ showMainButton: не в Telegram Web App');
      return;
    }

    this.webApp.MainButton.setText(text);
    this.webApp.MainButton.onClick(callback);
    this.webApp.MainButton.show();
    console.log('✅ showMainButton: кнопка показана');
  }

  // Скрыть главное меню Telegram
  hideMainButton() {
    console.log('🔘 hideMainButton, isTelegramWebApp:', this.isTelegramWebApp);
    if (!this.isTelegramWebApp) {
      console.log('❌ hideMainButton: не в Telegram Web App');
      return;
    }
    this.webApp.MainButton.hide();
    console.log('✅ hideMainButton: кнопка скрыта');
  }

  // Показать всплывающее окно
  showPopup(title, message, buttons = []) {
    console.log('📱 showPopup:', title, 'isTelegramWebApp:', this.isTelegramWebApp);
    if (!this.isTelegramWebApp) return;
    this.webApp.showPopup({ title, message, buttons });
  }

  // Показать алерт
  showAlert(message) {
    console.log('📢 showAlert:', message, 'isTelegramWebApp:', this.isTelegramWebApp);
    if (!this.isTelegramWebApp) {
      console.log('❌ showAlert: не в Telegram Web App');
      return;
    }
    this.webApp.showAlert(message);
    console.log('✅ showAlert: алерт показан');
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
