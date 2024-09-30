import { createChangeLanguageScene } from './change-language';
import types from './types';

export const WizardTypes = types

export const WizardScenes = [
  createChangeLanguageScene(types.CHANGE_LANGUAGE, (ctx) => ctx.wizard.state.nextScene),
]