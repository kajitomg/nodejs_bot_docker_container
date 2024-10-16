import { Markup } from 'telegraf';
import { bold, fmt, italic } from 'telegraf/format';
import { HandlerError } from '../../../exceptions/api-error';
import { CallbackQueryWrapper } from '../../../helpers/callback-wrapper';
import { composeWizardScene } from '../../../helpers/compose-wizard-scene';
import send from '../../../helpers/send';
import { Languages } from '../../../models/user/user-model';
import Slices from '../../../slices';
import { ScenesTypes } from '../../index';

const nextSceneHandler = CallbackQueryWrapper.nextSceneHandler()

const ToMandatoryHandler = new CallbackQueryWrapper('to_mandatory')

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
          Markup.button.callback(ctx.i18n.t('games.buttons.tapswap'), ToMandatoryHandler.create(ScenesTypes.tapSwap.wizard.ENTRY)),
          Markup.button.callback(ctx.i18n.t('games.buttons.xempire'), ToMandatoryHandler.create(ScenesTypes.xEmpire.wizard.ENTRY)),
          Markup.button.callback(ctx.i18n.t('games.buttons.blum'), ToMandatoryHandler.create(ScenesTypes.blum.wizard.ENTRY)),
          Markup.button.callback(ctx.i18n.t('games.buttons.back'), nextSceneHandler.create(ScenesTypes.menu.wizard.ENTRY)),
        ],{ columns: 2 }
      )
      await send(ctx, fmt(bold(ctx.i18n.t('games.name')),'\n\n',italic(ctx.i18n.t('games.data.choose_action'))), markup)
    } catch (e) {
      console.error(new HandlerError(400, 'Ошибка: Игры', e))
    }
    return ctx.wizard.next();
  },
  async (ctx, done) => {
    const callback_data = ctx.update?.callback_query?.data;
    
    ctx.i18n.locale(ctx.scene.state?.options?.language)
    
    try {
      if (callback_data) {
        nextSceneHandler.on(callback_data, async (value) => {
          ctx.wizard.state.nextScene = value;
        })
        ToMandatoryHandler.on(callback_data, async (value) => {
          ctx.scene.state.mandatory_channel_next = value
          ctx.wizard.state.nextScene = ScenesTypes.mandatorySubscription.wizard.MANDATORY;
        })
      } else {
        await ctx.sendMessage(ctx.i18n.t('games.exit', {menu_name:ctx.i18n.t('games.name')}))
      }
    } catch (e) {
      console.error(new HandlerError(400, 'Ошибка: Игры', e))
    }
    
    return done();
  },
);