import { Markup } from 'telegraf';
import { bold, fmt, italic } from 'telegraf/format';
import mandatoryChannelController from '../../../controllers/mandatory-channel-controller';
import { HandlerError } from '../../../exceptions/api-error';
import { composeWizardScene } from '../../../helpers/compose-wizard-scene';
import { createNextScene, getNextScene } from '../../../helpers/next-scene';
import send from '../../../helpers/send';
import { ScenesTypes } from '../../index';
import types from './types';

export const createCreateMandatoryChannelDescriptionScene = composeWizardScene(
  async (ctx) => {
    try {
      
      const markup = Markup.inlineKeyboard(
        [
          Markup.button.callback('Назад в меню', createNextScene(types.CREATE)),
        ],{ columns: 2 }
      )
      await send(ctx, fmt(
        bold('Меню Создание канала ОП'),'\n\n',
        italic(`Описание: ${ctx.wizard.state.create_mandatory_channel.description || '-'}`),'\n\n',
        italic('Введите описание канала:')
      ), markup)
    } catch (e) {
      console.error(new HandlerError(400, 'Ошибка: Создание канала ОП', e))
    }
    return ctx.wizard.next();
  },
  async (ctx, done) => {
    const chatId = ctx.chat?.id;
    const callback_query = ctx.update?.callback_query?.data;
    const message_text = ctx.message?.text;
    
    try {
      ctx.telegram.editMessageReplyMarkup(chatId, ctx.wizard.state.delete_message_id, undefined, undefined)
      if (callback_query) {
        const nextScene = getNextScene(callback_query)
        if (nextScene) {
          ctx.wizard.state.nextScene = nextScene;
        }
      } else {
        ctx.wizard.state.nextScene = types.ITEM;
        await mandatoryChannelController.updateChannel({
          id: ctx.wizard.state?.mandatory_channel_item?.id,
          description: message_text
        })
      }
      if (ctx.wizard.state.warning) {
        delete ctx.wizard.state.warning;
      }
    } catch (e) {
      console.error(new HandlerError(400, 'Ошибка: Создание канала ОП', e))
    }
    return done();
  },
);