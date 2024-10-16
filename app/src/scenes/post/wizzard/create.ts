import { Markup } from 'telegraf';
import { bold, fmt, FmtString, italic, quote } from 'telegraf/format';
import postController from '../../../controllers/post-controller';
import { HandlerError } from '../../../exceptions/api-error';
import { CallbackQueryWrapper } from '../../../helpers/callback-wrapper';
import { composeWizardScene } from '../../../helpers/compose-wizard-scene';
import { formatText } from '../../../helpers/post-template/format-text';
import send from '../../../helpers/send';
import sendTest from '../../../helpers/send-message';
import { adminUsers } from '../../../routes/admin-routes';
import types from './types';

const nextSceneHandler = CallbackQueryWrapper.nextSceneHandler()

export const createCreatePostScene = composeWizardScene(
  async (ctx) => {
    try {
      const chat_id = ctx.chat.id
      
      const admin = adminUsers.includes(chat_id)
      const markup = Markup.inlineKeyboard(
        [
          Markup.button.callback('Изменить название', nextSceneHandler.create(types.NAME_UPDATE), !admin),
          Markup.button.callback('Изменить шаблон', nextSceneHandler.create(types.TEMPLATE_CREATE), !admin),
          //Markup.button.callback('Список переменных', nextSceneHandler.create(types.DATA_LIST), !admin || !ctx.wizard.state.post_template_create?.data),
          //Markup.button.callback('Список медиа', nextSceneHandler.create(types.MEDIA_LIST), !admin),
          Markup.button.callback('Создать шаблон', 'create', !admin),
          Markup.button.callback('Назад в меню', nextSceneHandler.create(types.ENTRY), !admin),
        ],{ columns: 2 }
      )
      const text = ctx.wizard.state.post_template_create?.template
      const variables = ctx.wizard.state.post_template_create?.variables
      const entities = ctx.wizard.state.post_template_create?.entities
      
      const formatted = formatText(text, variables, entities)
      
      const msg = new FmtString(formatted.text, formatted.entities)
      
      await sendTest(ctx, {
        text: fmt(
          bold('Меню Шаблона поста'),'\n\n',
          bold(`Название${!ctx.wizard.state.post_template_create?.name ? '*' : ''}: ${ctx.wizard.state.post_template_create?.name || '-'}`),'\n\n',
          quote(fmt(msg)),'\n\n',
          ctx.wizard.state.post_template_create?.warning ? fmt(italic(ctx.wizard.state.post_template_create?.warning),'\n\n') : '',
          italic('Выберите интересующее вас действие:')
        ),
        extra: markup
      }, { clear_media: true })
      
    } catch (e) {
      console.error(new HandlerError(400, 'Ошибка: Создание поста', e))
    }
    delete ctx.wizard.state.post_template_create?.warning
    return ctx.wizard.next();
  },
  async (ctx, done) => {
    const callback_data = ctx.update?.callback_query?.data;
    
    try {
      if (callback_data) {
        nextSceneHandler.on(callback_data, async (value) => {
          ctx.wizard.state.nextScene = value;
        })
        if (callback_data === 'create') {
          if ( ctx.wizard.state.post_template_create?.template && ctx.wizard.state.post_template_create.name ) {
            ctx.wizard.next();
            return ctx.wizard.steps[ctx.wizard.cursor](ctx);
          } else {
            ctx.wizard.state.post_template_create.warning = 'Заполните все обязательные поля*';
            ctx.wizard.state.nextScene = types.CREATE;
          }
        }
      } else {
        delete ctx.wizard.state.post_template_create
        await ctx.sendMessage('Вы вышли из сцены Создание шаблона')
      }
      
    } catch (e) {
      console.error(new HandlerError(400, 'Ошибка: Создание шаблона', e))
    }
    return done();
  },
  async (ctx) => {
    try {
      
      await postController.createTemplate({
        name: ctx.wizard.state.post_template_create.name,
        template: ctx.wizard.state.post_template_create.template,
        entities: ctx.wizard.state.post_template_create.entities,
      })
      
      const markup = Markup.inlineKeyboard(
        [
          Markup.button.callback('Создать новый шаблон', nextSceneHandler.create(types.TEMPLATE_CREATE)),
          Markup.button.callback('Назад в меню', nextSceneHandler.create(types.ENTRY)),
        ],{ columns: 2 }
      )
      const text = ctx.wizard.state.post_template_create?.template
      const data = ctx.wizard.state.post_template_create?.data
      const entities = ctx.wizard.state.post_template_create?.entities
      
      const formatted = formatText(text, data, entities)
      
      const msg = new FmtString(formatted.text, formatted.entities)
      
      await send(ctx, fmt(
        bold('Меню Шаблона поста'),'\n\n',
        italic('Шаблон успешно создан!'),'\n\n',
        bold(`Название: ${ctx.wizard.state.post_template_create.name ?? '-'}`),'\n\n',
        quote(fmt(msg)),
      ), markup)
      
    } catch (e) {
      console.error(new HandlerError(400, 'Ошибка: Создание шаблона', e))
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
        await ctx.sendMessage('Вы вышли из сцены Создание шаблона')
      }
      delete ctx.wizard.state.post_template_create
      
    } catch (e) {
      console.error(new HandlerError(400, 'Ошибка: Создание шаблона', e))
    }
    return done();
  },
);