import codeController from '../../../controllers/code-controller';
import { composeWizardScene } from '../../../helpers/compose-wizard-scene';
import { CodeStatuses } from '../../../models';
import types from './types';

export const createPullRequestCodeHandlerScene = composeWizardScene(
  async (ctx, done) => {
    const chatId = ctx.chat?.id;
    const sceneId = ctx.update?.callback_query?.data;

    if ( ctx.wizard.state.status === 'accept' ) {
      await codeController.updateCode({
        id: ctx.wizard.state.code_id,
        status: CodeStatuses.accept,
        moderator_id: chatId,
      })
    } else if ( ctx.wizard.state.status === 'reject' ) {
      await codeController.updateCode({
        id: ctx.wizard.state.code_id,
        status: CodeStatuses.reject,
        moderator_id: chatId,
      })
    }
    
    if (sceneId) {
      ctx.wizard.state.nextScene = types.PULL_REQUEST_CODE;
    } else {
      await ctx.sendMessage('Вы вышли из меню модерации кодов Blum')
    }
    return done();
  },
);