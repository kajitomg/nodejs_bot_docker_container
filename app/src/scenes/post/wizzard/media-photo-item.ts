import { Markup } from 'telegraf';
import { bold, fmt} from 'telegraf/format';
import postController from '../../../controllers/post-controller';
import { HandlerError } from '../../../exceptions/api-error';
import { composeWizardScene } from '../../../helpers/compose-wizard-scene';
import sendMessage from '../../../helpers/send-message';
import { Post } from '../../../models/post/post-model';
import { isAdmin } from '../../../routes/admin-routes';
import types from './types';

interface PostMediaPhotoItemProps {
  media_index: number,
  post_id: number,
  post?: Post
}

export const createWizardPostMediaPhotoItem = composeWizardScene<PostMediaPhotoItemProps>(
  async (ctx) => {
    try {
      const chat_id = ctx.chat.id
      
      const admin = isAdmin(chat_id)
      
      const post = (await postController.getPost({
        id: ctx.scene.session.props.post_id
      })).item
      ctx.scene.session.props.post = post
      
      const markup = Markup.inlineKeyboard(
        [
          Markup.button.callback('Удалить фото', 'delete', !admin),
          Markup.button.callback('Назад в меню', 'back', !admin),
        ],{ columns: 1 }
      )
      await sendMessage(ctx, {
        text: fmt(
          bold('Меню Список медиа поста'),'\n\n',
          fmt(`Название: `, bold(post.media[ctx.scene.session.props.media_index]?.name || '-')),
        ),
        media: {
          type: post.media[ctx.scene.session.props.media_index].type,
          file_id: post.media[ctx.scene.session.props.media_index].id
        },
        extra: markup
      })
    } catch (e) {
      console.error(new HandlerError(400, 'Ошибка: Список медиа поста', e))
    }
    return ctx.wizard.next();
  },
  async (ctx, done, back) => {
    const callback_data = ctx.callbackQuery?.['data'];
    const post = ctx.scene.session.props.post
    
    try {
      if (callback_data) {
        if (callback_data === 'back') {
          await back();
        }
        if (callback_data === 'delete') {
          post.media.splice(ctx.scene.session.props.media_index, 1)
          await postController.updatePost({
            id: post.id,
            media: post.media
          })
          await back(types.MEDIA_LIST)
        }
      }  else {
        await ctx.sendMessage('Вы вышли из сцены Список медиа поста');
        await done();
      }
    } catch (e) {
      console.error(new HandlerError(400, 'Ошибка: Список медиа поста', e))
    }
    return;
  },
);