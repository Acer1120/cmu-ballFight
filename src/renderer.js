import { ctx } from './canvas.js';
import { game } from './state.js';
import { rulesConfig } from './constants.js';

function drawText(text, x, y, size, color, bold = false, align = 'center') {
  ctx.font = `${bold ? 'bold ' : ''}${size}px Arial`;
  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.fillText(text, x, y);
}

function drawRect(x, y, w, h, fill, stroke = null, lineWidth = 1) {
  ctx.fillStyle = fill;
  ctx.fillRect(x, y, w, h);
  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = lineWidth;
    ctx.strokeRect(x, y, w, h);
  }
}

function drawCircle(x, y, r, fill, stroke = null, lineWidth = 1, opacity = 1) {
  ctx.globalAlpha = opacity;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  if (fill) {
    ctx.fillStyle = fill;
    ctx.fill();
  }
  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = lineWidth;
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
}

function drawRotRect(x, y, w, h, angle, color) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate((angle * Math.PI) / 180);
  ctx.fillStyle = color;
  ctx.fillRect(-w / 2, -h / 2, w, h);
  ctx.restore();
}

function drawStart() {
  ctx.fillStyle = 'rgb(80, 80, 80)';
  ctx.fillRect(0, 0, 1000, 1000);
  drawText('SWORD BATTLE', 500, 300, 100, 'white', true);
  drawText('SELECT GAME MODE', 500, 450, 50, 'white', true);
  
  // Player vs Player button
  drawRect(200, 520, 250, 80, 'lightBlue', 'white', game.gameMode === 'pvp' ? 8 : 3);
  drawText('PLAYER vs PLAYER', 325, 560, 28, 'black', true);
  
  // Player vs Computer button
  drawRect(550, 520, 250, 80, 'lightGreen', 'white', game.gameMode === 'pvc' ? 8 : 3);
  drawText('PLAYER vs COMPUTER', 675, 560, 28, 'black', true);
  
  drawText('Press SPACE to continue', 500, 700, 40, 'white');
}

function drawRules() {
  ctx.fillStyle = 'rgb(80, 80, 80)';
  ctx.fillRect(0, 0, 1000, 1000);
  drawText('CUSTOM GAME RULES', 500, 90, 70, 'white', true);
  drawText(
    'Click +/- to tweak. These apply to both players.',
    500,
    145,
    28,
    'white'
  );

  const settings = rulesConfig();
  const startY = 210;
  const rowH = 80;

  settings.forEach((s, i) => {
    const y = startY + i * rowH;
    drawRect(120, y - 25, 800, 70, 'rgba(0,0,0,0.25)', 'white', 2);
    drawText(s.label, 200, y - 5, 26, 'white', true, 'left');
    drawText(s.desc, 200, y + 25, 18, 'lightGray', false, 'left');

    drawRect(640, y - 15, 60, 50, 'crimson', 'white', 3);
    drawText('-', 670, y + 10, 36, 'white', true);

    drawRect(720, y - 15, 110, 50, 'black', 'white', 2);
    if (game.editingRule === s.id) {
      drawText(game.inputValue + '_', 775, y + 10, 26, 'yellow', true);
    } else {
      drawText(
        game.rules[s.id].toFixed(2).replace(/\.00$/, ''),
        775,
        y + 10,
        26,
        'yellow',
        true
      );
    }

    drawRect(850, y - 15, 60, 50, 'green', 'white', 3);
    drawText('+', 880, y + 10, 36, 'white', true);
  });

  drawRect(375, 820, 250, 70, 'green', 'white', 5);
  drawText('NEXT', 500, 855, 40, 'white', true);

  drawRect(375, 900, 250, 60, 'gray', 'white', 3);
  drawText('RESET DEFAULTS', 500, 930, 28, 'white', true);
}

function drawWeaponSelect() {
  ctx.fillStyle = 'rgb(80, 80, 80)';
  ctx.fillRect(0, 0, 1000, 1000);
  drawText('SELECT WEAPONS', 500, 125, 75, 'white', true);
  drawText('PLAYER 1 (Blue)', 250, 300, 45, 'dodgerBlue', true);
  const player2Label = game.gameMode === 'pvc' ? 'COMPUTER (Red)' : 'PLAYER 2 (Red)';
  drawText(player2Label, 750, 300, 45, 'crimson', true);

  // Player 1
  drawRect(
    125,
    350,
    297,
    100,
    'lightBlue',
    'white',
    game.weapon1 === 'sword' ? 10 : 5
  );
  drawText('SWORD', 250, 400, 35, 'black', true);

  drawRect(
    125,
    475,
    250,
    100,
    'lightBlue',
    'white',
    game.weapon1 === 'spear' ? 10 : 5
  );
  drawText('SPEAR', 250, 525, 35, 'black', true);

  drawRect(
    125,
    600,
    250,
    100,
    'lightBlue',
    'white',
    game.weapon1 === 'unarmed' ? 10 : 5
  );
  drawText('UNARMED', 250, 650, 35, 'black', true);

  // Player 2
  drawRect(
    625,
    350,
    250,
    100,
    'orange',
    'white',
    game.weapon2 === 'sword' ? 10 : 5
  );
  drawText('SWORD', 750, 400, 35, 'black', true);

  drawRect(
    625,
    475,
    250,
    100,
    'orange',
    'white',
    game.weapon2 === 'spear' ? 10 : 5
  );
  drawText('SPEAR', 750, 525, 35, 'black', true);

  drawRect(
    625,
    600,
    250,
    100,
    'orange',
    'white',
    game.weapon2 === 'unarmed' ? 10 : 5
  );
  drawText('UNARMED', 750, 650, 35, 'black', true);

  drawRect(375, 800, 250, 100, 'green', 'white', 5);
  drawText('NEXT', 500, 850, 45, 'white', true);
}

function drawAbilitySelect() {
  ctx.fillStyle = 'rgb(80, 80, 80)';
  ctx.fillRect(0, 0, 1000, 1000);
  drawText('SELECT ABILITIES', 500, 50, 75, 'white', true);
  drawText('PLAYER 1', 250, 137, 45, 'dodgerBlue', true);
  const player2Label = game.gameMode === 'pvc' ? 'COMPUTER' : 'PLAYER 2';
  drawText(player2Label, 750, 137, 45, 'crimson', true);

  const abilities = [
    {
      id: 'shield',
      name: 'REFLECT (Q/O)',
      desc: 'Block & reflect damage',
      y: 187,
    },
    { id: 'boost', name: 'BOOST (Q/O)', desc: '2x Speed 2.5s', y: 305 },
    {
      id: 'reverse',
      name: 'CHASE (Q/O) / FLEE (W/P)',
      desc: 'Move toward / away',
      y: 422,
    },
    { id: 'dash', name: 'DASH (Q/O)', desc: '3x Speed + ram dmg', y: 540 },
    {
      id: 'mark',
      name: 'MARK (Q/O & W/P)',
      desc: 'Place & move to marks',
      y: 657,
    },
  ];

  abilities.forEach((ab) => {
    drawRect(
      75,
      ab.y,
      350,
      105,
      'lightBlue',
      'white',
      game.ability1 === ab.id ? 10 : 5
    );
    drawText(
      ab.name,
      250,
      ab.y + 30,
      ab.id === 'reverse' ? 27 : 30,
      'black',
      true
    );
    drawText(ab.desc, 250, ab.y + 67, 20, 'black');

    drawRect(
      575,
      ab.y,
      350,
      105,
      'orange',
      'white',
      game.ability2 === ab.id ? 10 : 5
    );
    drawText(
      ab.name,
      750,
      ab.y + 30,
      ab.id === 'reverse' ? 27 : 30,
      'black',
      true
    );
    drawText(ab.desc, 750, ab.y + 67, 20, 'black');
  });

  if (game.ability1 && game.ability2) {
    drawRect(375, 825, 250, 100, 'green', 'white', 5);
    drawText('START', 500, 875, 45, 'white', true);
  }
}

function drawAbilityCooldowns() {
  const y = 112;

  if (game.ability1 === 'shield') {
    drawRect(25, y, 75, 20, game.p1.shieldCd === 0 ? 'green' : 'red');
    drawText('Q', 62, y - 20, 25, 'white', true);
  } else if (game.ability1 === 'boost') {
    drawRect(25, y, 75, 20, game.p1.boostCd === 0 ? 'green' : 'red');
    drawText('Q', 62, y - 20, 25, 'white', true);
  } else if (game.ability1 === 'reverse') {
    drawRect(25, y, 37, 20, game.p1.chaseCd === 0 ? 'green' : 'red');
    drawText('Q', 43, y - 20, 22, 'white', true);
    drawRect(67, y, 37, 20, game.p1.fleeCd === 0 ? 'green' : 'red');
    drawText('W', 85, y - 20, 22, 'white', true);
  } else if (game.ability1 === 'dash') {
    drawRect(25, y, 75, 20, game.p1.dashCd === 0 ? 'green' : 'red');
    drawText('Q', 62, y - 20, 25, 'white', true);
  } else if (game.ability1 === 'mark') {
    drawRect(25, y, 37, 20, game.p1.m1cd === 0 ? 'green' : 'red');
    drawText('Q', 43, y - 20, 22, 'white', true);
    drawRect(67, y, 37, 20, game.p1.m2cd === 0 ? 'green' : 'red');
    drawText('W', 85, y - 20, 22, 'white', true);
  }

  if (game.ability2 === 'shield') {
    drawRect(900, y, 75, 20, game.p2.shieldCd === 0 ? 'green' : 'red');
    drawText('O', 937, y - 20, 25, 'white', true);
  } else if (game.ability2 === 'boost') {
    drawRect(900, y, 75, 20, game.p2.boostCd === 0 ? 'green' : 'red');
    drawText('O', 937, y - 20, 25, 'white', true);
  } else if (game.ability2 === 'reverse') {
    drawRect(900, y, 37, 20, game.p2.chaseCd === 0 ? 'green' : 'red');
    drawText('O', 918, y - 20, 22, 'white', true);
    drawRect(942, y, 37, 20, game.p2.fleeCd === 0 ? 'green' : 'red');
    drawText('P', 960, y - 20, 22, 'white', true);
  } else if (game.ability2 === 'dash') {
    drawRect(900, y, 75, 20, game.p2.dashCd === 0 ? 'green' : 'red');
    drawText('O', 937, y - 20, 25, 'white', true);
  } else if (game.ability2 === 'mark') {
    drawRect(900, y, 37, 20, game.p2.m1cd === 0 ? 'green' : 'red');
    drawText('O', 918, y - 20, 22, 'white', true);
    drawRect(942, y, 37, 20, game.p2.m2cd === 0 ? 'green' : 'red');
    drawText('P', 960, y - 20, 22, 'white', true);
  }
}

function drawGame() {
  ctx.fillStyle = 'rgb(80, 80, 80)';
  ctx.fillRect(0, 0, 1000, 1000);

  if (game.slowTimer > 0) {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.fillRect(0, 0, 1000, 1000);
  }

  const p1HpTop = Math.max(0, Math.floor(game.p1.hp));
  const p2HpTop = Math.max(0, Math.floor(game.p2.hp));
  const player1Label = `PLAYER 1 - ${game.weapon1.toUpperCase()} (${p1HpTop} HP)`;
  const player2Label = game.gameMode === 'pvc' 
    ? `COMPUTER - ${game.weapon2.toUpperCase()} (${p2HpTop} HP)`
    : `PLAYER 2 - ${game.weapon2.toUpperCase()} (${p2HpTop} HP)`;
    
  drawText(
    player1Label,
    175,
    50,
    30,
    'dodgerBlue',
    true
  );
  drawText(
    player2Label,
    825,
    50,
    30,
    'crimson',
    true
  );

  if (game.p1.m1x !== null) {
    drawCircle(game.p1.m1x, game.p1.m1y, 20, 'dodgerBlue', null, 1, 0.6);
    drawText('Q', game.p1.m1x, game.p1.m1y, 25, 'white', true);
  }
  if (game.p1.m2x !== null) {
    drawCircle(game.p1.m2x, game.p1.m2y, 20, 'dodgerBlue', null, 1, 0.6);
    drawText('W', game.p1.m2x, game.p1.m2y, 25, 'white', true);
  }
  if (game.p2.m1x !== null) {
    drawCircle(game.p2.m1x, game.p2.m1y, 20, 'crimson', null, 1, 0.6);
    drawText('O', game.p2.m1x, game.p2.m1y, 25, 'white', true);
  }
  if (game.p2.m2x !== null) {
    drawCircle(game.p2.m2x, game.p2.m2y, 20, 'crimson', null, 1, 0.6);
    drawText('P', game.p2.m2x, game.p2.m2y, 25, 'white', true);
  }

  drawCircle(
    game.p1.x,
    game.p1.y,
    game.p1.r,
    game.p1.white > 0 ? 'white' : 'dodgerBlue'
  );
  drawCircle(
    game.p2.x,
    game.p2.y,
    game.p2.r,
    game.p2.white > 0 ? 'white' : 'crimson'
  );

  if (game.p1.shieldAct > 0)
    drawCircle(game.p1.x, game.p1.y, game.p1.r + 20, null, 'yellow', 10);
  if (game.p2.shieldAct > 0)
    drawCircle(game.p2.x, game.p2.y, game.p2.r + 20, null, 'yellow', 10);
  if (game.p1.boostAct > 0)
    drawCircle(game.p1.x, game.p1.y, game.p1.r + 12, null, 'cyan', 7, 0.5);
  if (game.p2.boostAct > 0)
    drawCircle(game.p2.x, game.p2.y, game.p2.r + 12, null, 'cyan', 7, 0.5);
  if (game.p1.dashAct > 0)
    drawCircle(game.p1.x, game.p1.y, game.p1.r + 20, null, 'red', 10, 0.7);
  if (game.p2.dashAct > 0)
    drawCircle(game.p2.x, game.p2.y, game.p2.r + 20, null, 'red', 10, 0.7);

  const w1 = game.weaponStats[game.weapon1];
  const w2 = game.weaponStats[game.weapon2];
  drawRotRect(
    game.s1x,
    game.s1y,
    w1.width,
    w1.length,
    game.p1.angle + 90,
    'lightBlue'
  );
  drawRotRect(
    game.s2x,
    game.s2y,
    w2.width,
    w2.length,
    game.p2.angle + 90,
    'orange'
  );

  drawText(
    Math.max(0, Math.floor(game.p1.hp)).toString(),
    game.p1.x,
    game.p1.y,
    45,
    'black',
    true
  );
  drawText(
    Math.max(0, Math.floor(game.p2.hp)).toString(),
    game.p2.x,
    game.p2.y,
    45,
    'black',
    true
  );

  drawRect(12, 912, 200, 75, 'rgba(0, 0, 0, 0.8)', 'dodgerBlue', 5);
  if (game.weapon1 === 'unarmed') {
    drawText(`x${1 + game.p1.unarmedHits}`, 112, 950, 50, 'yellow', true);
  } else {
    drawText(`x${game.p1.mult.toFixed(2)}`, 112, 950, 50, 'yellow', true);
  }

  drawRect(787, 912, 200, 75, 'rgba(0, 0, 0, 0.8)', 'crimson', 5);
  if (game.weapon2 === 'unarmed') {
    drawText(`x${1 + game.p2.unarmedHits}`, 887, 950, 50, 'yellow', true);
  } else {
    drawText(`x${game.p2.mult.toFixed(2)}`, 887, 950, 50, 'yellow', true);
  }

  drawAbilityCooldowns();

  if (!game.started && !game.winner) {
    drawText('PRESS ANY KEY TO START', 500, 500, 60, 'white', true);
  }

  if (game.winner) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, 1000, 1000);
    let wt;
    if (game.winner === 1) {
      wt = 'PLAYER 1 WINS!';
    } else {
      wt = game.gameMode === 'pvc' ? 'COMPUTER WINS!' : 'PLAYER 2 WINS!';
    }
    const wc = game.winner === 1 ? 'dodgerBlue' : 'crimson';
    drawText(wt, 500, 450, 80, wc, true);
    drawText('Press SPACE to play again', 500, 550, 40, 'white');
  }
}

export function draw() {
  if (game.state === 'start') drawStart();
  else if (game.state === 'rules') drawRules();
  else if (game.state === 'weaponSelect') drawWeaponSelect();
  else if (game.state === 'abilitySelect') drawAbilitySelect();
  else if (game.state === 'playing') drawGame();
}