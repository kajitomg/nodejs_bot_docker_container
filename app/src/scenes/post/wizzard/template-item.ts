import { Markup } from 'telegraf';
import { bold, fmt, FmtString, quote } from 'telegraf/format';
import postController from '../../../controllers/post-controller';
import { HandlerError } from '../../../exceptions/api-error';
import { CallbackQueryWrapper } from '../../../helpers/callback-wrapper';
import { composeWizardScene } from '../../../helpers/compose-wizard-scene';
import { formatText } from '../../../helpers/post-template/format-text';
import send from '../../../helpers/send';
import { Post } from '../../../models/post/post-model';
import { adminUsers } from '../../../routes/admin-routes';
import types from './types';

const nextSceneHandler = CallbackQueryWrapper.nextSceneHandler()

interface PostTemplateItemProps {
  post_id: number,
  post?: Post
}

export const createPostTemplateItemScene = composeWizardScene<PostTemplateItemProps>(
  async (ctx) => {
    try {
      const chat_id = ctx.chat.id
      
      const admin = adminUsers.includes(chat_id)
      
      const post = (await postController.getPost({
        id: ctx.scene.session.props.post_id
      })).item
      ctx.scene.session.props.post = post
      
      const markup = Markup.inlineKeyboard(
        [
          Markup.button.callback('Изменить название', nextSceneHandler.create(types.TEMPLATE_CREATE), !admin),
          Markup.button.callback('Изменить шаблон', nextSceneHandler.create(types.TEMPLATE_CREATE), !admin),
          Markup.button.callback('Назад в меню', 'back', !admin),
        ],{ columns: 2 }
      )
      
      const formatted = formatText(post.template, post.data, post.entities)
      
      const msg = new FmtString(formatted.text, formatted.entities)
      
      await send(ctx, fmt(
        bold('Меню Шаблона поста'),'\n\n',
        bold(`Название: ${post.name}`),'\n\n',
        quote(fmt(msg)),
      ), markup)
    } catch (e) {
      console.error(new HandlerError(400, 'Ошибка: Меню Шаблон поста', e))
    }
    return ctx.wizard.next();
  },
  async (ctx, done, back) => {
    const callback_query = ctx.callbackQuery?.['data'];
    
    try {
      if (callback_query) {
        if (callback_query === 'back') {
          await back()
        }
        await nextSceneHandler.on(callback_query, async (value) => {
          await done(value);
        })
      }  else {
        await ctx.sendMessage('Вы вышли из Меню Шаблон поста')
        await done();
      }
    } catch (e) {
      console.error(new HandlerError(400, 'Ошибка: Меню Шаблон поста', e))
    }
    return;
  },
);