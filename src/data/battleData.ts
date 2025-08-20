import KanaoSprite from '../assets/Kanao.png';
import NarutoSprite from '../assets/NarutoUzumaki.png';
import SasukeSprite from '../assets/SasukeUchiha.png';
import GokuSprite from '../assets/Goku.png';
import VegetaSprite from '../assets/Vegeta.png';
import LuffySprite from '../assets/Luffy.png';
import ZoroSprite from '../assets/RoronoaZoro.png';
import ErenSprite from '../assets/ErenYeager.png';
import MikasaSprite from '../assets/MikasaAckerman.png';
import GojoSprite from '../assets/SatoruGojo.png';
import YujiSprite from '../assets/YujiItadori.png';
import MidoriyaSprite from '../assets/IzukuMidoriya.png';
import BakugoSprite from '../assets/KatsukiBakugo.png';
import EdwardSprite from '../assets/EdwardElric.png';

export type MoveEffect =
  | 'defense_up'
  | 'attack_up'
  | 'defense_down'
  | 'accuracy_up'
  | 'invulnerable'
  | 'freeze'
  | 'paralyze'
  | 'enemy_defense_down'
  | 'enemy_attack_down'
  | 'heal'
  | 'accuracy_down'
  | 'self_defense_down'
  | 'defense_ignore'
  | 'highCritChance';

export type Move = {
  id: string;
  name: string;
  power: number;
  accuracy: number;
  // Legacy single-effect fields (kept for backward compatibility with simple moves)
  effect?: MoveEffect;
  // New multi-effect support for composite moves
  effects?: Array<{
    type: MoveEffect;
    value?: number;
    chance?: number;
    turns?: number;
  }>;

  //series?: string;
  value?: number;
  recoilDamage?: number;
  turns?: number;
  hpCost?: number;
  hits?: number;
  highCritChance?: boolean;
  chargeTurns?: number;
  chance?: number;
};

export type Character = {
  id: string;
  name: string;
  sprite: string;
  hp: number;
  attack: number;
  defense: number;
  moves: Move[];
};

// Characters with their 4 moves grouped together for maintainability
export const CHARACTERS: Record<string, Character> = {
  // Kanao
  p001: {
    id: 'p001',
    name: 'Kanao Tsuyuri',
    //series: 'Demon Slayer',
    sprite: KanaoSprite,
    hp: 85,
    attack: 110,
    defense: 70,
    moves: [
      { id: 'm001', name: 'Crimson Slash', power: 70, accuracy: 0.95 },
      {
        id: 'm002',
        name: 'Plum Spirit',
        power: 0,
        accuracy: 1.0,
        effect: 'defense_up',
        value: 1,
      },
      {
        id: 'm003',
        name: 'Vermilion Eye',
        power: 70,
        accuracy: 0.6,
        recoilDamage: 20,
      },
      {
        id: 'm004',
        name: 'Flower Breathing',
        power: 0,
        accuracy: 1.0,
        effect: 'attack_up',
        value: 2,
      },
    ],
  },
  p002: {
    id: 'p002',
    name: 'Naruto Uzumaki',
    //series: 'Naruto',
    sprite: NarutoSprite,
    hp: 110,
    attack: 95,
    defense: 80,
    moves: [
      { id: 'm005', name: 'Rasengan', power: 50, accuracy: 1.0 },
      {
        id: 'm006',
        name: 'Shadow Clones',
        power: 0,
        accuracy: 1.0,
        effect: 'defense_up',
        value: 2,
      },
      {
        id: 'm007',
        name: 'Nine-Tails Chakra',
        power: 0,
        accuracy: 1.0,
        effect: 'attack_up',
        value: 2,
        hpCost: 15,
      },
      { id: 'm008', name: 'Giant Rasengan', power: 60, accuracy: 0.9 },
    ],
  },
  p003: {
    id: 'p003',
    name: 'Sasuke Uchiha',
    //series: 'Naruto',
    sprite: SasukeSprite,
    hp: 90,
    attack: 105,
    defense: 75,
    moves: [
      {
        id: 'm009',
        name: 'Chidori',
        power: 95,
        accuracy: 1.0,
        effect: 'self_defense_down',
        value: 1,
      },
      { id: 'm010', name: 'Fireball Jutsu', power: 75, accuracy: 1.0 },
      {
        id: 'm011',
        name: 'Sharingan',
        power: 0,
        accuracy: 1.0,
        effect: 'accuracy_up',
        value: 1,
      },
      {
        id: 'm012',
        name: 'Kirin',
        power: 150,
        accuracy: 0.85,
        recoilDamage: 25,
      },
    ],
  },
  p004: {
    id: 'p004',
    name: 'Goku',
    //series: 'Dragon Ball Z',
    sprite: GokuSprite,
    hp: 100,
    attack: 100,
    defense: 90,
    moves: [
      { id: 'm013', name: 'Kamehameha', power: 90, accuracy: 1.0 },
      {
        id: 'm014',
        name: 'Kaioken',
        power: 0,
        accuracy: 1.0,
        effect: 'attack_up',
        value: 2,
        recoilDamage: 20,
      },
      {
        id: 'm015',
        name: 'Instant Transmission',
        power: 0,
        accuracy: 1.0,
        effect: 'defense_up',
        value: 1,
      },
      {
        id: 'm016',
        name: 'Spirit Bomb',
        power: 180,
        accuracy: 0.9,
        chargeTurns: 1,
      }, // Requires 1 turn to charge
    ],
  },
  p005: {
    id: 'p005',
    name: 'Vegeta',
    //series: 'Dragon Ball Z',
    sprite: VegetaSprite,
    hp: 95,
    attack: 105,
    defense: 85,
    moves: [
      { id: 'm017', name: 'Galick Gun', power: 85, accuracy: 1.0 },
      {
        id: 'm018',
        name: 'Saiyan Pride',
        power: 0,
        accuracy: 1.0,
        effect: 'attack_up',
        value: 2,
      },
      { id: 'm019', name: 'Big Bang Attack', power: 100, accuracy: 0.95 },
      {
        id: 'm020',
        name: 'Final Flash',
        power: 140,
        accuracy: 0.9,
        effect: 'self_defense_down',
        value: 2,
      },
    ],
  },
  p006: {
    id: 'p006',
    name: 'Monkey D. Luffy',
    //series: 'One Piece',
    sprite: LuffySprite,
    hp: 120,
    attack: 95,
    defense: 90,
    moves: [
      { id: 'm021', name: 'Gum-Gum Pistol', power: 70, accuracy: 1.0 },
      {
        id: 'm022',
        name: 'Gear Second',
        power: 0,
        accuracy: 1.0,
        effect: 'attack_up',
        value: 1,
        hpCost: 10,
      },
      {
        id: 'm023',
        name: 'Gum-Gum Gatling',
        power: 25,
        accuracy: 0.95,
        hits: 3,
      }, // Hits 3 times
      { id: 'm024', name: 'Elephant Gun', power: 130, accuracy: 0.9 },
    ],
  },
  p007: {
    id: 'p007',
    name: 'Roronoa Zoro',
    //series: 'One Piece',
    sprite: ZoroSprite,
    hp: 95,
    attack: 115,
    defense: 80,
    moves: [
      { id: 'm025', name: 'Oni Giri', power: 15, accuracy: 1.0 },
      { id: 'm026', name: 'Dragon Twister', power: 25, accuracy: 0.7 },
      {
        id: 'm027',
        name: 'Shishi Sonson',
        power: 70,
        accuracy: 1.0,
        highCritChance: true,
      },
      {
        id: 'm028',
        name: 'Asura',
        power: 0,
        accuracy: 1.0,
        effects: [
          { type: 'attack_up', value: 3 },
          { type: 'self_defense_down', value: 1 },
        ],
      },
    ],
  },
  p008: {
    id: 'p008',
    name: 'Eren Yeager',
    //series: 'Attack on Titan',
    sprite: ErenSprite,
    hp: 130,
    attack: 100,
    defense: 65,
    moves: [
      { id: 'm029', name: 'Titan Punch', power: 90, accuracy: 0.95 },
      {
        id: 'm030',
        name: 'Harden',
        power: 0,
        accuracy: 1.0,
        effect: 'defense_up',
        value: 2,
      },
      {
        id: 'm031',
        name: 'Berserk Rage',
        power: 0,
        accuracy: 1.0,
        effects: [
          { type: 'attack_up', value: 2 },
          { type: 'self_defense_down', value: 2 },
        ],
      },
      {
        id: 'm032',
        name: 'Colossal Strike',
        power: 150,
        accuracy: 0.8,
        recoilDamage: 40,
      },
    ],
  },
  p009: {
    id: 'p009',
    name: 'Mikasa Ackerman',
    //series: 'Attack on Titan',
    sprite: MikasaSprite,
    hp: 80,
    attack: 110,
    defense: 75,
    moves: [
      { id: 'm033', name: 'Blade Dance', power: 40, accuracy: 0.9, hits: 2 }, // Hits 2 times
      {
        id: 'm034',
        name: 'Gas Burst',
        power: 0,
        accuracy: 1.0,
        effect: 'defense_up',
        value: 1,
      },
      {
        id: 'm035',
        name: 'Thunder Spear',
        power: 110,
        accuracy: 0.9,
        effect: 'defense_ignore',
        value: 0.25,
      }, // Ignores 25% of defense
      {
        id: 'm036',
        name: 'Steel Resolve',
        power: 0,
        accuracy: 1.0,
        effect: 'attack_up',
        value: 2,
      },
    ],
  },
  p010: {
    id: 'p010',
    name: 'Satoru Gojo',
    //series: 'Jujutsu Kaisen',
    sprite: GojoSprite,
    hp: 90,
    attack: 120,
    defense: 80,
    moves: [
      { id: 'm037', name: 'Cursed Technique: Red', power: 20, accuracy: 1.0 },
      {
        id: 'm038',
        name: 'Limitless',
        power: 0,
        accuracy: 1.0,
        effect: 'invulnerable',
        turns: 1,
      }, // Cannot be hit for 1 turn
      {
        id: 'm039',
        name: 'Six Eyes',
        power: 0,
        accuracy: 1.0,
        effect: 'accuracy_up',
        value: 2,
      },
      {
        id: 'm040',
        name: 'Hollow Purple',
        power: 70,
        accuracy: 0.6,
        hpCost: 30,
      },
    ],
  },
  p011: {
    id: 'p011',
    name: 'Yuji Itadori',
    //series: 'Jujutsu Kaisen',
    sprite: YujiSprite,
    hp: 105,
    attack: 100,
    defense: 85,
    moves: [
      { id: 'm041', name: 'Divergent Fist', power: 75, accuracy: 1.0 },
      {
        id: 'm042',
        name: 'Cursed Energy Flow',
        power: 0,
        accuracy: 1.0,
        effect: 'attack_up',
        value: 1,
      },
      { id: 'm043', name: 'Slaughter Demon', power: 85, accuracy: 0.95 },
      {
        id: 'm044',
        name: 'Black Flash',
        power: 120,
        accuracy: 0.75,
        highCritChance: true,
      },
    ],
  },
  p012: {
    id: 'p012',
    name: 'Izuku Midoriya',
    //series: 'My Hero Academia',
    sprite: MidoriyaSprite,
    hp: 90,
    attack: 100,
    defense: 80,
    moves: [
      { id: 'm045', name: 'Delaware Smash', power: 70, accuracy: 1.0 },
      {
        id: 'm046',
        name: 'Full Cowl',
        power: 0,
        accuracy: 1.0,
        effects: [
          { type: 'attack_up', value: 1 },
          { type: 'defense_up', value: 1 },
        ],
      },
      {
        id: 'm047',
        name: 'Detroit Smash',
        power: 110,
        accuracy: 0.95,
        recoilDamage: 20,
      },
      {
        id: 'm048',
        name: 'One For All 100%',
        power: 160,
        accuracy: 0.9,
        recoilDamage: 50,
      },
    ],
  },
  p013: {
    id: 'p013',
    name: 'Katsuki Bakugo',
    //series: 'My Hero Academia',
    sprite: BakugoSprite,
    hp: 85,
    attack: 115,
    defense: 70,
    moves: [
      { id: 'm049', name: 'Explosion Burst', power: 75, accuracy: 1.0 },
      {
        id: 'm050',
        name: 'Stun Grenade',
        power: 40,
        accuracy: 0.9,
        effect: 'accuracy_down',
        value: 1,
      },
      {
        id: 'm051',
        name: 'AP Shot',
        power: 90,
        accuracy: 0.95,
        effect: 'defense_ignore',
        value: 0.2,
      }, // Ignores 20% of defense
      {
        id: 'm052',
        name: 'Howitzer Impact',
        power: 140,
        accuracy: 0.9,
        recoilDamage: 30,
      },
    ],
  },
  p014: {
    id: 'p014',
    name: 'Edward Elric',
    //series: 'Fullmetal Alchemist',
    sprite: EdwardSprite,
    hp: 90,
    attack: 95,
    defense: 95,
    moves: [
      { id: 'm053', name: 'Alchemy Spear', power: 70, accuracy: 1.0 },
      {
        id: 'm054',
        name: 'Fortify',
        power: 0,
        accuracy: 1.0,
        effect: 'defense_up',
        value: 2,
      },
      {
        id: 'm055',
        name: 'Automail Blade',
        power: 85,
        accuracy: 0.95,
        highCritChance: true,
      },
      {
        id: 'm056',
        name: 'Deconstruction',
        power: 60,
        accuracy: 1.0,
        effect: 'enemy_defense_down',
        value: 1,
      },
    ],
  },
};
