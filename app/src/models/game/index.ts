
interface Game {
  id: Games,
  name: string
}

export enum Games {
  'TAPSWAP',
  'XEMPIRE',
  'BLUM',
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
}