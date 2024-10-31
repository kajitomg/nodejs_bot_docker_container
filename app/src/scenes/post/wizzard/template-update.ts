import { Markup } from 'telegraf';
import { bold, fmt, FmtString, italic, quote, underline } from 'telegraf/format';
import { HandlerError } from '../../../exceptions/api-error';
import { CallbackQueryWrapper } from '../../../helpers/callback-wrapper';
import { composeWizardScene } from '../../../helpers/compose-wizard-scene';
import { formatText } from '../../../helpers/post-template/format-text';
import sendMessage from '../../../helpers/send-message';
import types from './types';

const nextSceneHandler = CallbackQueryWrapper.nextSceneHandler()

interface PostTemplateUpdateProps {
}
/*
export const createWizardPostTemplateUpdate = composeWizardScene<PostTemplateUpdateProps>(
  async (ctx) => {
    if (!ctx.wizard.state.post_template) ctx.wizard.state.post_template = {}
    
    try {
      const markup = Markup.inlineKeyboard(
        [
          Markup.button.callback('Назад в меню', 'back'),
        ],{ columns: 2 }
      )
      
      const formatted = formatText(
        ctx.wizard.state.post_template?.template,
        ctx.wizard.state.post_template?.data,
        ctx.wizard.state.post_template?.entities
      )
      
      const fmtString = new FmtString(formatted.text, formatted.entities)
      
      await sendMessage(
        ctx,{
          text:
            fmt(
              bold('Шаблон поста'),'\n\n',
              italic('Пример шаблон:'),'\n\n',
              quote(
                'Текст', '\n\n',
                bold(underline('Текст со стилями')), '\n\n',
                fmt('Переменная - {{variable}}'), '\n\n',
                fmt('Переменная со стилями - {{',bold(underline('styled_variable')),'}}')
              ),'\n\n',
              ctx.wizard.state.post_template?.template ? fmt(italic('Текущий шаблон:'),'\n\n',
                quote(fmt(fmtString)),'\n\n') : '',
              italic('Введите текст шаблон:')
            ),
          extra: markup
        })
    } catch (e) {
      console.error(new HandlerError(400, 'Ошибка: Сцена создания шаблона поста', e))
    }
  },
  async (ctx, done, back) => {
    const callback_data = ctx.callbackQuery?.['data'];
    const message_text = ctx.message?.['text'];
    const message_entities = ctx.message?.['entities']
    
    try {
      await sendMessage(ctx, {}, {clear_markup: true})
      
      if (callback_data) {
        if( callback_data === 'back' ) {
          await back();
        }
      } else {
        const reg = new RegExp(`{{([^}]+)}}`, 'g')
        const variables = message_text.match(reg)?.map((value) => ({name: value.substring(2, value.length - 2)}))
        
        if (message_text) ctx.wizard.state.post_template.template = message_text
        if (message_text) ctx.wizard.state.post_template.entities = message_entities
        if (variables) ctx.wizard.state.post_template.variables = variables
        
        if (!ctx.wizard.state.post_template.name) {
          ctx.wizard.state.nextScene = types.NAME_UPDATE;
        } else {
          ctx.wizard.state.nextScene = types.TEMPLATE_ITEM;
        }
      }
    } catch (e) {
      console.error(new HandlerError(400, 'Ошибка: Создание шаблона поста', e))
    }
    return;
  },
)*/