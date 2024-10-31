import { Markup } from 'telegraf';
import { bold, fmt, italic } from 'telegraf/format';
import postController from '../../../controllers/post-controller';
import { composeWizardScene } from '../../../helpers/compose-wizard-scene';
import { genMessage } from '../../../helpers/create-message-sample';
import getRandomId from '../../../helpers/get-random-id';
import send from '../../../helpers/send';
import sendMessage from '../../../helpers/send-message';
import { MediaTypes, PostMedia } from '../../../models/post/post-model';
import types from './types';

interface PostMediaPhotoCreateProps {
  post_id: number
  media?: Partial<PostMedia>,
}

export const createCreatePhotoPostTemplateScene = composeWizardScene<PostMediaPhotoCreateProps>(
  async (ctx) => {
    if (!ctx.scene.session.props.media) ctx.scene.session.props.media = { type: MediaTypes.PHOTO }
    
    const markup = Markup.inlineKeyboard(
      [
        Markup.button.callback('Назад', 'back'),
      ],{ columns: 2 }
    )
    
    const text = genMessage({
      header: genMessage({
        header: bold('Шаблон поста Медиа'),
        body: fmt(fmt(`- Название: `), bold(ctx.scene.session.props.media?.name ? ctx.scene.session.props.media?.name : '-')),
      }),
      body: italic('Отправьте фотографию:'),
    })
    
    await sendMessage(ctx, {
      text,
      extra: markup
    })
    
    return ctx.wizard.next();
  },
  async (ctx, done, back) => {
    const callback_data = ctx.callbackQuery?.['data'];
    const message_photo = ctx.message['photo'];
    
    await sendMessage(ctx, {}, {clear_markup: true})
    
    if (callback_data) {
      if (callback_data === 'back') {
        await back()
      }
    } else {
      if(message_photo) {
        ctx.scene.session.props.media.id = message_photo[0].file_id
        ctx.wizard.next();
        return ctx.wizard['steps'][ctx.wizard.cursor](ctx);
      } else {
        await send(ctx, 'Вы прислали не фото')
        await back(types.CREATE_PHOTO);
      }
    }
    
    return;
  },
  async (ctx) => {
    const markup = Markup.inlineKeyboard(
      [
        Markup.button.callback('Создать', 'create'),
        Markup.button.callback('Назад', 'back'),
      ],{ columns: 2 }
    )
    
    const text = genMessage({
      header: genMessage({
        header: bold('Шаблон поста Медиа'),
        body: fmt(fmt(`- Название: `), bold(ctx.scene.session.props.media?.name || '-')),
      }),
      body: italic('Отправьте название для фотографии:'),
    })
    
    await sendMessage(ctx, {
      text,
      extra: markup,
      media: {
        type: 'photo',
        file_id: ctx.scene.session.props.media.id
      }
    })
    
    return ctx.wizard.next();
  },
  async (ctx, done, back) => {
    const callback_data = ctx.callbackQuery?.['data'];
    const message_text = ctx.message?.['text'];
    
    if (callback_data) {
      if (callback_data === 'back') {
        await back()
      }
      if(callback_data === 'create') {
        const post = (await postController.getPost({
          id: ctx.scene.session.props.post_id
        })).item;
        
        ctx.scene.session.props.media.name = `Фотография ${getRandomId()}`
        await postController.updatePost({
          id: ctx.scene.session.props.post_id,
          media: [
            ...(post?.media || []),
            ctx.scene.session.props.media
          ]
        })
        await back(types.MEDIA_LIST, {
          post_id: ctx.scene.session.props.post_id
        });
      }
    } else {
      if(message_text) {
        ctx.scene.session.props.media.name = message_text
        const post = (await postController.getPost({
          id: ctx.scene.session.props.post_id
        })).item;
        
        await postController.updatePost({
          id: ctx.scene.session.props.post_id,
          media: [
            ...post?.media,
            ctx.scene.session.props.media
          ]
        })
        await back(types.MEDIA_LIST, {
          post_id: ctx.scene.session.props.post_id
        });
      }
    }
    
    return;
  },
);