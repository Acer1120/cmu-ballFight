import { update, syncPlayersWithRules } from './game-logic.js';
import { draw } from './renderer.js';
import { setupInput } from './input.js';

// Initialize game
syncPlayersWithRules();
setupInput();

function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

gameLoop();