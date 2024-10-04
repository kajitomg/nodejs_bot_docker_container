import { Markup } from 'telegraf';
import { bold, fmt, italic } from 'telegraf/format';
import { HandlerError } from '../../../exceptions/api-error';
import { CallbackWrapper } from '../../../helpers/callback-wrapper';
import { composeWizardScene } from '../../../helpers/compose-wizard-scene';
import { createNextScene, getNextScene } from '../../../helpers/next-scene';
import send from '../../../helpers/send';
import { Languages } from '../../../models/user/user-model';
import Slices from '../../../slices';
import { ScenesTypes } from '../../index';

const ToMandatory = new CallbackWrapper('to_mandatory')

export const createMenuGamesScene = composeWizardScene(
  async (ctx) => {
    const chat_id = ctx.chat.id
    let language = ctx.scene.state?.options?.language
    try {
      if(!language) {
        const user = await Slices.user.crud.get({ chat_id })
        language = Languages?.[user.item?.language] || 'ru'
      }
      
      ctx.scene.state = {
        options: {
          language
        }
      }
      ctx.i18n.locale(language)
      const markup = Markup.inlineKeyboard(
        [
          Markup.button.callback(ctx.i18n.t('games.buttons.tapswap'), ToMandatory.create(ScenesTypes.tapSwap.wizard.ENTRY)),
          Markup.button.callback(ctx.i18n.t('games.buttons.xempire'), ToMandatory.create(ScenesTypes.xEmpire.wizard.ENTRY)),
          Markup.button.callback(ctx.i18n.t('games.buttons.blum'), ToMandatory.create(ScenesTypes.blum.wizard.ENTRY)),
          Markup.button.callback(ctx.i18n.t('games.buttons.back'), createNextScene(ScenesTypes.menu.wizard.ENTRY)),
        ],{ columns: 2 }
      )
      await send(ctx, fmt(bold(ctx.i18n.t('games.name')),'\n\n',italic(ctx.i18n.t('games.data.choose_action'))), markup)
    } catch (e) {
      console.error(new HandlerError(400, 'Ошибка: Игры', e))
    }
    return ctx.wizard.next();
  },
  async (ctx, done) => {
    const sceneId = ctx.update?.callback_query?.data;
    
    ctx.i18n.locale(ctx.scene.state?.options?.language)
    
    try {
      if (sceneId) {
        const nextScene = getNextScene(sceneId)
        const toMandatoryScene = ToMandatory.get(sceneId)
        if (nextScene) {
          ctx.wizard.state.nextScene = nextScene;
        }
        if (toMandatoryScene) {
          ctx.scene.state.mandatory_channel_next = toMandatoryScene
          ctx.wizard.state.nextScene = ScenesTypes.mandatorySubscription.wizard.MANDATORY;
        }
      } else {
        await ctx.sendMessage(ctx.i18n.t('games.exit', {menu_name:ctx.i18n.t('games.name')}))
      }
    } catch (e) {
      console.error(new HandlerError(400, 'Ошибка: Игры', e))
    }
    
    return done();
  },
);