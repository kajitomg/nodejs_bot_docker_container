import { Markup } from 'telegraf';
import { bold, fmt, italic } from 'telegraf/format';
import postController from '../../../controllers/post-controller';
import { HandlerError } from '../../../exceptions/api-error';
import { CallbackQueryWrapper } from '../../../helpers/callback-wrapper';
import { composeWizardScene } from '../../../helpers/compose-wizard-scene';
import send from '../../../helpers/send';
import { PostTypes } from '../../../models/post/post-model';
import { adminUsers } from '../../../routes/admin-routes';
import types from './types';

const nextSceneHandler = CallbackQueryWrapper.nextSceneHandler()
const goToChannelHandler = CallbackQueryWrapper.goToChannelHandler()

export const createListPostScene = composeWizardScene(
  async (ctx) => {
    try {
      const chat_id = ctx.chat.id
      
      const admin = adminUsers.includes(chat_id)
      const list = await postController.getPosts({
        type: PostTypes.TEMPLATE
      })
      
      const markup = Markup.inlineKeyboard(
        [
          ...list.items.map((post) => Markup.button.callback(`${post.name}`, goToChannelHandler.create(post.id), !admin)),
          Markup.button.callback('Назад в меню', nextSceneHandler.create(types.ENTRY), !admin),
        ],{ columns: 1 }
      )
      await send(ctx, fmt(
        bold('Меню Список шаблонов'),'\n\n',
        italic('Страница: 1/1')
      ), markup)
    } catch (e) {
      console.error(new HandlerError(400, 'Ошибка: Список шаблонов постов', e))
    }
    return ctx.wizard.next();
  },
  async (ctx, done) => {
    const callback_data = ctx.update?.callback_query?.data;
    
    try {
      if (callback_data) {
        nextSceneHandler.on(callback_data, async (value) => {
          ctx.wizard.state.nextScene = value;
        })
        goToChannelHandler.on(callback_data, async (value) => {
          ctx.wizard.state.post_template_item = {
            id: value
          }
          ctx.wizard.state.nextScene = types.TEMPLATE_ITEM;
        })
      }  else {
        await ctx.sendMessage('Вы вышли из сцены Список шаблонов постов')
      }
    } catch (e) {
      console.error(new HandlerError(400, 'Ошибка: Список шаблонов постов', e))
    }
    return done();
  },
);