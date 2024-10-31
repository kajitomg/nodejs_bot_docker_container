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

interface PostTemplateListProps {
}

export const createListPostScene = composeWizardScene<PostTemplateListProps>(
  async (ctx) => {
    try {
      const chat_id = ctx.chat.id
      
      const admin = adminUsers.includes(chat_id)
      const posts = (await postController.getPosts({
        type: PostTypes.TEMPLATE
      })).items
      
      const markup = Markup.inlineKeyboard(
        [
          ...posts.map((post) => Markup.button.callback(`${post.name}`, goToChannelHandler.create(post.id), !admin)),
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
    const callback_data = ctx.callbackQuery?.['data'];
    
    try {
      if (callback_data) {
        await nextSceneHandler.on(callback_data, async (value) => {
          await done(value);
        })
        await goToChannelHandler.on(callback_data, async (value) => {
          await done(types.TEMPLATE_ITEM, {
            post_id: value
          });
        })
      }  else {
        await ctx.sendMessage('Вы вышли из сцены Список шаблонов постов')
        await done();
      }
    } catch (e) {
      console.error(new HandlerError(400, 'Ошибка: Список шаблонов постов', e))
    }
    return;
  },
);