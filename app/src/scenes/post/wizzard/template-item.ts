import { Markup } from 'telegraf';
import { bold, fmt, FmtString, italic, quote } from 'telegraf/format';
import mandatoryChannelController from '../../../controllers/mandatory-channel-controller';
import postController from '../../../controllers/post-controller';
import { HandlerError } from '../../../exceptions/api-error';
import { CallbackQueryWrapper } from '../../../helpers/callback-wrapper';
import { composeWizardScene } from '../../../helpers/compose-wizard-scene';
import { formatText } from '../../../helpers/post-template/format-text';
import send from '../../../helpers/send';
import { adminUsers } from '../../../routes/admin-routes';
import types from './types';

const updateChannelHandler = new CallbackQueryWrapper('update_channel')
const nextSceneHandler = CallbackQueryWrapper.nextSceneHandler()

export const createPostTemplateItemScene = composeWizardScene(
  async (ctx) => {
    try {
      const chat_id = ctx.chat.id
      
      const admin = adminUsers.includes(chat_id)
      const item = await postController.getPost({
        id: ctx.wizard.state?.post_template_item?.id
      })
      const markup = Markup.inlineKeyboard(
        [
          Markup.button.callback('Изменить название', nextSceneHandler.create(types.TEMPLATE_CREATE), !admin),
          Markup.button.callback('Изменить шаблон', nextSceneHandler.create(types.TEMPLATE_CREATE), !admin),
          Markup.button.callback('Назад в меню', nextSceneHandler.create(types.LIST), !admin),
        ],{ columns: 2 }
      )
      
      const formatted = formatText(item.item.template, item.item.data, item.item.entities)
      
      const msg = new FmtString(formatted.text, formatted.entities)
      
      await send(ctx, fmt(
        bold('Меню Шаблона поста'),'\n\n',
        bold(`Название: ${item.item.name}`),'\n\n',
        quote(fmt(msg)),
      ), markup)
    } catch (e) {
      console.error(new HandlerError(400, 'Ошибка: Меню Шаблон поста', e))
    }
    return ctx.wizard.next();
  },
  async (ctx, done) => {
    const callback_query = ctx.update?.callback_query?.data;
    
    try {
      if (callback_query) {
        await nextSceneHandler.on(callback_query, async (value) => {
          ctx.wizard.state.nextScene = value;
        })
      }  else {
        await ctx.sendMessage('Вы вышли из Меню Шаблон поста')
      }
    } catch (e) {
      console.error(new HandlerError(400, 'Ошибка: Меню Шаблон поста', e))
    }
    return done();
  },
);