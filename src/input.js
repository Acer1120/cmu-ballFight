import { canvas } from './canvas.js';
import { game } from './state.js';
import { rulesConfig, defaultRules } from './constants.js';
import { syncPlayersWithRules, adjustRule, startGame, resetGame, useAbility } from './game-logic.js';

export function setupInput() {
  canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (game.state === 'start') {
      // Handle game mode selection
      if (200 <= x && x <= 520 && 520 <= y && y <= 600) {
        game.gameMode = 'pvp';
      } else if (550 <= x && x <= 870 && 520 <= y && y <= 600) {
        game.gameMode = 'pvc';
      }
    } else if (game.state === 'rules') {
      if (game.editingRule) {
        const val = parseFloat(game.inputValue);
        if (!isNaN(val)) {
          game.rules[game.editingRule] = val;
          syncPlayersWithRules();
        }
      }

      const settings = rulesConfig();
      const startY = 210;
      const rowH = 80;
      settings.forEach((s, i) => {
        const yStart = startY + i * rowH - 25;
        const yEnd = yStart + 70;
        if (y >= yStart && y <= yEnd) {
          if (640 <= x && x <= 700) adjustRule(s.id, -1);
          else if (850 <= x && x <= 910) adjustRule(s.id, 1);
          else if (720 <= x && x <= 830) {
            if (game.editingRule !== s.id) {
              game.editingRule = s.id;
              game.inputValue = '';
            }
          }
        }
      });

      if (game.editingRule && !(720 <= x && x <= 830)) {
        game.editingRule = null;
      }

      if (375 <= x && x <= 625 && 820 <= y && y <= 890) {
        syncPlayersWithRules();
        game.state = 'weaponSelect';
      }

      if (375 <= x && x <= 625 && 900 <= y && y <= 960) {
        game.rules = { ...defaultRules };
        syncPlayersWithRules();
      }
    } else if (game.state === 'weaponSelect') {
      if (125 <= x && x <= 375) {
        if (350 <= y && y <= 450) game.weapon1 = 'sword';
        else if (475 <= y && y <= 575) game.weapon1 = 'spear';
        else if (600 <= y && y <= 700) game.weapon1 = 'unarmed';
      }
      if (625 <= x && x <= 875) {
        if (350 <= y && y <= 450) game.weapon2 = 'sword';
        else if (475 <= y && y <= 575) game.weapon2 = 'spear';
        else if (600 <= y && y <= 700) game.weapon2 = 'unarmed';
      }
      if (375 <= x && x <= 625 && 800 <= y && y <= 900) {
        game.state = 'abilitySelect';
      }
    } else if (game.state === 'abilitySelect') {
      const abs = ['shield', 'boost', 'reverse', 'dash', 'mark'];
      if (75 <= x && x <= 425) {
        abs.forEach((a, i) => {
          if (187 + i * 117 <= y && y <= 292 + i * 117) game.ability1 = a;
        });
      }
      if (575 <= x && x <= 925) {
        abs.forEach((a, i) => {
          if (187 + i * 117 <= y && y <= 292 + i * 117) game.ability2 = a;
        });
      }
      
      if (
        game.ability1 &&
        game.ability2 &&
        375 <= x &&
        x <= 625 &&
        825 <= y &&
        y <= 925
      ) {
        startGame();
      }
    } else if (game.state === 'playing' && game.winner) {
      resetGame();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (game.editingRule) {
      if (e.key === 'Enter') {
        const val = parseFloat(game.inputValue);
        if (!isNaN(val)) {
          game.rules[game.editingRule] = val;
          syncPlayersWithRules();
        }
        game.editingRule = null;
      } else if (e.key === 'Backspace') {
        game.inputValue = game.inputValue.slice(0, -1);
      } else if (e.key.length === 1) {
        game.inputValue += e.key;
      }
      return;
    }

    if (game.state === 'start' && e.code === 'Space') {
      game.state = 'rules';
    } else if (game.state === 'playing' && !game.winner) {
      if (!game.started) {
        game.p1.vx = 2;
        game.p1.vy = 3.5;
        game.p2.vx = -2.5;
        game.p2.vy = 3;
        game.started = true;
      }


      if (e.key === 'q') useAbility(game.p1, game.p2, game.ability1, true);
      else if (e.key === 'w') useAbility(game.p1, game.p2, game.ability1, false);
      else if ((e.key === 'o' || e.key === 'p') && game.gameMode === 'pvp') {
        if (e.key === 'o') useAbility(game.p2, game.p1, game.ability2, true);
        else if (e.key === 'p') useAbility(game.p2, game.p1, game.ability2, false);
      }
    } else if (game.state === 'playing' && game.winner && e.code === 'Space') {
      resetGame();
    }
  });
}