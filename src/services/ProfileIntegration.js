import { UserProfileManager } from './UserProfileManager.js';
import { TelegramUser } from './TelegramUser.js';

/**
 * Пример интеграции UserProfileManager в игру
 */
export class ProfileIntegration {
  constructor() {
    this.profileManager = new UserProfileManager();
    this.telegramUser = new TelegramUser();
    this.currentProfile = null;
  }

  /**
   * Инициализация профиля при старте игры
   */
  async initializeProfile() {
    
    try {
      // Обеспечиваем существование профиля
      this.currentProfile = await this.profileManager.ensureProfileExists(this.telegramUser);
      
      if (this.currentProfile) {
        console.log('✅ Профиль инициализирован:', {
          username: this.currentProfile.profile.username,
          coins: this.currentProfile.coins.balance,
          gamesPlayed: this.currentProfile.profile.totalGamesPlayed
        });
        
        // Обновляем UI с информацией о профиле
        this.updateProfileUI();
        
        
        return true;
      } else {
        console.warn('⚠️ Не удалось инициализировать профиль');
        return false;
      }
    } catch (error) {
      console.error('❌ Ошибка инициализации профиля:', error);
      return false;
    }
  }

  /**
   * Обновляет UI с информацией о профиле
   */
  updateProfileUI() {
    if (!this.currentProfile) return;

    // Обновляем отображение токенов (используем totalEarned для главного экрана)
    const tokenElement = document.getElementById('token-display');
    if (tokenElement) {
      tokenElement.textContent = `${this.currentProfile.coins.totalEarned} 🪙`;
      console.log('💰 ProfileIntegration обновил токены:', this.currentProfile.coins.totalEarned);
    }

    // Обновляем имя пользователя
    const usernameElement = document.getElementById('username-display');
    if (usernameElement) {
      usernameElement.textContent = this.currentProfile.profile.username;
    }

    // Обновляем статистику
    const statsElement = document.getElementById('stats-display');
    if (statsElement) {
      statsElement.innerHTML = `
        <div>Игр сыграно: ${this.currentProfile.profile.totalGamesPlayed}</div>
        <div>Лучший счет: ${this.currentProfile.profile.bestScore}</div>
        <div>Монет заработано: ${this.currentProfile.coins.totalEarned}</div>
      `;
    }
  }

  /**
   * Обновляет профиль после завершения игры
   * @param {number} gameScore - счет игры
   * @param {number} coinsEarned - заработанные монеты
   */
  async updateProfileAfterGame(gameScore, coinsEarned) {
    if (!this.currentProfile) return;

    const userId = this.telegramUser.getUserId();
    if (!userId) return;

    try {
      // Обновляем статистику игры
      const updates = {
        [`users/${userId}/profile/totalGamesPlayed`]: this.currentProfile.profile.totalGamesPlayed + 1,
        [`users/${userId}/profile/lastActive`]: Date.now(),
        [`users/${userId}/coins/balance`]: this.currentProfile.coins.balance + coinsEarned,
        [`users/${userId}/coins/totalEarned`]: this.currentProfile.coins.totalEarned + coinsEarned,
        [`users/${userId}/coins/lastUpdated`]: Date.now()
      };

      // Обновляем лучший счет если нужно
      if (gameScore > this.currentProfile.profile.bestScore) {
        updates[`users/${userId}/profile/bestScore`] = gameScore;
      }

      // Обновляем последнюю игру
      updates[`users/${userId}/gameHistory/lastGame`] = {
        score: gameScore,
        coinsEarned: coinsEarned,
        timestamp: Date.now(),
        gameId: `game_${Date.now()}`
      };

      // Сохраняем обновления в Firebase
      if (this.profileManager.isOnline) {
        for (const [path, value] of Object.entries(updates)) {
          const ref = window.firebaseRef(window.firebaseDB, path);
          await window.firebaseSet(ref, value);
        }
      }

      // Обновляем локальный профиль
      this.currentProfile.profile.totalGamesPlayed++;
      this.currentProfile.profile.lastActive = Date.now();
      this.currentProfile.coins.balance += coinsEarned;
      this.currentProfile.coins.totalEarned += coinsEarned;
      this.currentProfile.coins.lastUpdated = Date.now();

      if (gameScore > this.currentProfile.profile.bestScore) {
        this.currentProfile.profile.bestScore = gameScore;
      }

      this.currentProfile.gameHistory.lastGame = {
        score: gameScore,
        coinsEarned: coinsEarned,
        timestamp: Date.now(),
        gameId: `game_${Date.now()}`
      };

      // Обновляем кэш
      this.profileManager.cacheProfile(userId, this.currentProfile);

      // Обновляем UI
      this.updateProfileUI();

      console.log('✅ Профиль обновлен после игры:', {
        score: gameScore,
        coinsEarned: coinsEarned,
        newBalance: this.currentProfile.coins.balance
      });

    } catch (error) {
      console.error('❌ Ошибка обновления профиля после игры:', error);
    }
  }

  /**
   * Проверяет и разблокирует достижения
   * @param {number} gameScore - счет игры
   */
  async checkAchievements(gameScore) {
    if (!this.currentProfile) return;

    const userId = this.telegramUser.getUserId();
    if (!userId) return;

    const achievements = this.currentProfile.achievements;
    const unlockedAchievements = [];

    // Проверяем достижения по счету
    if (gameScore >= 10 && !achievements.score10.unlocked) {
      achievements.score10.unlocked = true;
      achievements.score10.timestamp = Date.now();
      unlockedAchievements.push({ name: 'score10', reward: achievements.score10.reward });
    }

    if (gameScore >= 25 && !achievements.score25.unlocked) {
      achievements.score25.unlocked = true;
      achievements.score25.timestamp = Date.now();
      unlockedAchievements.push({ name: 'score25', reward: achievements.score25.reward });
    }

    if (gameScore >= 50 && !achievements.score50.unlocked) {
      achievements.score50.unlocked = true;
      achievements.score50.timestamp = Date.now();
      unlockedAchievements.push({ name: 'score50', reward: achievements.score50.reward });
    }

    if (gameScore >= 100 && !achievements.score100.unlocked) {
      achievements.score100.unlocked = true;
      achievements.score100.timestamp = Date.now();
      unlockedAchievements.push({ name: 'score100', reward: achievements.score100.reward });
    }

    // Если есть разблокированные достижения
    if (unlockedAchievements.length > 0) {
      let totalReward = 0;
      
      for (const achievement of unlockedAchievements) {
        totalReward += achievement.reward;
      }

      // Начисляем награды
      this.currentProfile.coins.balance += totalReward;
      this.currentProfile.coins.totalEarned += totalReward;

      // Сохраняем в Firebase
      if (this.profileManager.isOnline) {
        const userRef = window.firebaseRef(window.firebaseDB, `users/${userId}`);
        await window.firebaseSet(userRef, this.currentProfile);
      }

      // Обновляем кэш
      this.profileManager.cacheProfile(userId, this.currentProfile);

      // Показываем уведомление
      this.showAchievementNotification(unlockedAchievements, totalReward);

    }
  }

  /**
   * Показывает уведомление о достижениях
   * @param {Array} achievements - разблокированные достижения
   * @param {number} totalReward - общая награда
   */
  showAchievementNotification(achievements, totalReward) {
    const notification = document.createElement('div');
    notification.className = 'achievement-notification';
    notification.innerHTML = `
      <div class="achievement-header">🏆 Достижение разблокировано!</div>
      <div class="achievement-list">
        ${achievements.map(ach => `<div>${ach.name}: +${ach.reward} монет</div>`).join('')}
      </div>
      <div class="achievement-total">Общая награда: +${totalReward} монет</div>
    `;

    document.body.appendChild(notification);

    // Удаляем уведомление через 5 секунд
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 5000);
  }

  /**
   * Получает текущий профиль
   * @returns {Object|null} текущий профиль
   */
  getCurrentProfile() {
    return this.currentProfile;
  }

  /**
   * Получает баланс монет
   * @returns {number} баланс монет
   */
  getCoinBalance() {
    return this.currentProfile ? this.currentProfile.coins.balance : 0;
  }

  /**
   * Получает отладочную информацию
   * @returns {Object} отладочная информация
   */
  getDebugInfo() {
    return {
      profileManager: this.profileManager.getDebugInfo(),
      telegramUser: this.telegramUser.getDebugInfo(),
      currentProfile: this.currentProfile ? {
        username: this.currentProfile.profile.username,
        coins: this.currentProfile.coins.balance,
        gamesPlayed: this.currentProfile.profile.totalGamesPlayed
      } : null
    };
  }
}


