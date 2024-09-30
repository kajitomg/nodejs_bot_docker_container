import { createCreateMandatoryChannelScene } from './create';
import { createCreateMandatoryChannelDescriptionScene } from './create-description';
import { createCreateMandatoryChannelIdScene } from './create-id';
import { createCreateMandatoryChannelLinkScene } from './create-link';
import { createCreateMandatoryChannelNameScene } from './create-name';
import { createEntryMandatoryChannelScene } from './entry';
import { createItemMandatoryChannelScene } from './item';
import { createListMandatoryChannelScene } from './list';
import { createMandatoryChannelScene } from './mandatory';
import types from './types';

export const WizardTypes = types

export const WizardScenes = [
  createEntryMandatoryChannelScene(types.ENTRY, (ctx) => ctx.wizard.state.nextScene),
  createListMandatoryChannelScene(types.LIST, (ctx) => ctx.wizard.state.nextScene),
  createItemMandatoryChannelScene(types.ITEM, (ctx) => ctx.wizard.state.nextScene),
  createCreateMandatoryChannelScene(types.CREATE, (ctx) => ctx.wizard.state.nextScene),
  createCreateMandatoryChannelIdScene(types.CREATE_ID, (ctx) => ctx.wizard.state.nextScene),
  createCreateMandatoryChannelLinkScene(types.CREATE_LINK, (ctx) => ctx.wizard.state.nextScene),
  createCreateMandatoryChannelNameScene(types.CREATE_NAME, (ctx) => ctx.wizard.state.nextScene),
  createCreateMandatoryChannelDescriptionScene(types.CREATE_DESCRIPTION, (ctx) => ctx.wizard.state.nextScene),
  createMandatoryChannelScene(types.MANDATORY, (ctx) => ctx.wizard.state.nextScene),
]