import { Markup } from 'telegraf';
import { bold, fmt, FmtString, italic } from 'telegraf/format';
import { HandlerError } from '../../../exceptions/api-error';
import { CallbackQueryWrapper } from '../../../helpers/callback-wrapper';
import { composeWizardScene } from '../../../helpers/compose-wizard-scene';
import send from '../../../helpers/send';
import { sleep } from '../../../helpers/sleep';
import { MessageEntity } from '../../../models/post/post-model';
import { isAdmin } from '../../../routes/admin-routes';
import Slices from '../../../slices';
import types from './types';

const nextSceneHandler = CallbackQueryWrapper.nextSceneHandler()

interface BroadcastStartProps {
  text: { value: string, entities: MessageEntity[] },
  forward: { chat_id: number, message_id: number }
}

export const createStartBroadcastScene = composeWizardScene<BroadcastStartProps>(
  async (ctx) => {
    const chat_id = ctx.chat.id

    const admin = isAdmin(chat_id)
    try {
      const markup = Markup.inlineKeyboard(
        [
          Markup.button.callback('Запустить пост', 'start',!admin || (!ctx.scene.session.props?.text && !ctx.scene.session.props?.forward)),
          Markup.button.callback('Сменить пост', nextSceneHandler.create(types.CREATE), !admin),
          Markup.button.callback('Назад к списку действий', 'back_to', !admin)
        ],{ columns: 2 }
      )
      if (ctx.scene.session.props?.forward) {
        await send(ctx, fmt(bold('Вы уверены, что хотите запустить рассылку?'),'\n\n',italic('Пересланное сообщение ⬆')),markup)
      } else if (ctx.scene.session.props?.text) {
        const msg = new FmtString(ctx.scene.session.props?.text?.value, ctx.scene.session.props?.text?.entities)
        await send(ctx, fmt(bold('Вы уверены, что хотите запустить рассылку?'),'\n\n', ctx.scene.session.props?.text?.value ? msg : 'Нет поста'),markup)
      }
     
    } catch (e) {
      console.error(new HandlerError(400, 'Ошибка: Меню Запуска рассылки сообщений', e))
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
          await done(value)
        })
        if( callback_data === 'start' && (ctx.scene.session.props?.text?.value || ctx.scene.session.props?.forward)) {
          const author = ctx.from
          const msg = new FmtString(ctx.scene.session.props?.text?.value, ctx.scene.session.props?.text?.entities)
          const users = await Slices.user.crud.gets()
          ctx.deleteMessage()
          try {
            for (const user of users.list) {
              try {
                if (ctx.scene.session.props?.forward) {
                  // @ts-ignore
                  await ctx.forwardMessage(user.chat_id, {from_chat_id: ctx.scene.session.props?.forward.chat_id, message_id: ctx.scene.session.props?.forward.message_id })
                } else if (ctx.scene.session.props?.text) {
                  await ctx.telegram.sendMessage(user.chat_id, msg);
                }
                await sleep(1000 / 30)
              } catch (error) {
                console.log(user.chat_id + ' ' + error.response?.error_code + ' ' + error.response?.description)
              }
            }
          } catch (error) {
            console.log(author.username + ' ' + error.response?.error_code + ' ' + error.response?.description)
          }
        }
      } else {
        await ctx.sendMessage('Вы вышли из Меню Запуска рассылки сообщений')
        await done();
      }
    } catch (e) {
      console.error(new HandlerError(400, 'Ошибка: Меню Запуска рассылки сообщений', e));
    }
    
    return;
  },
);