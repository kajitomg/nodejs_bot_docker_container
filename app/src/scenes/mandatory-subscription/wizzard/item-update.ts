import { Markup } from 'telegraf';
import { bold, fmt, italic } from 'telegraf/format';
import mandatoryChannelController from '../../../controllers/mandatory-channel-controller';
import { HandlerError } from '../../../exceptions/api-error';
import { composeWizardScene } from '../../../helpers/compose-wizard-scene';
import sendMessage from '../../../helpers/send-message';
import { IMandatoryChannel } from '../../../models/mandatory-channel/mandatory-channel';
import { isAdmin } from '../../../routes/admin-routes';
import types from './types';

interface MandatoryItemUpdateProps {
  field_name: string,
  channel?: Partial<IMandatoryChannel>,
}

export const createItemUpdateMandatoryChannelScene = composeWizardScene<MandatoryItemUpdateProps>(
  async (ctx) => {
    try {
      const chat_id = ctx.chat.id
      
      const admin = isAdmin(chat_id)
      
      const markup = Markup.inlineKeyboard(
        [
          Markup.button.callback('Назад в меню', 'back', !admin),
        ],{ columns: 2 }
      )
     await sendMessage(ctx, {
       text: fmt(
         bold('Меню Изменение канала ОП'),'\n\n',
         italic(`${ctx.scene.session.props.field_name}: ${ctx.scene.session.props.channel?.[ctx.scene.session.props.field_name] || '-'}`),'\n\n',
         italic('Отправьте текст:')
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
        if ( callback_data === 'back' ) {
          await back();
        }
      } else {
        await mandatoryChannelController.updateChannel({
          id: channel?.id,
          [ctx.scene.session.props.field_name]: message_text
        })
        await back(types.ITEM, {
          channel_id: channel.id
        });
      }
    } catch (e) {
      console.error(new HandlerError(400, 'Ошибка: Создание канала ОП', e))
    }
    return;
  },
);