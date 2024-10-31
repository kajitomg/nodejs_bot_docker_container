
export interface Game {
  id: Games,
  name: string
}

export enum Games {
  'TAPSWAP',
  'XEMPIRE',
  'BLUM',
  'CATS',
  'HOT',
  'CITYHOLDER',
  'HAMSTERKOMBAT',
  'BUMS',
  'PAWS',
}

export const GamesData:Record<keyof typeof Games, Game> = {
  TAPSWAP: {
    id: Games.TAPSWAP,
    name: 'TapSwap'
  },
  XEMPIRE: {
    id: Games.XEMPIRE,
    name: 'X Empire'
  },
  BLUM: {
    id: Games.BLUM,
    name: 'Blum'
  },
  CATS: {
    id: Games.CATS,
    name: 'Cats'
  },
  HOT: {
    id: Games.HOT,
    name: 'HOT Wallet'
  },
  CITYHOLDER: {
    id: Games.CITYHOLDER,
    name: 'City Holder'
  },
  HAMSTERKOMBAT: {
    id: Games.HAMSTERKOMBAT,
    name: 'Hamster Kombat'
  },
  BUMS: {
    id: Games.BUMS,
    name: 'BUMS'
  },
  PAWS: {
    id: Games.PAWS,
    name: 'PAWS'
  },
}