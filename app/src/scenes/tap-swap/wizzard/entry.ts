import { Markup } from 'telegraf';
import { bold, fmt, italic } from 'telegraf/format';
import { composeWizardScene } from '../../../helpers/compose-wizard-scene';
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
        Markup.button.callback('Получить все коды', types.GET_ALL_CODES),
        Markup.button.callback('Найти код по названию', types.SEARCH_CODES),
        Markup.button.callback('Предложить код', types.GIVE_CODE),
        Markup.button.callback('Модерировать коды', types.PULL_REQUEST_CODE, !admin),
        Markup.button.callback('Создать код', types.ADD_CODE, !admin),
        Markup.button.callback('Назад в меню', ScenesTypes.menu.wizard.ENTRY),
      ],{ columns: 2 }
    )
    await send(ctx, fmt(bold('Меню TapSwap'),'\n\n',italic('Выберите интересующее вас действие:')), markup)
    return ctx.wizard.next();
  },
  async (ctx, done) => {
    const sceneId = ctx.update?.callback_query?.data;
    
    if (sceneId) {
      ctx.wizard.state.nextScene = sceneId;
    } else {
      await ctx.sendMessage('Вы вышли из меню TapSwap')
    }
    
    return done();
  },
);
