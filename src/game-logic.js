import { game } from './state.js';
import { defaultRules, rulesConfig, SCALE } from './constants.js';
import { clamp } from './utils.js';

export function syncPlayersWithRules() {
  [game.p1, game.p2].forEach((p) => {
    p.hp = game.rules.startingHp;
    p.mult = game.rules.startingMult;
    p.speed = game.rules.baseSpeed * p.mult;
  });
}

export function adjustRule(id, delta) {
  const cfg = rulesConfig().find((c) => c.id === id);
  if (!cfg) return;
  const next = clamp(game.rules[id] + delta * cfg.step, cfg.min, cfg.max);
  game.rules[id] = Math.round(next * 100) / 100;
  syncPlayersWithRules();
}

export function startGame() {
  game.state = 'playing';

  // Assign random starting angles
  game.p1.angle = Math.random() * Math.PI * 2;
  game.p2.angle = Math.random() * Math.PI * 2;

  if (game.weapon1 === 'unarmed') {
    game.p1.speed *= 0.5;
  }
  if (game.weapon2 === 'unarmed') {
    game.p2.speed *= 0.5;
  }

  game.p1.rotSpeed = game.weaponStats[game.weapon1].speed * game.p1.mult;
  game.p2.rotSpeed = game.weaponStats[game.weapon2].speed * game.p2.mult;
}

export function resetGame() {
  game.state = 'start';
  game.gameMode = 'pvp';
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
    angle: Math.random() * Math.PI * 2,
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
    angle: Math.random() * Math.PI * 2,
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

export function useAbility(p, other, ability, primary) {
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
}

export function updateAI() {
  if (game.gameMode !== 'pvc' || game.winner || !game.started) return;

  const ai = game.p2;
  const player = game.p1;

  // Calculate distance and direction to player
  const dx = player.x - ai.x;
  const dy = player.y - ai.y;
  const distance = Math.sqrt(dx * dx + dy * dy);

  // AI decision making based on health and distance
  const healthRatio = ai.hp / game.rules.startingHp;
  const ability = game.ability2;

  if (!ability) return;

  // Use abilities strategically
  if (
    ability === 'shield' &&
    ai.shieldCd === 0 &&
    distance < 150 &&
    Math.random() < 0.05
  ) {
    useAbility(ai, player, 'shield', true);
  } else if (
    ability === 'boost' &&
    ai.boostCd === 0 &&
    (distance > 200 || healthRatio < 0.3) &&
    Math.random() < 0.02
  ) {
    useAbility(ai, player, 'boost', true);
  } else if (
    ability === 'dash' &&
    ai.dashCd === 0 &&
    distance < 250 &&
    distance > 80 &&
    Math.random() < 0.03
  ) {
    useAbility(ai, player, 'dash', true);
  } else if (ability === 'reverse') {
    if (
      healthRatio < 0.4 &&
      ai.fleeCd === 0 &&
      distance < 200 &&
      Math.random() < 0.05
    ) {
      // Flee (secondary)
      useAbility(ai, player, 'reverse', false);
    } else if (ai.chaseCd === 0 && distance > 150 && Math.random() < 0.05) {
      // Chase (primary)
      useAbility(ai, player, 'reverse', true);
    }
  } else if (ability === 'mark') {
    if (ai.m1x === null && ai.m1cd === 0 && Math.random() < 0.02) {
      // Place mark (primary)
      useAbility(ai, player, 'mark', true);
    } else if (ai.m1x !== null && distance > 250 && Math.random() < 0.05) {
      // Teleport to mark (primary)
      useAbility(ai, player, 'mark', true);
    }
  }
}

export function update() {
  if (game.state !== 'playing' || game.winner) return;

  const sf = game.slowTimer > 0 ? 0.15 : 1.0;
  game.slowTimer = Math.max(0, game.slowTimer - 1);
  
  // Update AI if in computer mode
  updateAI();

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

  // Check hit1 condition
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

  const d2ToP1 = Math.sqrt((t2.x - game.p1.x) ** 2 + (t2.y - game.p1.y) ** 2);
  const d2ToP2 = Math.sqrt((t2.x - game.p2.x) ** 2 + (t2.y - game.p2.y) ** 2);

  const isUnarmed2 = game.weapon2 === 'unarmed';
  const minTipDist2 = isUnarmed2 ? 0 : 75;

  // Check hit2 condition
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

  // Apply hit effects for player 1
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
        game.p1.mult += game.rules.multPerHit;
      } else {
        game.p1.mult += game.rules.multPerHit;
        game.p1.speed = game.rules.baseSpeed * game.p1.mult;
      }

      const baseRot = game.weaponStats[game.weapon1].speed;
      game.p1.rotSpeed =
        (game.p1.rotSpeed > 0 ? 1 : -1) * baseRot * game.p1.mult;

      // Reset chase/flee cooldowns on successful hit
      game.p1.chaseCd = 0;
      game.p1.fleeCd = 0;
    }
  }

  // Apply hit effects for player 2
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
        game.p2.mult += game.rules.multPerHit;
      } else {
        game.p2.mult += game.rules.multPerHit;
        game.p2.speed = game.rules.baseSpeed * game.p2.mult;
      }

      const baseRot = game.weaponStats[game.weapon2].speed;
      game.p2.rotSpeed =
        (game.p2.rotSpeed > 0 ? 1 : -1) * baseRot * game.p2.mult;

      // Reset chase/flee cooldowns on successful hit
      game.p2.chaseCd = 0;
      game.p2.fleeCd = 0;
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