import { createWizardPostBodyItem } from './body-item';
import { createWizardPostMediaPhotoItem } from './media-photo-item';
import { createPostNameUpdateScene } from './name-update';
import { createCreatePhotoPostTemplateScene } from './media-photo-create';
import { createWizardPostTemplateCreate } from './template-create';
import { createCreateVariablePostTemplateScene } from './variable-update';
import { createDataListScene } from './variable-list';
import { createEntryPostScene } from './entry';
import { createPostTemplateItemScene } from './template-item';
import { createListPostScene } from './template-list';
import { createMediaListScene } from './media-list';
import types from './types';

export const WizardTypes = types

export const WizardScenes = [
  createEntryPostScene(types.ENTRY, (ctx) => ctx.wizard.state.nextScene),
  createListPostScene(types.LIST, (ctx) => ctx.wizard.state.nextScene),
  createPostTemplateItemScene(types.TEMPLATE_ITEM, (ctx) => ctx.wizard.state.nextScene),
  createDataListScene(types.VARIABLES_LIST, (ctx) => ctx.wizard.state.nextScene),
  createMediaListScene(types.MEDIA_LIST, (ctx) => ctx.wizard.state.nextScene),
  createWizardPostMediaPhotoItem(types.MEDIA_PHOTO_ITEM, (ctx) => ctx.wizard.state.nextScene),
  createCreatePhotoPostTemplateScene(types.CREATE_PHOTO, (ctx) => ctx.wizard.state.nextScene),
  createWizardPostTemplateCreate(types.TEMPLATE_CREATE, (ctx) => ctx.wizard.state.nextScene),
  createWizardPostBodyItem(types.BODY_ITEM, (ctx) => ctx.wizard.state.nextScene),
  createCreateVariablePostTemplateScene(types.CREATE_VARIABLE, (ctx) => ctx.wizard.state.nextScene),
  createPostNameUpdateScene(types.NAME_UPDATE, (ctx) => ctx.wizard.state.nextScene),
  
]