import { Markup } from 'telegraf';
import { bold, fmt, italic } from 'telegraf/format';
import { HandlerError } from '../../../exceptions/api-error';
import { composeWizardScene } from '../../../helpers/compose-wizard-scene';
import sendMessage from '../../../helpers/send-message';
import { IMandatoryChannel } from '../../../models/mandatory-channel/mandatory-channel';
import { adminUsers } from '../../../routes/admin-routes';
import types from './types';

interface MandatoryCreateIdProps {
  channel: Partial<Omit<IMandatoryChannel, 'id'>>
}

export const createCreateMandatoryChannelIdScene = composeWizardScene<MandatoryCreateIdProps>(
  async (ctx) => {
    try {
      const chat_id = ctx.chat.id
      
      const admin = adminUsers.includes(chat_id)
      
      const markup = Markup.inlineKeyboard(
        [
          Markup.button.callback('Назад в меню', 'back', !admin),
        ],{ columns: 2 }
      )
      await sendMessage(ctx, {
        text: fmt(
          bold('Меню Создание канала ОП'),'\n\n',
          italic(`ID${ctx.scene.session.props.channel.channel_id ? '' : '*'}: ${ctx.scene.session.props.channel.channel_id || '-'}`),'\n\n',
          italic('Введите ID канала:')
        ),
        extra: markup
      })
    } catch (e) {
      console.error(new HandlerError(400, 'Ошибка: Создание канала ОП', e))
    }
    return ctx.wizard.next();
  },
  async (ctx, done, back) => {
    const callback_data = ctx.callbackQuery?.['data'];
    const message_text = ctx.message?.['text'];
    const channel = ctx.scene.session.props.channel
    
    try {
      await sendMessage(ctx, {}, {clear_markup: true})
      
      if (callback_data) {
        if (callback_data === 'back') {
          await back()
        }
      } else {
        const channel_updated = {
          ...channel,
          channel_id: message_text
        }
        if (!channel.link) {
          await done(types.CREATE_LINK, {
            channel: channel_updated
          });
        } else if (!channel.name) {
          await done(types.CREATE_NAME, {
            channel: channel_updated
          });
        } else {
          await back(types.CREATE, {
            channel: channel_updated
          });
        }
      }
    } catch (e) {
      console.error(new HandlerError(400, 'Ошибка: Создание канала ОП', e))
      await done();
    }
    return;
  },
);