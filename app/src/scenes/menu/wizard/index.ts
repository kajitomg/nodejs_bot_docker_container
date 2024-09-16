import { createEntryScene } from './entry';
import types from './types';

export const WizardTypes = types

export const WizardScenes = [
  createEntryScene(types.ENTRY, (ctx) => ctx.wizard.state.nextScene),
]