import { createAddCodeScene } from './create';
import { createAddCodeAddToDBScene } from './create-add-to-db';
import { createAddCodeContentScene } from './create-content';
import { createAddCodeEndDialogScene } from './create-end-dialog';
import { createAddCodeNameScene } from './create-name';
import { createGetAllCodesScene } from './get-all';
import { createGiveCodeScene } from './suggest';
import { createGiveCodeAddToDBScene } from './suggest-add-to-db';
import { createGiveCodeContentScene } from './suggest-content';
import { createGiveCodeEndDialogScene } from './suggest-end-dialog';
import { createGiveCodeNameScene } from './suggest-name';
import { createPullRequestCodeScene } from './moderate';
import { createPullRequestCodeHandlerScene } from './moderate-handler';
import { createSearchCodesScene } from './search';
import types from './types';

export const WizardTypes = types

export const WizardScenes = [
  createAddCodeScene(types.ADD_CODE, (ctx) => ctx.wizard.state.nextScene),
  createAddCodeNameScene(types.ADD_CODE_NAME, (ctx) => ctx.wizard.state.nextScene),
  createAddCodeContentScene(types.ADD_CODE_CONTENT, (ctx) => ctx.wizard.state.nextScene),
  createAddCodeAddToDBScene(types.ADD_CODE_ADD_TO_DB, (ctx) => ctx.wizard.state.nextScene),
  createAddCodeEndDialogScene(types.ADD_CODE_END_DIALOG, (ctx) => ctx.wizard.state.nextScene),
  createGiveCodeScene(types.GIVE_CODE, (ctx) => ctx.wizard.state.nextScene),
  createGiveCodeNameScene(types.GIVE_CODE_NAME, (ctx) => ctx.wizard.state.nextScene),
  createGiveCodeContentScene(types.GIVE_CODE_CONTENT, (ctx) => ctx.wizard.state.nextScene),
  createGiveCodeAddToDBScene(types.GIVE_CODE_ADD_TO_DB, (ctx) => ctx.wizard.state.nextScene),
  createGiveCodeEndDialogScene(types.GIVE_CODE_END_DIALOG, (ctx) => ctx.wizard.state.nextScene),
  createGetAllCodesScene(types.GET_ALL_CODES, (ctx) => ctx.wizard.state.nextScene),
  createSearchCodesScene(types.SEARCH_CODES, (ctx) => ctx.wizard.state.nextScene),
  createPullRequestCodeScene(types.PULL_REQUEST_CODE, (ctx) => ctx.wizard.state.nextScene),
  createPullRequestCodeHandlerScene(types.PULL_REQUEST_CODE_HANDLER, (ctx) => ctx.wizard.state.nextScene)
]