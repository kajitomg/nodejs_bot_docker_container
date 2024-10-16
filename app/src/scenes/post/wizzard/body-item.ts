import { Markup } from 'telegraf';
import { bold, fmt, FmtString, italic, quote, underline } from 'telegraf/format';
import postController from '../../../controllers/post-controller';
import { HandlerError } from '../../../exceptions/api-error';
import { CallbackQueryWrapper } from '../../../helpers/callback-wrapper';
import { composeWizardScene } from '../../../helpers/compose-wizard-scene';
import { formatText } from '../../../helpers/post-template/format-text';
import sendMessage from '../../../helpers/send-message';
import { isAdmin } from '../../../routes/admin-routes';
import Slices from '../../../slices';
import { ScenesTypes } from '../../index';
import types from './types';

const nextSceneHandler = CallbackQueryWrapper.nextSceneHandler()
const createPostHandler = new CallbackQueryWrapper('create_post')

export const createWizardPostBodyItem = composeWizardScene(
  async (ctx) => {
    const chat_id = ctx.chat.id
    const admin = isAdmin(chat_id)

    const post = (await postController.getPost({
      id: ctx.wizard.state.body_id
    })).item
    
    try {
      const markup = Markup.inlineKeyboard(
        [
          Markup.button.callback('Изменить название', nextSceneHandler.create(types.NAME_UPDATE), !admin),
          Markup.button.callback('Список переменных', nextSceneHandler.create(types.VARIABLES_LIST), !admin || !post.variables),
          Markup.button.callback('Список медиа', nextSceneHandler.create(types.MEDIA_LIST), !admin),
          Markup.button.callback('Закрепить пост', 'create', !admin),
          Markup.button.callback('Назад в меню', nextSceneHandler.create(ScenesTypes.activity.wizard.ITEM)),
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
  async (ctx, done) => {
    const callback_data = ctx.update?.callback_query?.data;
    
    try {
      if (callback_data) {
        nextSceneHandler.on(callback_data, async (value) => {
          ctx.wizard.state.nextScene = value;
        })
        if(callback_data === 'create') {
          const activity = await Slices.activity.crud.get({
            data: {
              id: ctx.wizard.state.activity_id,
            }
          })
          const body = await postController.getPost({
            id: activity.item.body_id
          })
          const post = await postController.createPost({
            name: body.item.name,
            media: body.item.media,
            entities: body.item.entities,
            variables: body.item.variables,
            template: body.item.template,
          })
          await Slices.activity.crud.update({
            data: {
              id: ctx.wizard.state.activity_id,
              post_id: post.item.id
            }
          })
          if (activity.item.post_id) {
            await postController.deletePost({
              id: activity.item.post_id
            })
          }
          ctx.wizard.state.nextScene = ScenesTypes.activity.wizard.ITEM;
        }
      } else {
        await ctx.sendMessage('Вы вышли из сцены Тело поста')
      }
      if (ctx.wizard.state.warning) {
        delete ctx.wizard.state.warning;
      }
    } catch (e) {
      console.error(new HandlerError(400, 'Ошибка: Создание шаблона поста', e))
    }
    return done();
  },
  /* async (ctx) => {
     try {
       await postController.createTemplate({
         name: 'Test',
         template: ctx.wizard.state.post_template_create.template,
         entities: ctx.wizard.state.post_template_create.entities,
         data: ctx.wizard.state.post_template_create.data,
       })
       
       const markup = Markup.inlineKeyboard(
         [
           Markup.button.callback('Создать новый шаблон', nextSceneHandler.create(types.CREATE)),
           Markup.button.callback('Назад в меню', nextSceneHandler.create(types.ENTRY)),
         ],{ columns: 2 }
       )
       await send(ctx,
         fmt(
           bold('Меню Создание шаблона поста'),'\n\n',
           italic('Шаблон успешно создан!','\n\n',
           ))
         , markup)
       
     } catch (e) {
       console.error(new HandlerError(400, 'Ошибка: Создание шаблона поста', e))
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
       } else {
         await ctx.sendMessage('Вы вышли из сцены Создание шаблона поста')
       }
       
     } catch (e) {
       console.error(new HandlerError(400, 'Ошибка: Создание канала ОП', e))
     }
     return done();
   },*/
);