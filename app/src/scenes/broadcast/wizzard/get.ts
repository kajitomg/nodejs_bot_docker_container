import { Markup } from 'telegraf';
import { bold, fmt, italic, FmtString } from 'telegraf/format';
import { HandlerError } from '../../../exceptions/api-error';
import { CallbackQueryWrapper } from '../../../helpers/callback-wrapper';
import { composeWizardScene } from '../../../helpers/compose-wizard-scene';
import send from '../../../helpers/send';
import { MessageEntity } from '../../../models/post/post-model';
import { isAdmin } from '../../../routes/admin-routes';
import types from './types';

const nextSceneHandler = CallbackQueryWrapper.nextSceneHandler()

interface BroadcastGetProps {
  text: { value: string, entities: MessageEntity[] },
  forward: { chat_id: number, message_id: number }
}

export const createGetBroadcastScene = composeWizardScene<BroadcastGetProps>(
  async (ctx) => {
    const chat_id = ctx.chat.id
    
    const admin = isAdmin(chat_id)
    try {

      const markup = Markup.inlineKeyboard(
        [
          Markup.button.callback('Запустить пост', nextSceneHandler.create(types.START),!admin || (!ctx.scene.session.props?.text && !ctx.scene.session.props?.forward)),
          Markup.button.callback('Сменить пост', nextSceneHandler.create(types.CREATE), !admin),
          Markup.button.callback('Назад к списку действий', 'back_to', !admin)
        ],{ columns: 2 }
      )
      if (ctx.scene.session.props?.forward) {
        // @ts-ignore
        await ctx.forwardMessage(chat_id, { from_chat_id: ctx.scene.session.props?.forward.chat_id, message_id: ctx.scene.session.props?.forward.message_id })
        await send(ctx, fmt(bold('Текущий пост'),'\n\n',italic('Пересланное сообщение ⬆')),markup)
      } else if (ctx.scene.session.props?.text) {
        const msg = new FmtString(ctx.scene.session.props?.text?.value, ctx.scene.session.props?.text?.entities)
        await send(ctx, fmt(bold('Текущий пост'),'\n\n',ctx.scene.session.props?.text?.value ? msg : 'Нет поста'),markup)
      } else {
        await send(ctx, fmt(bold('Текущий пост'),'\n\n','Нет поста'),markup)
        
      }
    } catch (e) {
      console.error(new HandlerError(400, 'Ошибка: Меню Рассылки сообщений', e))
    }
    return ctx.wizard.next();
  },
  async (ctx, done, back) => {
    const callback_data = ctx.callbackQuery?.['data'];
    
    try {
      if (callback_data) {
        if (callback_data === 'back_to') {
          await back(types.ENTRY);
        }
        await nextSceneHandler.on(callback_data, async (value) => {
          await done(value, {
            ...ctx.scene.session.props
          });
        })
      } else {
        await ctx.sendMessage('Вы вышли из Меню Рассылки сообщений')
        await done();
      }
    } catch (e) {
      console.error(new HandlerError(400, 'Ошибка: Меню Рассылки сообщений', e))
    }
    
    return;
  },
);