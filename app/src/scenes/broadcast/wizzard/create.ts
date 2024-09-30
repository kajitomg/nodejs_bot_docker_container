import { Markup } from 'telegraf';
import { bold, fmt } from 'telegraf/format';
import { HandlerError } from '../../../exceptions/api-error';
import { composeWizardScene } from '../../../helpers/compose-wizard-scene';
import { createNextScene, getNextScene } from '../../../helpers/next-scene';
import send from '../../../helpers/send';
import { Languages } from '../../../models/user/user-model';
import Slices from '../../../slices';
import types from './types';

export const createCreateBroadcastScene = composeWizardScene(
  async (ctx) => {
    const chat_id = ctx.chat.id
    let language = ctx.scene.state?.options?.language
    try {
      if(!language) {
        const user = await Slices.user.crud.get({ chat_id })
        language = Languages?.[user.item?.language] || 'ru'
      }
      
      ctx.scene.state = {
        options: {
          language
        }
      }
      ctx.i18n.locale(language)
      const markup = Markup.inlineKeyboard(
        [
          Markup.button.callback('Назад к списку действий', createNextScene(types.ENTRY))
        ],{ columns: 2 }
      )
      await send(ctx, fmt(bold('Введите сообщение:')), markup);
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
        ctx.wizard.state.broadcast = {
          ...(ctx.message?.text && {text: {
              value: ctx.message?.text,
              entities: ctx.message?.entities,
            }}),
          ...(ctx.message?.forward_from_chat && {forward: {
            chat: ctx.message?.forward_from_chat?.id,
            message: ctx.message?.forward_from_message_id
          }})
        }
        ctx.wizard.state.nextScene = types.GET;
      }
    } catch (e) {
      console.error(new HandlerError(400, 'Ошибка: Меню Рассылки сообщений', e))
    }
    
    return done();
  },
);