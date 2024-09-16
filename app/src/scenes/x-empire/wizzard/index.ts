import { createAddCodeScene } from './add-code';
import { createAddCodeAddToDBScene } from './add-code-add-to-db';
import { createAddCodeContentScene } from './add-code-content';
import { createAddCodeEndDialogScene } from './add-code-end-dialog';
import { createAddCodeNameScene } from './add-code-name';
import { createEntryScene } from './entry';
import { createGetAllCodesScene } from './get-all-codes';
import { createGiveCodeScene } from './give-code';
import { createGiveCodeAddToDBScene } from './give-code-add-to-db';
import { createGiveCodeContentScene } from './give-code-content';
import { createGiveCodeEndDialogScene } from './give-code-end-dialog';
import { createGiveCodeNameScene } from './give-code-name';
import { createPullRequestCodeScene } from './pull-request-code';
import { createPullRequestCodeHandlerScene } from './pull-request-code-handler';
import { createSearchCodesScene } from './search-codes';
import types from './types';

export const WizardTypes = types

export const WizardScenes = [
  createEntryScene(types.ENTRY, (ctx) => ctx.wizard.state.nextScene),
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