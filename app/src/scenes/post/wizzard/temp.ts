import { Markup } from 'telegraf';
import { bold, fmt, FmtString, italic, quote, underline } from 'telegraf/format';
import postController from '../../../controllers/post-controller';
import { HandlerError } from '../../../exceptions/api-error';
import { CallbackQueryWrapper } from '../../../helpers/callback-wrapper';
import { composeWizardScene } from '../../../helpers/compose-wizard-scene';
import { formatText } from '../../../helpers/post-template/format-text';
import send from '../../../helpers/send';
import { adminUsers } from '../../../routes/admin-routes';
import types from './types';

const nextSceneHandler = CallbackQueryWrapper.nextSceneHandler()

export const createCreatePostTemplateScene = composeWizardScene(
  async (ctx) => {
    try {
      const chat_id = ctx.chat.id
      
      ctx.wizard.state.post_template_create = {
        ...ctx.wizard.state?.post_template_create
      }
      
      const admin = adminUsers.includes(chat_id)
      
      const markup = Markup.inlineKeyboard(
        [
          Markup.button.callback('Назад в меню', nextSceneHandler.create(types.CREATE), !admin),
        ],{ columns: 2 }
      )
      
      const text = ctx.wizard.state.post_template_create?.template
      const data = ctx.wizard.state.post_template_create?.data
      const entities = ctx.wizard.state.post_template_create?.entities
      
      const formatted = formatText(text, data, entities)
      
      const msg = new FmtString(formatted.text, formatted.entities)
      
      const message = await send(ctx, fmt(
        bold('Шаблон поста'),'\n\n',
        italic('Пример шаблон:'),'\n\n',
        quote(
          'Текст', '\n\n',
          bold(underline('Текст со стилями')), '\n\n',
          fmt('Переменная - {{variable}}'), '\n\n',
          fmt('Переменная со стилями - {{',bold(underline('styled_variable')),'}}')
        ),'\n\n',
        text ? fmt(italic('Текущий шаблон:'),'\n\n',
          quote(fmt(msg)),'\n\n') : '',
        italic('Введите текст шаблон:')
      ), markup)
      //@ts-ignore
      ctx.wizard.state.delete_message_id = message?.message_id
    } catch (e) {
      console.error(new HandlerError(400, 'Ошибка: Создание шаблона поста', e))
    }
    return ctx.wizard.next();
  },
  async (ctx, done) => {
    const chatId = ctx.chat?.id;
    const callback_data = ctx.update?.callback_query?.data;
    const message_text = ctx.message?.text;
    const message_entities = ctx.message.entities
    
    try {
      
      ctx.telegram.editMessageReplyMarkup(chatId, ctx.wizard.state.delete_message_id, undefined, undefined)
      
      if (callback_data) {
        nextSceneHandler.on(callback_data, async (value) => {
          ctx.wizard.state.nextScene = value;
        })
      } else {
        ctx.wizard.state.post_template_create = {
          template: undefined,
          entities: undefined,
          data: undefined,
        }
        const reg = new RegExp(`{{([^}]+)}}`, 'g')
        const values = message_text.match(reg)?.map((value) => ({name: value.substring(2, value.length - 2)}))
        
        if (message_text) ctx.wizard.state.post_template_create.template = message_text
        if (message_text) ctx.wizard.state.post_template_create.entities = message_entities
        if (values) ctx.wizard.state.post_template_create.data = values
        
        ctx.wizard.state.nextScene = types.CREATE;
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