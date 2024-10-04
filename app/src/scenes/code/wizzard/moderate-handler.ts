import codeController from '../../../controllers/code-controller';
import { composeWizardScene } from '../../../helpers/compose-wizard-scene';
import { CodeStatuses } from '../../../models/code';
import { Languages } from '../../../models/user/user-model';
import Slices from '../../../slices';
import types from './types';

export const createPullRequestCodeHandlerScene = composeWizardScene(
  async (ctx, done) => {
    const game = ctx.wizard.state.options.game
    const chat_id = ctx.chat?.id;
    const sceneId = ctx.update?.callback_query?.data;
    
    let language = ctx.scene.state?.options?.language
    
    if(!language) {
      const user = await Slices.user.crud.get({ chat_id })
      language = Languages?.[user.item?.language] || 'ru'
    }
    
    if (ctx.wizard.state.options) {
      ctx.wizard.state.options.language = language
    } else {
      ctx.wizard.state.options = {
        language
      }
    }
    ctx.i18n.locale(language)
    

    if ( ctx.wizard.state.code_id ) {
      if ( ctx.wizard.state.status === 'accept' ) {
        await codeController.updateCode({
          id: ctx.wizard.state.code_id,
          status: CodeStatuses.accept,
          moderator_id: chat_id,
        })
      } else if ( ctx.wizard.state.status === 'reject' ) {
        await codeController.updateCode({
          id: ctx.wizard.state.code_id,
          status: CodeStatuses.reject,
          moderator_id: chat_id,
        })
      }
    }
    
    if (sceneId) {
      ctx.wizard.state.nextScene = types.PULL_REQUEST_CODE;
    } else {
      await ctx.sendMessage(ctx.i18n.t('code_moderate.exit',{ menu_name: ctx.i18n.t('code_moderate.name',{ game_name:game.name }) }))
    }
    return done();
  },
);