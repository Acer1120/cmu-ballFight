const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const SCALE = 2.5;

const defaultRules = {
  startingHp: 100,
  baseDamage: 1,
  startingMult: 1.0,
  multPerHit: 0.15,
  dashDamage: 5,
  slowDuration: 25,
  baseSpeed: 5.5,
};

const game = {
  state: 'start',
  weapon1: 'sword',
  weapon2: 'sword',
  ability1: null,
  ability2: null,
  rules: { ...defaultRules },
  weaponStats: {
    sword: { length: 50 * SCALE, width: 12 * SCALE, speed: 10 },
    spear: { length: 95 * SCALE, width: 10 * SCALE, speed: 8 },
    unarmed: { length: 0, width: 0, speed: 15 },
  },
  p1: {
    x: 100 * SCALE,
    y: 200 * SCALE,
    r: 25 * SCALE,
    vx: 0,
    vy: 0,
    speed: 5.5,
    angle: 0,
    rotSpeed: 0,
    hp: 100,
    mult: 1.0,
    white: 0,
    impactCd: 0,
    shieldAct: 0,
    shieldCd: 0,
    boostAct: 0,
    boostCd: 0,
    chaseCd: 0,
    fleeCd: 0,
    dashAct: 0,
    dashCd: 0,
    dashDmg: false,
    m1x: null,
    m1y: null,
    m1cd: 0,
    m2x: null,
    m2y: null,
    m2cd: 0,
    unarmedHits: 0,
  },
  p2: {
    x: 300 * SCALE,
    y: 200 * SCALE,
    r: 25 * SCALE,
    vx: 0,
    vy: 0,
    speed: 5.5,
    angle: 0,
    rotSpeed: 0,
    hp: 100,
    mult: 1.0,
    white: 0,
    impactCd: 0,
    shieldAct: 0,
    shieldCd: 0,
    boostAct: 0,
    boostCd: 0,
    chaseCd: 0,
    fleeCd: 0,
    dashAct: 0,
    dashCd: 0,
    dashDmg: false,
    m1x: null,
    m1y: null,
    m1cd: 0,
    m2x: null,
    m2y: null,
    m2cd: 0,
    unarmedHits: 0,
  },
  s1x: 0,
  s1y: 0,
  s2x: 0,
  s2y: 0,
  slowTimer: 0,
  swordCd: 0,
  started: false,
  winner: null,
  editingRule: null,
  inputValue: '',
};

function rulesConfig() {
  return [
    {
      id: 'startingHp',
      label: 'Starting HP',
      min: 20,
      max: 400,
      step: 10,
      desc: 'HP per player',
    },
    {
      id: 'baseDamage',
      label: 'Base Damage',
      min: 0.5,
      max: 5,
      step: 0.5,
      desc: 'Sword damage per tap',
    },
    {
      id: 'startingMult',
      label: 'Start Multiplier',
      min: 0.5,
      max: 3.0,
      step: 0.1,
      desc: 'Starting multiplier',
    },
    {
      id: 'multPerHit',
      label: 'Multiplier Gain',
      min: 0,
      max: 0.6,
      step: 0.05,
      desc: 'Multiplier gained per hit',
    },
    {
      id: 'slowDuration',
      label: 'Hit Slow Frames',
      min: 0,
      max: 60,
      step: 5,
      desc: 'Freeze frames on sword hit',
    },
    {
      id: 'baseSpeed',
      label: 'Base Move Speed',
      min: 3,
      max: 9,
      step: 0.2,
      desc: 'Starting move speed',
    },
  ];
}

function clamp(val, min, max) {
  return Math.min(max, Math.max(min, val));
}

function adjustRule(id, delta) {
  const cfg = rulesConfig().find((c) => c.id === id);
  if (!cfg) return;
  const next = clamp(game.rules[id] + delta * cfg.step, cfg.min, cfg.max);
  game.rules[id] = Math.round(next * 100) / 100;
  syncPlayersWithRules();
}

function syncPlayersWithRules() {
  [game.p1, game.p2].forEach((p) => {
    p.hp = game.rules.startingHp;
    p.mult = game.rules.startingMult;
    p.speed = game.rules.baseSpeed * p.mult;
  });
}

syncPlayersWithRules();

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
  drawText('SWORD BATTLE', 500, 375, 100, 'white', true);
  drawText('Press SPACE to set rules', 500, 550, 50, 'white');
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
  drawText('PLAYER 2 (Red)', 750, 300, 45, 'crimson', true);

  // Player 1
  drawRect(125, 350, 250, 100, 'lightBlue', 'white', game.weapon1 === 'sword' ? 10 : 5);
  drawText('SWORD', 250, 400, 35, 'black', true);

  drawRect(125, 475, 250, 100, 'lightBlue', 'white', game.weapon1 === 'spear' ? 10 : 5);
  drawText('SPEAR', 250, 525, 35, 'black', true);

  drawRect(125, 600, 250, 100, 'lightBlue', 'white', game.weapon1 === 'unarmed' ? 10 : 5);
  drawText('UNARMED', 250, 650, 35, 'black', true);

  // Player 2
  drawRect(625, 350, 250, 100, 'orange', 'white', game.weapon2 === 'sword' ? 10 : 5);
  drawText('SWORD', 750, 400, 35, 'black', true);

  drawRect(625, 475, 250, 100, 'orange', 'white', game.weapon2 === 'spear' ? 10 : 5);
  drawText('SPEAR', 750, 525, 35, 'black', true);

  drawRect(625, 600, 250, 100, 'orange', 'white', game.weapon2 === 'unarmed' ? 10 : 5);
  drawText('UNARMED', 750, 650, 35, 'black', true);

  drawRect(375, 800, 250, 100, 'green', 'white', 5);
  drawText('NEXT', 500, 850, 45, 'white', true);
}

function drawAbilitySelect() {
  ctx.fillStyle = 'rgb(80, 80, 80)';
  ctx.fillRect(0, 0, 1000, 1000);
  drawText('SELECT ABILITIES', 500, 50, 75, 'white', true);
  drawText('PLAYER 1', 250, 137, 45, 'dodgerBlue', true);
  drawText('PLAYER 2', 750, 137, 45, 'crimson', true);

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
  drawText(
    `${game.weapon1.toUpperCase()} (${p1HpTop} HP)`,
    175,
    50,
    40,
    'dodgerBlue',
    true
  );
  drawText(
    `${game.weapon2.toUpperCase()} (${p2HpTop} HP)`,
    825,
    50,
    40,
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
    const wt = game.winner === 1 ? 'PLAYER 1 WINS!' : 'PLAYER 2 WINS!';
    const wc = game.winner === 1 ? 'dodgerBlue' : 'crimson';
    drawText(wt, 500, 450, 80, wc, true);
    drawText('Press SPACE to play again', 500, 550, 40, 'white');
  }
}

function update() {
  if (game.state !== 'playing' || game.winner) return;

  const sf = game.slowTimer > 0 ? 0.15 : 1.0;
  game.slowTimer = Math.max(0, game.slowTimer - 1);

  [game.p1, game.p2].forEach((p) => {
    [
      'white',
      'impactCd',
      'shieldAct',
      'shieldCd',
      'boostAct',
      'boostCd',
      'chaseCd',
      'fleeCd',
      'dashAct',
      'dashCd',
      'm1cd',
      'm2cd',
    ].forEach((k) => {
      p[k] = Math.max(0, p[k] - sf);
    });
  });

  game.swordCd = Math.max(0, game.swordCd - sf);

  [game.p1, game.p2].forEach((p, i) => {
    let spd = p.speed * 1.3;
    if (p.boostAct > 0) spd *= 2;
    if (p.dashAct > 0) spd *= 3;

    const mag = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
    if (mag > 0) {
      p.vx = (p.vx / mag) * spd;
      p.vy = (p.vy / mag) * spd;
    }

    p.x += p.vx * sf;
    p.y += p.vy * sf;

    const maxPos = 1000;
    if (p.y + p.r >= maxPos) {
      p.y = maxPos - p.r;
      p.vy = -Math.abs(p.vy);
    }
    if (p.y - p.r <= 0) {
      p.y = p.r;
      p.vy = Math.abs(p.vy);
    }
    if (p.x + p.r >= maxPos) {
      p.x = maxPos - p.r;
      p.vx = -Math.abs(p.vx);
    }
    if (p.x - p.r <= 0) {
      p.x = p.r;
      p.vx = Math.abs(p.vx);
    }

    const w = i === 0 ? game.weapon1 : game.weapon2;
    const ws = game.weaponStats[w].speed;
    const br = p.rotSpeed > 0 ? ws : -ws;
    p.angle += (p.boostAct > 0 ? br * 2 : br) * sf;
  });

  [
    [game.p1, game.weapon1, 's1'],
    [game.p2, game.weapon2, 's2'],
  ].forEach(([p, w, s]) => {
    const wl = game.weaponStats[w].length;
    const sx = p.x + p.r * Math.cos((p.angle * Math.PI) / 180);
    const sy = p.y + p.r * Math.sin((p.angle * Math.PI) / 180);
    const cx = sx + (wl / 2) * Math.cos((p.angle * Math.PI) / 180);
    const cy = sy + (wl / 2) * Math.sin((p.angle * Math.PI) / 180);
    if (s === 's1') {
      game.s1x = cx;
      game.s1y = cy;
    } else {
      game.s2x = cx;
      game.s2y = cy;
    }
  });

  const dx = game.p2.x - game.p1.x;
  const dy = game.p2.y - game.p1.y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const md = game.p1.r + game.p2.r;

  if (dist < md && dist > 0) {
    if (game.p1.dashAct > 0 && game.p1.dashDmg) {
      game.p2.hp -= Math.floor(game.rules.dashDamage * game.p1.mult);
      game.p2.white = 10;
      game.p1.dashDmg = false;
    }
    if (game.p2.dashAct > 0 && game.p2.dashDmg) {
      game.p1.hp -= Math.floor(game.rules.dashDamage * game.p2.mult);
      game.p1.white = 10;
      game.p2.dashDmg = false;
    }

    const ov = md - dist + 2;
    const nx = dx / dist,
      ny = dy / dist;
    game.p1.x -= ov * nx * 0.5;
    game.p1.y -= ov * ny * 0.5;
    game.p2.x += ov * nx * 0.5;
    game.p2.y += ov * ny * 0.5;

    const d1 = game.p1.vx * nx + game.p1.vy * ny;
    if (d1 > 0) {
      game.p1.vx -= 2 * d1 * nx;
      game.p1.vy -= 2 * d1 * ny;
    }

    const d2 = game.p2.vx * -nx + game.p2.vy * -ny;
    if (d2 > 0) {
      game.p2.vx += 2 * d2 * nx;
      game.p2.vy += 2 * d2 * ny;
    }
  }

  const getSwordTip = (p, w) => {
    const wl = game.weaponStats[w].length;
    const sx = p.x + p.r * Math.cos((p.angle * Math.PI) / 180);
    const sy = p.y + p.r * Math.sin((p.angle * Math.PI) / 180);
    return {
      x: sx + wl * Math.cos((p.angle * Math.PI) / 180),
      y: sy + wl * Math.sin((p.angle * Math.PI) / 180),
    };
  };

  const t1 = getSwordTip(game.p1, game.weapon1);
  const t2 = getSwordTip(game.p2, game.weapon2);

  const d1ToP2 = Math.sqrt((t1.x - game.p2.x) ** 2 + (t1.y - game.p2.y) ** 2);
  const d1ToP1 = Math.sqrt((t1.x - game.p1.x) ** 2 + (t1.y - game.p1.y) ** 2);
  const distBetween = Math.sqrt(
    (game.p1.x - game.p2.x) ** 2 + (game.p1.y - game.p2.y) ** 2
  );

  const isUnarmed1 = game.weapon1 === 'unarmed';
  const minTipDist1 = isUnarmed1 ? 0 : 75;

  let hit1 = false;
  if (isUnarmed1) {
    // For unarmed, we just check if players are touching/colliding
    // dist is distance between centers. md is sum of radii.
    // We want a hit if they collide.
    if (dist < md + 10 && game.p1.impactCd === 0 && game.slowTimer === 0) {
      hit1 = true;
    }
  } else {
    if (
      d1ToP2 < game.p2.r + 25 &&
      d1ToP1 > minTipDist1 &&
      d1ToP2 < distBetween &&
      game.p1.impactCd === 0 &&
      game.slowTimer === 0
    ) {
      hit1 = true;
    }
  }

  if (hit1) {
    game.slowTimer = game.rules.slowDuration;
    game.p1.impactCd = 30;

    let dmg = Math.floor(game.rules.baseDamage * game.p1.mult);
    if (isUnarmed1) dmg = 1 + game.p1.unarmedHits;

    if (game.p2.shieldAct > 0) {
      game.p1.hp -= dmg;
      game.p1.white = 10;
      game.p2.shieldCd = Math.floor(game.p2.shieldCd / 2);
      game.p2.shieldAct = 0;
    } else {
      game.p2.hp -= dmg;
      game.p2.white = 10;

      if (isUnarmed1) {
        game.p1.unarmedHits++;
        game.p1.speed += 1;
      } else {
        game.p1.mult += game.rules.multPerHit;
        game.p1.speed = game.rules.baseSpeed * game.p1.mult;
      }

      const baseRot = game.weaponStats[game.weapon1].speed;
      game.p1.rotSpeed = (game.p1.rotSpeed > 0 ? 1 : -1) * baseRot * game.p1.mult;
    }
  }

  const d2ToP1 = Math.sqrt((t2.x - game.p1.x) ** 2 + (t2.y - game.p1.y) ** 2);
  const d2ToP2 = Math.sqrt((t2.x - game.p2.x) ** 2 + (t2.y - game.p2.y) ** 2);

  const isUnarmed2 = game.weapon2 === 'unarmed';
  const minTipDist2 = isUnarmed2 ? 0 : 75;

  let hit2 = false;
  if (isUnarmed2) {
    if (dist < md + 10 && game.p2.impactCd === 0 && game.slowTimer === 0) {
      hit2 = true;
    }
  } else {
    if (
      d2ToP1 < game.p1.r + 25 &&
      d2ToP2 > minTipDist2 &&
      d2ToP1 < distBetween &&
      game.p2.impactCd === 0 &&
      game.slowTimer === 0
    ) {
      hit2 = true;
    }
  }

  if (hit2) {
    game.slowTimer = game.rules.slowDuration;
    game.p2.impactCd = 30;

    let dmg = Math.floor(game.rules.baseDamage * game.p2.mult);
    if (isUnarmed2) dmg = 1 + game.p2.unarmedHits;

    if (game.p1.shieldAct > 0) {
      game.p2.hp -= dmg;
      game.p2.white = 10;
      game.p1.shieldCd = Math.floor(game.p1.shieldCd / 2);
      game.p1.shieldAct = 0;
    } else {
      game.p1.hp -= dmg;
      game.p1.white = 10;

      if (isUnarmed2) {
        game.p2.unarmedHits++;
        game.p2.speed += 1;
      } else {
        game.p2.mult += game.rules.multPerHit;
        game.p2.speed = game.rules.baseSpeed * game.p2.mult;
      }

      const baseRot = game.weaponStats[game.weapon2].speed;
      game.p2.rotSpeed = (game.p2.rotSpeed > 0 ? 1 : -1) * baseRot * game.p2.mult;
    }
  }

  const swordDist = Math.sqrt(
    (game.s1x - game.s2x) ** 2 + (game.s1y - game.s2y) ** 2
  );
  if (swordDist < 87 && game.swordCd === 0) {
    game.p1.rotSpeed = -game.p1.rotSpeed;
    game.p2.rotSpeed = -game.p2.rotSpeed;
    game.swordCd = 20;
  }

  if (game.p1.hp <= 0) {
    game.p1.hp = 0;
    game.winner = 2;
  } else if (game.p2.hp <= 0) {
    game.p2.hp = 0;
    game.winner = 1;
  }
}

function draw() {
  if (game.state === 'start') drawStart();
  else if (game.state === 'rules') drawRules();
  else if (game.state === 'weaponSelect') drawWeaponSelect();
  else if (game.state === 'abilitySelect') drawAbilitySelect();
  else if (game.state === 'playing') drawGame();
}

canvas.addEventListener('click', (e) => {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  if (game.state === 'rules') {
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

function startGame() {
  game.state = 'playing';
  
  if (game.weapon1 === 'unarmed') {
    game.p1.speed *= 0.5;
  }
  if (game.weapon2 === 'unarmed') {
    game.p2.speed *= 0.5;
  }

  game.p1.rotSpeed = game.weaponStats[game.weapon1].speed * game.p1.mult;
  game.p2.rotSpeed = game.weaponStats[game.weapon2].speed * game.p2.mult;
}

function resetGame() {
  game.state = 'start';
  game.weapon1 = 'sword';
  game.weapon2 = 'sword';
  game.ability1 = null;
  game.ability2 = null;

  game.p1 = {
    x: 100 * SCALE,
    y: 200 * SCALE,
    r: 25 * SCALE,
    vx: 0,
    vy: 0,
    speed: game.rules.baseSpeed * game.rules.startingMult,
    angle: 0,
    rotSpeed: 0,
    hp: game.rules.startingHp,
    mult: game.rules.startingMult,
    white: 0,
    impactCd: 0,
    shieldAct: 0,
    shieldCd: 0,
    boostAct: 0,
    boostCd: 0,
    chaseCd: 0,
    fleeCd: 0,
    dashAct: 0,
    dashCd: 0,
    dashDmg: false,
    m1x: null,
    m1y: null,
    m1cd: 0,
    m2x: null,
    m2y: null,
    m2cd: 0,
    unarmedHits: 0,
  };

  game.p2 = {
    x: 300 * SCALE,
    y: 200 * SCALE,
    r: 25 * SCALE,
    vx: 0,
    vy: 0,
    speed: game.rules.baseSpeed * game.rules.startingMult,
    angle: 0,
    rotSpeed: 0,
    hp: game.rules.startingHp,
    mult: game.rules.startingMult,
    white: 0,
    impactCd: 0,
    shieldAct: 0,
    shieldCd: 0,
    boostAct: 0,
    boostCd: 0,
    chaseCd: 0,
    fleeCd: 0,
    dashAct: 0,
    dashCd: 0,
    dashDmg: false,
    m1x: null,
    m1y: null,
    m1cd: 0,
    m2x: null,
    m2y: null,
    m2cd: 0,
    unarmedHits: 0,
  };

  game.s1x = 0;
  game.s1y = 0;
  game.s2x = 0;
  game.s2y = 0;
  game.slowTimer = 0;
  game.swordCd = 0;
  game.started = false;
  game.winner = null;
  game.editingRule = null;
  game.inputValue = '';
}

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

    const useAbility = (p, other, ability, primary) => {
      if (primary) {
        if (ability === 'shield' && p.shieldCd === 0) {
          p.shieldAct = 18;
          p.shieldCd = Math.floor(240 / p.mult);
        } else if (ability === 'boost' && p.boostCd === 0) {
          p.boostAct = 75;
          p.boostCd = Math.floor(210 / p.mult);
        } else if (ability === 'dash' && p.dashCd === 0) {
          p.dashAct = 15;
          p.dashCd = Math.floor(180 / p.mult);
          p.dashDmg = true;
        } else if (ability === 'reverse' && p.chaseCd === 0) {
          const dx = other.x - p.x;
          const dy = other.y - p.y;
          const m = Math.sqrt(dx * dx + dy * dy);
          if (m > 0) {
            p.vx = (dx / m) * p.speed * 1.3;
            p.vy = (dy / m) * p.speed * 1.3;
          }
          p.chaseCd = Math.floor(75 / p.mult);
        } else if (ability === 'mark') {
          if (p.m1x === null && p.m1cd === 0) {
            p.m1x = p.x;
            p.m1y = p.y;
          } else if (p.m1x !== null) {
            const dx = p.m1x - p.x;
            const dy = p.m1y - p.y;
            const m = Math.sqrt(dx * dx + dy * dy);
            if (m > 0) {
              p.vx = (dx / m) * p.speed * 1.3;
              p.vy = (dy / m) * p.speed * 1.3;
            }
            p.m1x = null;
            p.m1y = null;
            p.m1cd = Math.floor(150 / p.mult);
          }
        }
      } else {
        if (ability === 'reverse' && p.fleeCd === 0) {
          const dx = p.x - other.x;
          const dy = p.y - other.y;
          const m = Math.sqrt(dx * dx + dy * dy);
          if (m > 0) {
            p.vx = (dx / m) * p.speed * 1.3;
            p.vy = (dy / m) * p.speed * 1.3;
          }
          p.fleeCd = Math.floor(75 / p.mult);
        } else if (ability === 'mark') {
          if (p.m2x === null && p.m2cd === 0) {
            p.m2x = p.x;
            p.m2y = p.y;
          } else if (p.m2x !== null) {
            const dx = p.m2x - p.x;
            const dy = p.m2y - p.y;
            const m = Math.sqrt(dx * dx + dy * dy);
            if (m > 0) {
              p.vx = (dx / m) * p.speed * 1.3;
              p.vy = (dy / m) * p.speed * 1.3;
            }
            p.m2x = null;
            p.m2y = null;
            p.m2cd = Math.floor(150 / p.mult);
          }
        }
      }
    };

    if (e.key === 'q') useAbility(game.p1, game.p2, game.ability1, true);
    else if (e.key === 'w') useAbility(game.p1, game.p2, game.ability1, false);
    else if (e.key === 'o') useAbility(game.p2, game.p1, game.ability2, true);
    else if (e.key === 'p') useAbility(game.p2, game.p1, game.ability2, false);
  } else if (game.state === 'playing' && game.winner && e.code === 'Space') {
    resetGame();
  }
});

function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

gameLoop();
