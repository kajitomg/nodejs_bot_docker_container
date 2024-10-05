import { Markup } from 'telegraf';
import { bold, fmt, FmtString, italic } from 'telegraf/format';
import { HandlerError } from '../../../exceptions/api-error';
import { composeWizardScene } from '../../../helpers/compose-wizard-scene';
import { createNextScene, getNextScene } from '../../../helpers/next-scene';
import send from '../../../helpers/send';
import { sleep } from '../../../helpers/sleep';
import { Languages } from '../../../models/user/user-model';
import { adminUsers } from '../../../routes/admin-routes';
import Slices from '../../../slices';
import types from './types';

export const createStartBroadcastScene = composeWizardScene(
  async (ctx) => {
    const chat_id = ctx.chat.id
    
    const admin = adminUsers.includes(chat_id)
    let language = ctx.scene.state?.options?.language
    try {
      if(!language) {
        const user = await Slices.user.crud.get({ chat_id })
        language = Languages?.[user.item?.language] || 'ru'
      }
      
      ctx.scene.state = {
        ...ctx.scene.state,
        options: {
          ...ctx.scene.state.options,
          language
        }
      }
      ctx.i18n.locale(language)
      const markup = Markup.inlineKeyboard(
        [
          Markup.button.callback('Запустить пост', 'start',!admin && !ctx.wizard.state.broadcast?.text && !ctx.wizard.state.broadcast?.forward),
          Markup.button.callback('Сменить пост', createNextScene(types.CREATE), !admin),
          Markup.button.callback('Назад к списку действий', createNextScene(types.ENTRY), !admin)
        ],{ columns: 2 }
      )
      if (ctx.wizard.state.broadcast?.forward) {
        await send(ctx, fmt(bold('Вы уверены, что хотите запустить рассылку?'),'\n\n',italic('Пересланное сообщение ⬆')),markup)
      } else if (ctx.wizard.state.broadcast?.text) {
        const msg = new FmtString(ctx.wizard.state.broadcast?.text?.value, ctx.wizard.state.broadcast?.text?.entities)
        await send(ctx, fmt(bold('Вы уверены, что хотите запустить рассылку?'),'\n\n',ctx.wizard.state.broadcast?.text?.value ? msg : 'Нет поста'),markup)
      }
     
    } catch (e) {
      console.error(new HandlerError(400, 'Ошибка: Меню Запуска рассылки сообщений', e))
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
        if( callback_query === 'start' && (ctx.wizard.state.broadcast?.text?.value || ctx.wizard.state.broadcast?.forward)) {
          const author = ctx.from
          const msg = new FmtString(ctx.wizard.state.broadcast?.text?.value, ctx.wizard.state.broadcast?.text?.entities)
          const users = await Slices.user.crud.gets()
          ctx.deleteMessage()
          try {
            for (const user of users.list) {
              try {
                if (ctx.wizard.state.broadcast?.forward) {
                  await ctx.forwardMessage(user.chat_id, {from_chat_id: ctx.wizard.state.broadcast?.forward.chat, message_id: ctx.wizard.state.broadcast?.forward.message })
                } else if (ctx.wizard.state.broadcast?.text) {
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
      }
    } catch (e) {
      console.error(new HandlerError(400, 'Ошибка: Меню Запуска рассылки сообщений', e))
    }
    
    return await done();
  },
);