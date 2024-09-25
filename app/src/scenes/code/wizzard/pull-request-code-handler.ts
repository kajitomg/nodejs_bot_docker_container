import codeController from '../../../controllers/code-controller';
import { composeWizardScene } from '../../../helpers/compose-wizard-scene';
import { CodeStatuses } from '../../../models/code';
import types from './types';

export const createPullRequestCodeHandlerScene = composeWizardScene(
  async (ctx, done) => {
    const game = ctx.wizard.state.options.game
    const chatId = ctx.chat?.id;
    const sceneId = ctx.update?.callback_query?.data;

    if ( ctx.wizard.state.code_id ) {
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
    }
    
    if (sceneId) {
      ctx.wizard.state.nextScene = types.PULL_REQUEST_CODE;
    } else {
      await ctx.sendMessage(ctx.i18n.t('code.pull.exit', { game: game.name }))
    }
    return done();
  },
);