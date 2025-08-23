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
import RoySprite from '../assets/RoyMustang.png';
import SebastianSprite from '../assets/SebastianMichaelis.png';
import CielSprite from '../assets/CielPhantomhive.png';

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
  emoji?: string;
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
      {
        id: 'm001',
        name: 'Crimson Slash',
        power: 70,
        accuracy: 0.95,
        emoji: '⚔️',
      },
      {
        id: 'm002',
        name: 'Plum Spirit',
        emoji: '🍒',
        power: 0,
        accuracy: 1.0,
        effect: 'defense_up',
        value: 1,
      },
      {
        id: 'm003',
        name: 'Vermilion Eye',
        emoji: '👁️',
        power: 70,
        accuracy: 0.6,
        recoilDamage: 20,
      },
      {
        id: 'm004',
        name: 'Flower Breathing',
        emoji: '🌸',
        power: 0,
        accuracy: 1.0,
        effect: 'attack_up',
        value: 2,
      },
    ],
  },
  e001: {
    id: 'e001',
    name: 'Naruto Uzumaki',
    //series: 'Naruto',
    sprite: NarutoSprite,
    hp: 110,
    attack: 95,
    defense: 80,
    moves: [
      { id: 'm005', name: 'Rasengan', power: 50, accuracy: 1.0, emoji: '🌀' },
      {
        id: 'm006',
        name: 'Shadow Clones',
        power: 0,
        accuracy: 1.0,
        effect: 'defense_up',
        value: 2,
        emoji: '👥',
      },
      {
        id: 'm007',
        name: 'Nine-Tails Chakra',
        power: 0,
        accuracy: 1.0,
        effect: 'attack_up',
        value: 2,
        hpCost: 15,
        emoji: '🦊',
      },
      { id: 'm008', name: 'Giant Rasengan', power: 60, accuracy: 0.9, emoji: '🌀' },
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
        emoji: '⚡️',
      },
      { id: 'm010', name: 'Fireball Jutsu', power: 75, accuracy: 1.0, emoji: '🔥' },
      {
        id: 'm011',
        name: 'Sharingan',
        power: 0,
        accuracy: 1.0,
        effect: 'accuracy_up',
        value: 1,
        emoji: '👁️',
      },
      {
        id: 'm012',
        name: 'Kirin',
        power: 150,
        accuracy: 0.85,
        recoilDamage: 25,
        emoji: '🐉',
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
      { id: 'm013', name: 'Kamehameha', power: 90, accuracy: 1.0, emoji: '🐢' },
      {
        id: 'm014',
        name: 'Kaioken',
        power: 0,
        accuracy: 1.0,
        effect: 'attack_up',
        value: 2,
        recoilDamage: 20,
        emoji: '🔥',
      },
      {
        id: 'm015',
        name: 'Instant Transmission',
        power: 0,
        accuracy: 1.0,
        effect: 'defense_up',
        value: 1,
        emoji: '✨',
      },
      {
        id: 'm016',
        name: 'Spirit Bomb',
        power: 180,
        accuracy: 0.9,
        chargeTurns: 1,
        emoji: '☄️',
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
      { id: 'm017', name: 'Galick Gun', power: 85, accuracy: 1.0, emoji: '🔫' },
      {
        id: 'm018',
        name: 'Saiyan Pride',
        power: 0,
        accuracy: 1.0,
        effect: 'attack_up',
        value: 2,
        emoji: '💪',
      },
      { id: 'm019', name: 'Big Bang Attack', power: 100, accuracy: 0.95, emoji: '💥' },
      {
        id: 'm020',
        name: 'Final Flash',
        power: 140,
        accuracy: 0.9,
        effect: 'self_defense_down',
        value: 2,
        emoji: '⚡️',
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
      { id: 'm021', name: 'Gum-Gum Pistol', power: 70, accuracy: 1.0, emoji: '👊' },
      {
        id: 'm022',
        name: 'Gear Second',
        power: 0,
        accuracy: 1.0,
        effect: 'attack_up',
        value: 1,
        hpCost: 10,
        emoji: '⚙️',
      },
      {
        id: 'm023',
        name: 'Gum-Gum Gatling',
        power: 25,
        accuracy: 0.95,
        hits: 3,
        emoji: '👊',
      }, // Hits 3 times
      { id: 'm024', name: 'Elephant Gun', power: 130, accuracy: 0.9, emoji: '🐘' },
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
      { id: 'm025', name: 'Oni Giri', power: 15, accuracy: 1.0, emoji: '👹' },
      { id: 'm026', name: 'Dragon Twister', power: 25, accuracy: 0.7, emoji: '🐉' },
      {
        id: 'm027',
        name: 'Shishi Sonson',
        power: 70,
        accuracy: 1.0,
        highCritChance: true,
        emoji: '🦁',
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
        emoji: '😈',
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
      { id: 'm029', name: 'Titan Punch', power: 90, accuracy: 0.95, emoji: '👊' },
      {
        id: 'm030',
        name: 'Harden',
        power: 0,
        accuracy: 1.0,
        effect: 'defense_up',
        value: 2,
        emoji: '🛡️',
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
        emoji: '😡',
      },
      {
        id: 'm032',
        name: 'Colossal Strike',
        power: 150,
        accuracy: 0.8,
        recoilDamage: 40,
        emoji: '💥',
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
      { id: 'm033', name: 'Blade Dance', power: 40, accuracy: 0.9, hits: 2, emoji: '⚔️' }, // Hits 2 times
      {
        id: 'm034',
        name: 'Gas Burst',
        power: 0,
        accuracy: 1.0,
        effect: 'defense_up',
        value: 1,
        emoji: '💨',
      },
      {
        id: 'm035',
        name: 'Thunder Spear',
        power: 110,
        accuracy: 0.9,
        effect: 'defense_ignore',
        value: 0.25,
        emoji: '⚡️',
      }, // Ignores 25% of defense
      {
        id: 'm036',
        name: 'Steel Resolve',
        power: 0,
        accuracy: 1.0,
        effect: 'attack_up',
        value: 2,
        emoji: '💪',
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
      { id: 'm037', name: 'Cursed Technique: Red', power: 20, accuracy: 1.0, emoji: '🔴' },
      {
        id: 'm038',
        name: 'Limitless',
        power: 0,
        accuracy: 1.0,
        effect: 'invulnerable',
        turns: 1,
        emoji: '♾️',
      }, // Cannot be hit for 1 turn
      {
        id: 'm039',
        name: 'Six Eyes',
        power: 0,
        accuracy: 1.0,
        effect: 'accuracy_up',
        value: 2,
        emoji: '👀',
      },
      {
        id: 'm040',
        name: 'Hollow Purple',
        power: 70,
        accuracy: 0.6,
        hpCost: 30,
        emoji: '🟣',
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
      { id: 'm041', name: 'Divergent Fist', power: 75, accuracy: 1.0, emoji: '👊' },
      {
        id: 'm042',
        name: 'Cursed Energy Flow',
        power: 0,
        accuracy: 1.0,
        effect: 'attack_up',
        value: 1,
        emoji: '✨',
      },
      { id: 'm043', name: 'Slaughter Demon', power: 85, accuracy: 0.95, emoji: '😈' },
      {
        id: 'm044',
        name: 'Black Flash',
        power: 120,
        accuracy: 0.75,
        highCritChance: true,
        emoji: '⚫',
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
      { id: 'm045', name: 'Delaware Smash', power: 70, accuracy: 1.0, emoji: '💥' },
      {
        id: 'm046',
        name: 'Full Cowl',
        power: 0,
        accuracy: 1.0,
        effects: [
          { type: 'attack_up', value: 1 },
          { type: 'defense_up', value: 1 },
        ],
        emoji: '⚡️',
      },
      {
        id: 'm047',
        name: 'Detroit Smash',
        power: 110,
        accuracy: 0.95,
        recoilDamage: 20,
        emoji: '💥',
      },
      {
        id: 'm048',
        name: 'One For All 100%',
        power: 160,
        accuracy: 0.9,
        recoilDamage: 50,
        emoji: '💪',
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
      { id: 'm049', name: 'Explosion Burst', power: 75, accuracy: 1.0, emoji: '💥' },
      {
        id: 'm050',
        name: 'Stun Grenade',
        power: 40,
        accuracy: 0.9,
        effect: 'accuracy_down',
        value: 1,
        emoji: '💣',
      },
      {
        id: 'm051',
        name: 'AP Shot',
        power: 90,
        accuracy: 0.95,
        effect: 'defense_ignore',
        value: 0.2,
        emoji: '🔫',
      }, // Ignores 20% of defense
      {
        id: 'm052',
        name: 'Howitzer Impact',
        power: 140,
        accuracy: 0.9,
        recoilDamage: 30,
        emoji: '💥',
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
      { id: 'm053', name: 'Alchemy Spear', power: 70, accuracy: 1.0, emoji: '🔱' },
      {
        id: 'm054',
        name: 'Fortify',
        power: 0,
        accuracy: 1.0,
        effect: 'defense_up',
        value: 2,
        emoji: '🛡️',
      },
      {
        id: 'm055',
        name: 'Automail Blade',
        power: 85,
        accuracy: 0.95,
        highCritChance: true,
        emoji: '⚔️',
      },
      {
        id: 'm056',
        name: 'Deconstruction',
        power: 60,
        accuracy: 1.0,
        effect: 'enemy_defense_down',
        value: 1,
        emoji: '💥',
      },
    ],
  },
  p015: {
    id: 'p015',
    name: 'Roy Mustang',
    //series: 'Fullmetal Alchemist',
    sprite: RoySprite,
    hp: 80,
    attack: 120,
    defense: 65,
    moves: [
      { id: 'm057', name: 'Flame Alchemy', power: 90, accuracy: 1.0, emoji: '🔥' },
      {
        id: 'm058',
        name: 'Ignition',
        power: 0,
        accuracy: 1.0,
        effect: 'attack_up',
        value: 2,
        emoji: '🔥',
      },
      {
        id: 'm059',
        name: 'Pinpoint Alchemy',
        power: 70,
        accuracy: 1.0,
        highCritChance: true,
        emoji: '🔥',
      },
      { id: 'm060', name: 'Inferno', power: 130, accuracy: 0.9, emoji: '🔥' },
    ],
  },
  p016: {
    id: 'p016',
    name: 'Sebastian Michaelis',
    //series: 'Black Butler',
    sprite: SebastianSprite,
    hp: 100,
    attack: 125,
    defense: 95,
    moves: [
      { id: 'm085', name: 'Silver Knife Flurry', power: 80, accuracy: 1.0, emoji: '🔪' },
      {
        id: 'm086',
        name: "Butler's Grace",
        power: 0,
        accuracy: 1.0,
        effect: 'defense_up',
        value: 2,
        emoji: '🤵',
      },
      {
        id: 'm087',
        name: 'True Form Glimpse',
        power: 130,
        accuracy: 0.9,
        effect: 'enemy_defense_down',
        value: 1,
        emoji: '😈',
      },
      {
        id: 'm088',
        name: "Hell's Contract",
        power: 0,
        accuracy: 1.0,
        effect: 'attack_up',
        value: 2,
        emoji: '📜',
      },
    ],
  },
  p017: {
    id: 'p017',
    name: 'Ciel Phantomhive',
    //series: 'Black Butler',
    sprite: CielSprite,
    hp: 70,
    attack: 60,
    defense: 65,
    moves: [
      { id: 'm089', name: 'Sebastian, an Order', power: 50, accuracy: 1.0, emoji: '🤵' },
      {
        id: 'm090',
        name: 'Checkmate',
        power: 0,
        accuracy: 1.0,
        effect: 'enemy_defense_down',
        value: 2,
        emoji: '♟️',
      },
      {
        id: 'm091',
        name: 'This is an Order!',
        power: 0,
        accuracy: 1.0,
        effect: 'attack_up',
        value: 2,
        emoji: '📜',
      },
      {
        id: 'm092',
        name: "Funtom's Might",
        power: 90,
        accuracy: 0.95,
        effect: 'enemy_attack_down',
        value: 1,
        emoji: '🏭',
      },
    ],
  },
};
