import { createCreateBroadcastScene } from './create';
import { createEntryBroadcastScene } from './entry';
import { createGetBroadcastScene } from './get';
import { createStartBroadcastScene } from './start';
import types from './types';

export const WizardTypes = types

export const WizardScenes = [
  createEntryBroadcastScene(types.ENTRY, (ctx) => ctx.wizard.state.nextScene),
  createCreateBroadcastScene(types.CREATE, (ctx) => ctx.wizard.state.nextScene),
  createGetBroadcastScene(types.GET, (ctx) => ctx.wizard.state.nextScene),
  createStartBroadcastScene(types.START, (ctx) => ctx.wizard.state.nextScene),
]