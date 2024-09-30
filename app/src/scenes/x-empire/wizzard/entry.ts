import { Markup } from 'telegraf';
import { bold, fmt, italic } from 'telegraf/format';
import { HandlerError } from '../../../exceptions/api-error';
import { composeWizardScene } from '../../../helpers/compose-wizard-scene';
import { createNextScene, getNextScene } from '../../../helpers/next-scene';
import send from '../../../helpers/send';
import { GamesData } from '../../../models/game';
import { Languages } from '../../../models/user/user-model';
import { adminUsers } from '../../../routes/admin-routes';
import Slices from '../../../slices';
import { ScenesTypes } from '../../index';
import types from './types';

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
      const admin = adminUsers.includes(chatId)
      const markup = Markup.inlineKeyboard(
        [
          Markup.button.callback(ctx.i18n.t('game.buttons.getAll'), createNextScene(ScenesTypes.code.wizard.GET_ALL_CODES)),
          Markup.button.callback(ctx.i18n.t('game.buttons.search'), createNextScene(ScenesTypes.code.wizard.SEARCH_CODES)),
          Markup.button.callback(ctx.i18n.t('game.buttons.pull'), createNextScene(ScenesTypes.code.wizard.GIVE_CODE)),
          Markup.button.callback(ctx.i18n.t('game.buttons.moderate'), createNextScene(ScenesTypes.code.wizard.PULL_REQUEST_CODE), !admin),
          Markup.button.callback(ctx.i18n.t('game.buttons.create'), createNextScene(ScenesTypes.code.wizard.ADD_CODE), !admin),
          Markup.button.callback(ctx.i18n.t('game.buttons.back'), createNextScene(ScenesTypes.menu.wizard.ENTRY)),
        ],{ columns: 2 }
      )
      await send(ctx, fmt(bold(ctx.i18n.t('game.header', {game: game.name})),'\n\n',italic(ctx.i18n.t('game.body'))), markup)
    } catch (e) {
      console.error(new HandlerError(400, 'Ошибка: Меню X Empire', e))
    }
    return ctx.wizard.next();
  },
  async (ctx, done) => {
    const game = ctx.wizard.state?.options?.game
    const sceneId = ctx.update?.callback_query?.data;
    
    if (sceneId) {
      const nextScene = getNextScene(sceneId)
      if (nextScene) {
        ctx.wizard.state.nextScene = nextScene;
      }
    } else {
      await ctx.sendMessage(ctx.i18n.t('game.exit', {game: game.name}))
    }
    
    return done();
  },
);
