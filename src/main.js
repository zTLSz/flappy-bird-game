import { GameRenderer } from './core/GameRenderer.js';
import { GameLoop } from './core/GameLoop.js';
import { UI } from './ui/UI.js';
import { Assets } from './services/Assets.js';
import { Bird } from './entities/Bird.js';
import { Pipes } from './entities/Pipes.js';
import { Collision } from './core/Collision.js';
import { Ground } from './entities/Ground.js';
import { Background } from './entities/Background.js';
import { Leaderboard } from './services/Leaderboard.js';
import { Bonus } from './entities/Bonus.js';
import { AntiBonus } from './entities/AntiBonus.js';
import { TelegramUser } from './services/TelegramUser.js';
import { ProfileIntegration } from './services/ProfileIntegration.js';

// Простейший gameState-заглушка
const gameState = {
  _state: 'start',
  _gameOverProcessed: false, // Флаг для предотвращения повторной обработки Game Over
  setState(state) { this._state = state; },
  isPlaying() { return this._state === 'playing'; },
  isGameOver() { return this._state === 'gameOver'; },
  isStart() { return this._state === 'start'; },
};

const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');



const renderer = new GameRenderer(canvas, ctx, {});
const ui = new UI();
const assets = new Assets();
const leaderboard = new Leaderboard();

// Инициализируем модуль для работы с пользователем Telegram
const telegramUser = new TelegramUser();

// Инициализируем систему профилей
const profileIntegration = new ProfileIntegration();

// Инициализируем лидерборд и профиль асинхронно
async function initializeGameData() {
  try {
    // Загружаем лидерборд
    await leaderboard.load();
    console.log('✅ Leaderboard загружен');
    
    // Инициализируем профиль пользователя
    const profileInitialized = await profileIntegration.initializeProfile();
    if (profileInitialized) {
      console.log('✅ Профиль пользователя инициализирован');
    } else {
      console.warn('⚠️ Профиль не инициализирован, игра продолжится без сохранения');
    }
    
    // После инициализации данных показываем стартовый экран
    return true;
  } catch (e) {
    console.error('❌ Ошибка инициализации данных:', e);
    return false;
  }
}

// Функция для адаптивного изменения размера canvas
function resizeCanvas() {
    const isMobile = window.innerWidth <= 500;
    
    if (isMobile) {
      // На мобильных устройствах используем полный экран
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    } else {
      // На десктопе используем фиксированный размер
      canvas.width = 800;
      canvas.height = 600;
    }
    
    // Уведомляем renderer об изменении размера
    if (renderer) {
      renderer.resize(canvas.width, canvas.height);
    }
  }
  
  // Инициализируем размер canvas
  resizeCanvas();
  
  // Слушаем изменение размера окна
  window.addEventListener('resize', resizeCanvas);
  
  // Обработчик для запуска аудио контекста при первом клике
  let audioContextStarted = false;
  function startAudioContext() {
    if (!audioContextStarted && assets._audioCtx && assets._audioCtx.state === 'suspended') {
      assets._audioCtx.resume();
      audioContextStarted = true;
    }
  }
  
  // Добавляем обработчики для запуска аудио
  canvas.addEventListener('click', startAudioContext);
  canvas.addEventListener('touchstart', startAudioContext);

assets.loadAll().then(() => {
  // Создаём реальную птичку
  const bird = new Bird(canvas.width, canvas.height);
  bird.setSprite(assets.getBirdSkinImage()); // Используем текущий скин
  bird.onJumpSound = () => assets.getSound('jump')();

  // Создаём реальные трубы
  const pipes = new Pipes(canvas.width, canvas.height);
  pipes.setSprite(assets.getImage('pipe'));

  // Создаём модуль столкновений
  const collision = new Collision(canvas.height);

  // Создаём землю
  const ground = new Ground(canvas.width, canvas.height);

  // Создаём фон
  const background = new Background(canvas.width, canvas.height);

  // Создаём бонусы
  const bonus = new Bonus(canvas.width, canvas.height);
  bonus.setPipes(pipes); // Передаём ссылку на трубы

  // Создаём антибонусы
  const antiBonus = new AntiBonus(canvas.width, canvas.height);
  antiBonus.setPipes(pipes); // Передаём ссылку на трубы

  // Обновляем модули с реальными объектами
  const modules = {
    bird: bird,
    pipes: pipes,
    collision: collision,
    background: background,
    ground: ground,
    leaderboard: leaderboard,
    bonus: bonus,
    antiBonus: antiBonus,
  };

  // Обновляем renderer с новыми модулями
  renderer.bird = bird;
  renderer.pipes = pipes;
  renderer.ground = ground;
  renderer.background = background;
  renderer.bonus = bonus;
  renderer.antiBonus = antiBonus;

  const gameLoop = new GameLoop(modules, gameState, () => {
    renderer.render();
    if (gameState.isPlaying()) {
      const score = gameLoop.getScore();
      ui.showScore(score);
      
      // Обновляем отображение токенов в реальном времени
      const currentProfile = profileIntegration.getCurrentProfile();
      if (currentProfile) {
        const totalEarned = currentProfile.coins.totalEarned;
        ui.updateTokenDisplay(totalEarned);
      }
    }
  });

  // Добавляем звук столкновения
  gameLoop.onHitSound = () => assets.getSound('hit')();
  
  // Добавляем звук начисления очка
  gameLoop.onScoreSound = () => assets.getSound('score')();

  // Делегируем ввод из renderer в gameLoop
  renderer.bindInputHandlers(type => {
    gameLoop.handleInput(type);
  });

  // Управление UI по состоянию игры
  function updateUIByState() {
    if (gameState.isStart()) {
      showStartScreen();
    } else if (gameState.isGameOver()) {
      showGameOverScreen();
    }
  }

  // Функция для обработки вывода токенов
  async function handleWithdrawTokens() {
    try {
      // Получаем информацию о токенах
      const currentProfile = profileIntegration.getCurrentProfile();
      const totalTokens = currentProfile ? currentProfile.coins.totalEarned : 0;
      
      // Показываем экран вывода токенов (доступен всегда)
      ui.showWithdrawScreen(
        () => {
          // Обработчик кнопки "Назад"
          updateUIByState();
        },
        async (walletAddress, tokensAmount) => {
          // Обработчик кнопки "Подтвердить вывод"
          await processWithdrawTokens(walletAddress, tokensAmount);
        },
        totalTokens
      );
      
    } catch (error) {
      console.error('❌ Ошибка при выводе токенов:', error);
      alert('Произошла ошибка при выводе токенов. Попробуйте позже.');
    }
  }

  // Функция для обработки подтверждения вывода токенов
  async function processWithdrawTokens(walletAddress, tokensAmount) {
    try {
      console.log('💰 Запрос на вывод токенов:', {
        walletAddress,
        tokensAmount
      });
      
      // Отправляем POST запрос на сервер
      const response = await fetch(`https://flappy-send-token-production.up.railway.app/send_tokens?wallet=${encodeURIComponent(walletAddress)}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: tokensAmount
        })
      });
      
      if (!response.ok) {
        const errorData = await response.text();
        console.error('❌ Ошибка сервера:', response.status, errorData);
        alert(`Ошибка сервера: ${response.status}\n${errorData}`);
        return;
      }
      
      const result = await response.json();
      console.log('✅ Токены успешно отправлены:', result);
      
      // Уменьшаем количество токенов в Firebase на 1
      await decreaseUserTokens(1);
      
      alert('✅ Токены успешно отправлены на ваш кошелек!');
      
      // Возвращаемся на предыдущий экран
      updateUIByState();
      
    } catch (error) {
      console.error('❌ Ошибка при обработке вывода токенов:', error);
      alert('Произошла ошибка при выводе токенов. Попробуйте позже.');
    }
  }

  // Функция для уменьшения токенов пользователя в Firebase
  async function decreaseUserTokens(amount) {
    try {
      const currentProfile = profileIntegration.getCurrentProfile();
      if (!currentProfile) {
        console.error('❌ Профиль пользователя не найден');
        return;
      }
      
      const userId = telegramUser.getUserId();
      if (!userId) {
        console.error('❌ ID пользователя не найден');
        return;
      }
      
      const newTotalEarned = Math.max(0, currentProfile.coins.totalEarned - amount);
      
      // Обновляем профиль в Firebase
      const updatedProfile = {
        ...currentProfile,
        coins: {
          ...currentProfile.coins,
          totalEarned: newTotalEarned
        }
      };
      
      const success = await profileIntegration.profileManager.updateProfile(userId, updatedProfile);
      
      if (success) {
        // Обновляем локальный профиль
        profileIntegration.currentProfile = updatedProfile;
        console.log('✅ Токены обновлены в Firebase:', newTotalEarned);
      } else {
        throw new Error('Не удалось обновить профиль в Firebase');
      }
      
    } catch (error) {
      console.error('❌ Ошибка при обновлении токенов в Firebase:', error);
      throw error;
    }
  }

  // Следим за сменой состояния (в реальном gameState будет событие)
  const origSetState = gameState.setState.bind(gameState);
  gameState.setState = function(state) {
    origSetState(state);
    updateUIByState();
  };

  function showStartScreen() {
    // Получаем данные о заработанных токенах
    const currentProfile = profileIntegration.getCurrentProfile();
    const totalEarned = currentProfile ? currentProfile.coins.totalEarned : 0;
    
    
    ui.showStart(
      () => {
        // Сбрасываем флаги для новой игры
        profileIntegration.resetGameFlags();
        gameState._gameOverProcessed = false; // Сбрасываем флаг обработки Game Over
        gameLoop.reset();
        gameLoop.start();
        ui.showScore(0);
      },
      () => {
        ui.showLeaderboard(() => {
          updateUIByState();
        });
        ui.updateLeaderboardList(leaderboard.getTopScores(), leaderboard.isOnline);
      },
      () => {
        ui.showSkins(() => {
          updateUIByState();
        }, (skinIndex) => {
          const skins = assets.getAvailableBirdSkins();
          const selectedSkin = skins[skinIndex];
          if (assets.setBirdSkin(selectedSkin)) {
            bird.setSprite(assets.getBirdSkinImage());
          }
        }, assets.getCurrentBirdSkin());
      },
      () => {
        // Переключаем звук
        const isSoundOn = assets.toggleSound();
        ui.updateSoundButton(isSoundOn);
      },
      () => {
        // Вывод токенов
        handleWithdrawTokens();
      },
      telegramUser,
      totalEarned
    );
    
    // Обновляем состояние кнопки звука после показа экрана
    ui.updateSoundButton(assets.isSoundOn());
  }

  async function showGameOverScreen() {
    const score = gameLoop.getScore();
    
    // Сохраняем счёт при проигрыше
    await leaderboard.addScore(score, telegramUser);
    
    // Обновляем профиль с результатами игры (только если это первое показывание Game Over)
    if (score > 0 && !gameState._gameOverProcessed) {
      const coinsEarned = Math.floor(score / 5); // 1 монета за каждые 5 очков
      await profileIntegration.updateProfileAfterGame(score, coinsEarned);
      await profileIntegration.checkAchievements(score);
      
      // Отмечаем, что Game Over уже обработан
      gameState._gameOverProcessed = true;
    }
    
    // Получаем данные о токенах для отображения
    const currentProfile = profileIntegration.getCurrentProfile();
    const gameTokensEarned = score > 0 ? Math.floor(score / 5) : 0;
    const totalTokensEarned = currentProfile ? currentProfile.coins.totalEarned : 0;
    
    ui.showGameOver(
      score,
      () => {
        // Сбрасываем флаги для новой игры
        profileIntegration.resetGameFlags();
        gameState._gameOverProcessed = false; // Сбрасываем флаг обработки Game Over
        gameLoop.reset();
        gameLoop.start();
        ui.showScore(0);
      },
      () => {
        ui.showLeaderboard(() => {
          updateUIByState();
        });
        ui.updateLeaderboardList(leaderboard.getTopScores(), leaderboard.isOnline);
      },
      () => {
        ui.showSkins(() => {
          updateUIByState();
        }, (skinIndex) => {
          const skins = assets.getAvailableBirdSkins();
          const selectedSkin = skins[skinIndex];
          if (assets.setBirdSkin(selectedSkin)) {
            bird.setSprite(assets.getBirdSkinImage());
          }
        }, assets.getCurrentBirdSkin());
      },
      () => {
        // Переключаем звук
        const isSoundOn = assets.toggleSound();
        ui.updateSoundButton(isSoundOn);
      },
      () => {
        // Вывод токенов
        handleWithdrawTokens();
      },
      gameTokensEarned,
      totalTokensEarned
    );
    
    // Обновляем отображение токенов после игры
    const updatedProfile = profileIntegration.getCurrentProfile();
    if (updatedProfile) {
      ui.updateTokenDisplay(updatedProfile.coins.totalEarned);
    }
    
    // Обновляем состояние кнопки звука после показа экрана
    ui.updateSoundButton(assets.isSoundOn());
  }

  // Рендерим начальный кадр
  renderer.render();
  
  // Запускаем фоновую музыку один раз при инициализации
  assets.playBackgroundMusic();
  
  // Запускаем инициализацию данных (включая профиль) после создания всех игровых объектов
  initializeGameData().then(() => {
    // После инициализации данных показываем стартовый экран
    updateUIByState();
    
    // Инициализируем состояние кнопки звука
    ui.updateSoundButton(assets.isSoundOn());
  }).catch((error) => {
    console.error('❌ Ошибка инициализации:', error);
    // Даже при ошибке показываем стартовый экран
    updateUIByState();
    
    // Инициализируем состояние кнопки звука
    ui.updateSoundButton(assets.isSoundOn());
  });
}); 