import { Markup } from 'telegraf';
import { bold, fmt, italic, FmtString } from 'telegraf/format';
import { HandlerError } from '../../../exceptions/api-error';
import { composeWizardScene } from '../../../helpers/compose-wizard-scene';
import { createNextScene, getNextScene } from '../../../helpers/next-scene';
import send from '../../../helpers/send';
import { Languages } from '../../../models/user/user-model';
import { adminUsers } from '../../../routes/admin-routes';
import Slices from '../../../slices';
import types from './types';

export const createGetBroadcastScene = composeWizardScene(
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
          Markup.button.callback('Запустить пост', createNextScene(types.START),!admin && !ctx.wizard.state.broadcast?.text && !ctx.wizard.state.broadcast?.forward),
          Markup.button.callback('Сменить пост', createNextScene(types.CREATE), !admin),
          Markup.button.callback('Назад к списку действий', createNextScene(types.ENTRY), !admin)
        ],{ columns: 2 }
      )
      if (ctx.wizard.state.broadcast?.forward) {
        await ctx.forwardMessage(chat_id, {from_chat_id: ctx.wizard.state.broadcast?.forward.chat, message_id: ctx.wizard.state.broadcast?.forward.message })
        await send(ctx, fmt(bold('Текущий пост'),'\n\n',italic('Пересланное сообщение ⬆')),markup)
      } else if (ctx.wizard.state.broadcast?.text) {
        const msg = new FmtString(ctx.wizard.state.broadcast?.text?.value, ctx.wizard.state.broadcast?.text?.entities)
        await send(ctx, fmt(bold('Текущий пост'),'\n\n',ctx.wizard.state.broadcast?.text?.value ? msg : 'Нет поста'),markup)
      } else {
        await send(ctx, fmt(bold('Текущий пост'),'\n\n','Нет поста'),markup)
        
      }
    } catch (e) {
      console.error(new HandlerError(400, 'Ошибка: Меню Рассылки сообщений', e))
    }
    return ctx.wizard.next();
  },
  async (ctx, done) => {
    const sceneId = ctx.update?.callback_query?.data;
    
    try {
      if (sceneId) {
        const nextScene = getNextScene(sceneId)
        if (nextScene) {
          ctx.wizard.state.nextScene = nextScene;
        }
      } else {
        await ctx.sendMessage('Вы вышли из Меню Рассылки сообщений')
      }
    } catch (e) {
      console.error(new HandlerError(400, 'Ошибка: Меню Рассылки сообщений', e))
    }
    
    return done();
  },
);