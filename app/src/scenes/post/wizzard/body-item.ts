import { Markup } from 'telegraf';
import { bold, fmt, FmtString, italic, quote } from 'telegraf/format';
import activityController from '../../../controllers/activity-controller';
import postController from '../../../controllers/post-controller';
import { HandlerError } from '../../../exceptions/api-error';
import { CallbackQueryWrapper } from '../../../helpers/callback-wrapper';
import { composeWizardScene } from '../../../helpers/compose-wizard-scene';
import { formatText } from '../../../helpers/post-template/format-text';
import sendMessage from '../../../helpers/send-message';
import { Post } from '../../../models/post/post-model';
import { isAdmin } from '../../../routes/admin-routes';
import types from './types';

const nextSceneHandler = CallbackQueryWrapper.nextSceneHandler()

interface BodyItemProps {
  post_id: number,
  activity_id?: number,
  post?: Post
}

export const createWizardPostBodyItem = composeWizardScene<BodyItemProps>(
  async (ctx) => {
    const {
      post_id
    } = ctx.scene.session?.props
    
    const chat_id = ctx.chat.id
    const admin = isAdmin(chat_id)

    const post = (await postController.getPost({
      id: post_id
    })).item
    ctx.scene.session.props.post = post
    
    try {
      const markup = Markup.inlineKeyboard(
        [
          Markup.button.callback('Изменить название', nextSceneHandler.create(types.NAME_UPDATE), !admin),
          Markup.button.callback('Список переменных', nextSceneHandler.create(types.VARIABLES_LIST), !admin || !post.variables),
          Markup.button.callback('Список медиа', nextSceneHandler.create(types.MEDIA_LIST), !admin),
          Markup.button.callback('Закрепить пост', 'create', !admin),
          Markup.button.callback('Назад в меню', 'back'),
        ],{ columns: 2 }
      )
      
      const formatted = formatText(
        post?.template,
        post?.variables,
        post?.entities
      )
      
      const fmtString = new FmtString(formatted.text, formatted.entities)
      
      await sendMessage(
        ctx,{
          text: fmt(
            bold('Шаблон поста'),'\n\n',
            bold(`Название${!post?.name ? '*' : ''}: ${post?.name || '-'}`),'\n\n',
            quote(fmt(fmtString)),'\n\n',
            italic('Выберите интересующее вас действие:')
          ),
          ...(post?.media?.[0] ? {
            media: {
              type: post.media[(post.media?.length - 1) || 0].type,
              file_id: post.media[(post.media?.length - 1) || 0].id
            }} : {}),
          extra: markup
        }, {clear_media: true})
      
    } catch (e) {
      console.error(new HandlerError(400, 'Ошибка: Шаблон поста', e))
    }
    return ctx.wizard.next();
  },
  async (ctx, done, back) => {
    const {
      post_id,
      activity_id
    } = ctx.scene.session.props
    const callback_data = ctx.callbackQuery?.['data']
    
    try {
      if (callback_data) {
        if (callback_data === 'back') {
          await back()
        }
        await nextSceneHandler.on(callback_data, async (value) => {
          await done(value, {
            post_id
          })
        })
        if(callback_data === 'create') {
          const newPost = await postController.createPost({
            body_id: post_id
          })
          await activityController.updateActivity({
            id: activity_id,
            post_id: newPost.item.id
          })
          await back();
        }
      } else {
        await ctx.sendMessage('Вы вышли из сцены Тело поста')
        await done();
      }
    } catch (e) {
      console.error(new HandlerError(400, 'Ошибка: Создание шаблона поста', e))
    }
    return;
  },
);