import { createWizardChangeNameScene } from './change-name';
import { createCreateActivityScene } from './create';
import { createWizardActivityItem } from './item';
import { createWizardActivityTemplateChange } from './template-change';
import types from './types';

export const WizardTypes = types

export const WizardScenes = [
  createCreateActivityScene(types.CREATE, (ctx) => ctx.wizard.state.nextScene),
  createWizardChangeNameScene(types.CHANGE_NAME, (ctx) => ctx.wizard.state.nextScene),
  createWizardActivityItem(types.ITEM, (ctx) => ctx.wizard.state.nextScene),
  createWizardActivityTemplateChange(types.TEMPLATE_CHANGE, (ctx) => ctx.wizard.state.nextScene),
]