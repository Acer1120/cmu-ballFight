export const SCALE = 2.5;

export const defaultRules = {
  startingHp: 100,
  baseDamage: 1,
  startingMult: 1.0,
  multPerHit: 0.15,
  dashDamage: 5,
  slowDuration: 25,
  baseSpeed: 5.5,
};

export function rulesConfig() {
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