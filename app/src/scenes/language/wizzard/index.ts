import { createChangeLanguageEntryScene } from './entry';
import types from './types';

export const WizardTypes = types

export const WizardScenes = [
  createChangeLanguageEntryScene(types.ENTRY, (ctx) => ctx.wizard.state.nextScene),
]