import { Markup } from 'telegraf';
import { bold, fmt, italic } from 'telegraf/format';
import postController from '../../../controllers/post-controller';
import { CallbackQueryWrapper } from '../../../helpers/callback-wrapper';
import { composeWizardScene } from '../../../helpers/compose-wizard-scene';
import { genMessage } from '../../../helpers/create-message-sample';
import getRandomId from '../../../helpers/get-random-id';
import send from '../../../helpers/send';
import { MediaTypes } from '../../../models/post/post-model';
import { Languages } from '../../../models/user/user-model';
import Slices from '../../../slices';
import types from './types';

const nextSceneHandler = CallbackQueryWrapper.nextSceneHandler()

export const createCreatePhotoPostTemplateScene = composeWizardScene(
  async (ctx) => {
    ctx.wizard.state.media = {
      type: MediaTypes.PHOTO,
      name: undefined,
      id: undefined,
    }
    
    const chat_id = ctx.chat.id
    let language = ctx.scene.state?.options?.language
    
    if(!language) {
      const user = await Slices.user.crud.get({ chat_id })
      language = Languages?.[user.item?.language] || 'ru'
    }
    
    if (ctx.wizard.state.options) {
      ctx.wizard.state.options.language = language
    } else {
      ctx.wizard.state.options = {
        language
      }
    }
    ctx.i18n.locale(language)
    
    const markup = Markup.inlineKeyboard(
      [
        Markup.button.callback('Назад', nextSceneHandler.create(types.MEDIA_LIST)),
      ],{ columns: 2 }
    )
    
    const text = genMessage({
      header: genMessage({
        header: bold('Шаблон поста Медиа'),
        body: fmt(fmt(`- Название: `), bold(ctx.wizard.state.media?.name ? ctx.wizard.state.media?.name : '-')),
      }),
      body: italic('Отправьте фотографию:'),
    })
    
    const message = await send(ctx, text, { parse_mode: 'MarkdownV2', reply_markup: markup.reply_markup })
    //@ts-ignore
    ctx.wizard.state.delete_message_id = message?.message_id
    return ctx.wizard.next();
  },
  async (ctx, done) => {
    const chatId = ctx.chat?.id;
    const callback_data = ctx.update?.callback_query?.data;
    const message = ctx.message;

    ctx.i18n.locale(ctx.scene.state?.options?.language)
    
    ctx.telegram.editMessageReplyMarkup(chatId, ctx.wizard.state.delete_message_id, undefined, undefined)
    
    if (callback_data) {
      nextSceneHandler.on(callback_data, async (value) => {
        ctx.wizard.state.nextScene = value;
      })
    } else {
      if(message.photo) {
        ctx.wizard.state.media = {
          ...ctx.wizard.state.media,
          id: message.photo[0].file_id,
        }
        ctx.wizard.next();
        return ctx.wizard.steps[ctx.wizard.cursor](ctx);
      } else {
        await send(ctx, 'Вы прислали не фото')
        ctx.wizard.state.nextScene = types.CREATE_PHOTO;
      }
    }
    
    if (ctx.wizard.state.warning) {
      delete ctx.wizard.state.warning;
    }
    
    return done();
  },
  async (ctx) => {
    
    ctx.i18n.locale(ctx.scene.state?.options?.language)
    
    const markup = Markup.inlineKeyboard(
      [
        Markup.button.callback('Создать', 'create'),
        Markup.button.callback('Назад', nextSceneHandler.create(types.MEDIA_LIST)),
      ],{ columns: 2 }
    )
    
    const text = genMessage({
      header: genMessage({
        header: bold('Шаблон поста Медиа'),
        body: fmt(fmt(`- Название: `), bold(ctx.wizard.state.media?.name || '-')),
      }),
      body: italic('Отправьте название для фотографии:'),
    })
    ctx.sendPhoto(ctx.wizard.state.media.id, {
      caption: text,
      reply_markup: markup.reply_markup
    })
    
    return ctx.wizard.next();
  },
  async (ctx, done) => {
    const callback_data = ctx.update?.callback_query?.data;
    const message = ctx.message;
    
    ctx.i18n.locale(ctx.scene.state?.options?.language)
    
    if (callback_data) {
      nextSceneHandler.on(callback_data, async (value) => {
        ctx.wizard.state.nextScene = value;
      })
      if(callback_data === 'create') {
        const post = await postController.getPost({
          id: ctx.wizard.state.body_id
        })
        
        ctx.wizard.state.media = {
          ...ctx.wizard.state.media,
          name: `Фотография ${getRandomId()}`,
        }
        await postController.updatePost({
          id: ctx.wizard.state.body_id,
          media: [
            ...(post.item?.media || []),
            ctx.wizard.state.media
          ]
        })
        ctx.wizard.state.nextScene = types.MEDIA_LIST;
      }
    } else {
      if(message.text) {
        ctx.wizard.state.media = {
          ...ctx.wizard.state.media,
          name: message.text,
        }
        const post = await postController.getPost({
          id: ctx.wizard.state.body_id
        })
        await postController.updatePost({
          id: ctx.wizard.state.body_id,
          media: [
            ...post.item.media,
            ctx.wizard.state.media
          ]
        })
        ctx.wizard.state.nextScene = types.MEDIA_LIST;
      }
    }
    
    if (ctx.wizard.state.warning) {
      delete ctx.wizard.state.warning;
    }
    
    return done();
  },
);