import { Markup } from 'telegraf';
import { bold, fmt, italic } from 'telegraf/format';
import { HandlerError } from '../../../exceptions/api-error';
import { CallbackQueryWrapper } from '../../../helpers/callback-wrapper';
import { composeWizardScene } from '../../../helpers/compose-wizard-scene';
import sendMessage from '../../../helpers/send-message';
import { Languages } from '../../../models/user/user-model';
import Slices from '../../../slices';
import types from './types';

export const createChangeLanguageEntryScene = composeWizardScene(
  async (ctx) => {
    try {
      const markup = Markup.inlineKeyboard(
        [
          Markup.button.callback(ctx.i18n.t('change_language.buttons.ru'), `${Languages.ru}`),
          Markup.button.callback(ctx.i18n.t('change_language.buttons.en'), `${Languages.en}`),
          Markup.button.callback(ctx.i18n.t('change_language.buttons.back'), 'back'),
        ],{ columns: 2 }
      )
      await sendMessage(ctx, {
        text: fmt(bold(ctx.i18n.t('change_language.name')),'\n\n',italic(ctx.i18n.t('change_language.data.choose_language'))),
        extra: markup
      })
      
    } catch (e) {
      console.error(new HandlerError(400, 'Ошибка: Выбор языка', e))
    }
    return ctx.wizard.next();
  },
  async (ctx, done, back) => {
    const author = ctx.from
    const chat_id = ctx.chat.id
    const callback_data = ctx.callbackQuery?.['data'];
    
    try {
      if (callback_data) {
        if ( callback_data === 'back' ) {
          await back()
        }
        
        if ( Languages.hasOwnProperty(callback_data)) {
          if (Languages[callback_data] !== ctx.session.props.language) {
            ctx.session.props.language = Languages[callback_data] as keyof typeof Languages
            
            await Slices.user.crud.create({ chat_id, username: author.username, first_name: author.first_name })
            
            await Slices.user.crud.update({ chat_id, language: callback_data, username: author.username, firstName: author.first_name  })
          }
          await done(types.ENTRY)
        }
      } else {
        await ctx.sendMessage(ctx.i18n.t('change_language.exit', { menu_name: ctx.i18n.t('change_language.name') }))
        await done();
      }
      
    } catch (e) {
      console.error(new HandlerError(400, 'Ошибка: Выбор языка', e))
    }
    return
  },
);
