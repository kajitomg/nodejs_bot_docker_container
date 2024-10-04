import { createEntryScene } from './entry';
import { createMenuGamesScene } from './games';
import { createMenuProfileScene } from './profile';
import { createMenuServicesScene } from './services';
import types from './types';

export const WizardTypes = types

export const WizardScenes = [
  createEntryScene(types.ENTRY, (ctx) => ctx.wizard.state.nextScene),
  createMenuGamesScene(types.GAMES, (ctx) => ctx.wizard.state.nextScene),
  createMenuServicesScene(types.SERVICES, (ctx) => ctx.wizard.state.nextScene),
  createMenuProfileScene(types.PROFILE, (ctx) => ctx.wizard.state.nextScene),
]