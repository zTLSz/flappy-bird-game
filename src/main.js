import { GameRenderer } from './GameRenderer.js';
import { GameLoop } from './GameLoop.js';
import { UI } from './UI.js';
import { Assets } from './Assets.js';
import { Bird } from './Bird.js';
import { Pipes } from './Pipes.js';
import { Collision } from './Collision.js';
import { Ground } from './Ground.js';
import { Background } from './Background.js';
import { Leaderboard } from './Leaderboard.js';
import { Bonus } from './Bonus.js';
import { AntiBonus } from './AntiBonus.js';
import { TelegramUser } from './TelegramUser.js';
import { ProfileIntegration } from './ProfileIntegration.js';

// Простейший gameState-заглушка
const gameState = {
  _state: 'start',
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
      telegramUser,
      totalEarned
    );
  }

  async function showGameOverScreen() {
    const score = gameLoop.getScore();
    
    // Сохраняем счёт при проигрыше
    await leaderboard.addScore(score, telegramUser);
    
    // Обновляем профиль с результатами игры
    if (score > 0) {
      const coinsEarned = Math.floor(score / 5); // 1 монета за каждые 5 очков
      await profileIntegration.updateProfileAfterGame(score, coinsEarned);
      await profileIntegration.checkAchievements(score);
    }
    
    // Получаем данные о токенах для отображения
    const currentProfile = profileIntegration.getCurrentProfile();
    const gameTokensEarned = score > 0 ? Math.floor(score / 5) : 0;
    const totalTokensEarned = currentProfile ? currentProfile.coins.totalEarned : 0;
    
    ui.showGameOver(
      score,
      () => {
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
      gameTokensEarned,
      totalTokensEarned
    );
    
    // Обновляем отображение токенов после игры
    const updatedProfile = profileIntegration.getCurrentProfile();
    if (updatedProfile) {
      ui.updateTokenDisplay(updatedProfile.coins.totalEarned);
    }
  }

  // Рендерим начальный кадр
  renderer.render();
  
  // Запускаем фоновую музыку один раз при инициализации
  assets.playBackgroundMusic();
  
  // Запускаем инициализацию данных (включая профиль) после создания всех игровых объектов
  initializeGameData().then(() => {
    // После инициализации данных показываем стартовый экран
    updateUIByState();
  }).catch((error) => {
    console.error('❌ Ошибка инициализации:', error);
    // Даже при ошибке показываем стартовый экран
    updateUIByState();
  });
}); 