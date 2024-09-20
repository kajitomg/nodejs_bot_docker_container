import { Markup } from 'telegraf';
import { bold, fmt, italic } from 'telegraf/format';
import { composeWizardScene } from '../../../helpers/compose-wizard-scene';
import { createNextScene, getNextScene } from '../../../helpers/next-scene';
import send from '../../../helpers/send';
import { adminUsers } from '../../../routes/admin-routes';
import { ScenesTypes } from '../../index';
import types from './types';

export const createEntryScene = composeWizardScene(
  async (ctx) => {
    const chatId = ctx.chat.id
    ctx.scene.state = {}
    const admin = adminUsers.includes(chatId)
    const markup = Markup.inlineKeyboard(
      [
        Markup.button.callback('Получить все коды', createNextScene(types.GET_ALL_CODES)),
        Markup.button.callback('Найти код по названию', createNextScene(types.SEARCH_CODES)),
        Markup.button.callback('Предложить код', createNextScene(types.GIVE_CODE)),
        Markup.button.callback('Модерировать коды', createNextScene(types.PULL_REQUEST_CODE), !admin),
        Markup.button.callback('Создать код', createNextScene(types.ADD_CODE), !admin),
        Markup.button.callback('Назад в меню', createNextScene(ScenesTypes.menu.wizard.ENTRY)),
      ],{ columns: 2 }
    )
    await send(ctx, fmt(bold('Меню X-Empire'),'\n\n',italic('Выберите интересующее вас действие:')), markup)
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
      await ctx.sendMessage('Вы вышли из меню X-Empire')
    }
    
    return done();
  },
);
