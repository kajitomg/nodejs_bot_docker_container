import { Markup } from 'telegraf';
import { bold, fmt, italic } from 'telegraf/format';
import { HandlerError } from '../../../exceptions/api-error';
import { composeWizardScene } from '../../../helpers/compose-wizard-scene';
import { createNextScene, getNextScene } from '../../../helpers/next-scene';
import send from '../../../helpers/send';
import { ScenesTypes } from '../../index';
import types from './types';

export const createEntryMandatoryChannelScene = composeWizardScene(
  async (ctx) => {
    try {
      delete ctx.wizard.state?.create_mandatory_channel
      const markup = Markup.inlineKeyboard(
        [
          Markup.button.callback('Добавить канал', createNextScene(types.CREATE)),
          Markup.button.callback('Список каналов', createNextScene(types.LIST)),
          Markup.button.callback('Назад в меню', createNextScene(ScenesTypes.menu.wizard.ENTRY)),
        ],{ columns: 2 }
      )
      await send(ctx, fmt(bold('Меню ОП'),'\n\n',italic('Выберите интересующее вас действие:')), markup)
      
    } catch (e) {
      console.error(new HandlerError(400, 'Ошибка: Меню ОП', e))
    }
    return ctx.wizard.next();
  },
  async (ctx, done) => {
    const callback_query = ctx.update?.callback_query?.data;
    
    try {
      if (callback_query) {
        const nextScene = getNextScene(callback_query)
        if (nextScene) {
          ctx.wizard.state.nextScene = nextScene;
        }
      } else {
        await ctx.sendMessage('Вы вышли из сцены Меню ОП')
      }
      
    } catch (e) {
      console.error(new HandlerError(400, 'Ошибка: Меню ОП', e))
    }
    return done();
  },
);