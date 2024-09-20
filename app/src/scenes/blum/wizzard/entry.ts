import { Markup } from 'telegraf';
import { bold, fmt, italic } from 'telegraf/format';
import { composeWizardScene } from '../../../helpers/compose-wizard-scene';
import { createNextScene, getNextScene } from '../../../helpers/next-scene';
import send from '../../../helpers/send';
import { GamesData } from '../../../models/game';
import { adminUsers } from '../../../routes/admin-routes';
import { ScenesTypes } from '../../index';
import types from './types';

export const createEntryScene = composeWizardScene(
  async (ctx) => {
    const chatId = ctx.chat.id
    const game = GamesData.BLUM
    ctx.scene.state = {
      options: {
        game,
        entry: types.ENTRY
      }
    }
    const admin = adminUsers.includes(chatId)
    const markup = Markup.inlineKeyboard(
      [
        Markup.button.callback('Получить все коды', createNextScene(ScenesTypes.code.wizard.GET_ALL_CODES)),
        Markup.button.callback('Найти код по названию', createNextScene(ScenesTypes.code.wizard.SEARCH_CODES)),
        Markup.button.callback('Предложить код', createNextScene(ScenesTypes.code.wizard.GIVE_CODE)),
        Markup.button.callback('Модерировать коды', createNextScene(ScenesTypes.code.wizard.PULL_REQUEST_CODE), !admin),
        Markup.button.callback('Создать код', createNextScene(ScenesTypes.code.wizard.ADD_CODE), !admin),
        Markup.button.callback('Назад в меню', createNextScene(ScenesTypes.menu.wizard.ENTRY)),
      ],{ columns: 2 }
    )
    await send(ctx, fmt(bold('Меню Blum'),'\n\n',italic('Выберите интересующее вас действие:')), markup)
    return ctx.wizard.next();
  },
  async (ctx, done) => {
    const sceneId = ctx.update?.callback_query?.data;
    
    if (sceneId) {
      const nextScene = getNextScene(sceneId)
      if (nextScene) {
        ctx.wizard.state.nextScene = nextScene;
      }
    } else {
      await ctx.sendMessage('Вы вышли из меню Blum')
    }
    
    return done();
  },
);
