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

assets.loadAll().then(() => {
  // Создаём реальную птичку
  const bird = new Bird(canvas.width, canvas.height);
  bird.setSprite(assets.getImage('bird'));
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

  // Обновляем модули с реальными объектами
  const modules = {
    bird: bird,
    pipes: pipes,
    collision: collision,
    background: background,
    ground: ground,
    leaderboard: leaderboard,
    bonus: bonus,
  };

  // Обновляем renderer с новыми модулями
  renderer.bird = bird;
  renderer.pipes = pipes;
  renderer.ground = ground;
  renderer.background = background;
  renderer.bonus = bonus;

  const gameLoop = new GameLoop(modules, gameState, () => {
    renderer.render();
    if (gameState.isPlaying()) {
      ui.showScore(gameLoop.getScore());
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

  function showStartScreen() {
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
        ui.updateLeaderboardList(leaderboard.getTopScores());
      }
    );
  }

  function showGameOverScreen() {
    // Сохраняем счёт при проигрыше
    leaderboard.addScore(gameLoop.getScore());
    
    ui.showGameOver(
      gameLoop.getScore(),
      () => {
        gameLoop.reset();
        gameLoop.start();
        ui.showScore(0);
      },
      () => {
        ui.showLeaderboard(() => {
          updateUIByState();
        });
        ui.updateLeaderboardList(leaderboard.getTopScores());
      }
    );
  }

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

  updateUIByState();
  renderer.render();
}); 