import { Markup } from 'telegraf';
import { bold, fmt, italic } from 'telegraf/format';
import mandatoryChannelController from '../../../controllers/mandatory-channel-controller';
import { HandlerError } from '../../../exceptions/api-error';
import { composeWizardScene } from '../../../helpers/compose-wizard-scene';
import { createNextScene, getNextScene } from '../../../helpers/next-scene';
import send from '../../../helpers/send';
import types from './types';

export const createItemMandatoryChannelScene = composeWizardScene(
  async (ctx) => {
    try {
      const item = await mandatoryChannelController.getChannel({
        id: ctx.wizard.state?.mandatory_channel_item?.id
      })
      
      const markup = Markup.inlineKeyboard(
        [
          Markup.button.callback('Назад в меню', createNextScene(types.LIST)),
        ],{ columns: 1 }
      )
      await send(ctx, fmt(
        bold('Меню Канал ОП'),'\n\n',
        bold(`Название: ${item.item?.name || '-'}`),'\n\n',
        bold(`Описание: ${item.item?.description || '-'}`),'\n\n',
        bold(`ID: ${item.item?.channel_id || '-'}`),'\n\n',
        bold(`Активирован: ${item.item?.active ? '✔️' :'❌'}`),'\n\n',
        bold(`Ссылка: ${item.item?.link || '-'}`)
      ), markup)
    } catch (e) {
      console.error(new HandlerError(400, 'Ошибка: Меню Канал ОП', e))
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
      }  else {
        await ctx.sendMessage('Вы вышли из Меню Канал ОП')
      }
    } catch (e) {
      console.error(new HandlerError(400, 'Ошибка: Меню Канал ОП', e))
    }
    return done();
  },
);