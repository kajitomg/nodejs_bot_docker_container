import { Markup } from 'telegraf';
import { bold, fmt, italic } from 'telegraf/format';
import { HandlerError } from '../../../exceptions/api-error';
import { CallbackQueryWrapper } from '../../../helpers/callback-wrapper';
import { composeWizardScene } from '../../../helpers/compose-wizard-scene';
import send from '../../../helpers/send';
import { GamesData } from '../../../models/game';
import { Languages } from '../../../models/user/user-model';
import { adminUsers } from '../../../routes/admin-routes';
import Slices from '../../../slices';
import { ScenesTypes } from '../../index';
import types from './types';

const nextSceneHandler = CallbackQueryWrapper.nextSceneHandler()
const goToActivityHandler = new CallbackQueryWrapper('goto_activity')

const ToMandatoryHandler = new CallbackQueryWrapper('to_mandatory')

export const createEntryScene = composeWizardScene(
  async (ctx) => {
    const chatId = ctx.chat.id
    const game = GamesData.XEMPIRE
    let language = ctx.scene.state?.options?.language
    try {
      if(!language) {
        const user = await Slices.user.crud.get({ chat_id: chatId })
        language = Languages?.[user.item?.language] || 'ru'
      }
      
      ctx.scene.state = {
        ...ctx.scene.state,
        options: {
          ...ctx.scene.state.options,
          language,
          game,
          entry: types.ENTRY,
        },
      }
      
      ctx.i18n.locale(language)
      
      const activities = await Slices.activity.crud.gets({
        data: {game: game.id}
      })
      
      const admin = adminUsers.includes(chatId)
      const markup = Markup.inlineKeyboard(
        [
          Markup.button.callback(ctx.i18n.t('game.buttons.get_all'), ToMandatoryHandler.create(ScenesTypes.code.wizard.GET_ALL_CODES)),
          Markup.button.callback(ctx.i18n.t('game.buttons.search'), ToMandatoryHandler.create(ScenesTypes.code.wizard.SEARCH_CODES)),
          Markup.button.callback(ctx.i18n.t('game.buttons.suggest'), nextSceneHandler.create(ScenesTypes.code.wizard.GIVE_CODE)),
          Markup.button.callback(ctx.i18n.t('game.buttons.moderate'), nextSceneHandler.create(ScenesTypes.code.wizard.PULL_REQUEST_CODE), !admin),
          Markup.button.callback(ctx.i18n.t('game.buttons.create'), nextSceneHandler.create(ScenesTypes.code.wizard.ADD_CODE), !admin),
          Markup.button.callback('Создать активность', nextSceneHandler.create(ScenesTypes.activity.wizard.CREATE), !admin),
          ...activities?.items.map((activity) => Markup.button.callback(activity.name, goToActivityHandler.create(`${activity.id}`), !admin && !Boolean(activity.post_id))),
          Markup.button.callback(ctx.i18n.t('game.buttons.back_to',{ menu_name: ctx.i18n.t('games.name')}), nextSceneHandler.create(ScenesTypes.menu.wizard.GAMES)),
        ],{ columns: 2 }
      )
      await send(ctx, fmt(bold(ctx.i18n.t('game.name',{ game_name:game.name })),'\n\n',italic(ctx.i18n.t('game.data.choose_action'))), markup)
    } catch (e) {
      console.error(new HandlerError(400, 'Ошибка: Меню X Empire', e))
    }
    return ctx.wizard.next();
  },
  async (ctx, done) => {
    const game = ctx.wizard.state?.options?.game
    const callback_data = ctx.update?.callback_query?.data;
    
    try {
      ctx.i18n.locale(ctx.scene.state?.options?.language)
      
      if (callback_data) {
        nextSceneHandler.on(callback_data, async (value) => {
          ctx.wizard.state.nextScene = value;
        })
        goToActivityHandler.on(callback_data, async (value) => {
          ctx.wizard.state.activity_id = value
          ctx.scene.state.mandatory_channel_next = ScenesTypes.activity.wizard.ITEM
          ctx.wizard.state.nextScene = ScenesTypes.mandatorySubscription.wizard.MANDATORY;
        })
        ToMandatoryHandler.on(callback_data, async (value) => {
          ctx.scene.state.mandatory_channel_next = value
          ctx.wizard.state.nextScene = ScenesTypes.mandatorySubscription.wizard.MANDATORY;
        })
      } else {
        await ctx.sendMessage(ctx.i18n.t('game.exit',{ menu_name: ctx.i18n.t('game.name',{ game_name:game.name }) }))
      }
    } catch (e) {
      console.error(new HandlerError(400, 'Ошибка: Меню X Empire', e))
    }
    return done();
  },
);
