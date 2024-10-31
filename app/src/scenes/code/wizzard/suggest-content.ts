import { Markup } from 'telegraf';
import { bold, fmt, italic } from 'telegraf/format';
import { composeWizardScene } from '../../../helpers/compose-wizard-scene';
import { genMessage } from '../../../helpers/create-message-sample';
import sendMessage from '../../../helpers/send-message';
import { ICode } from '../../../models/code/code-model';
import { Game } from '../../../models/game';
import types from './types';

interface CodeSuggestContentProps {
  game: Game,
  code: Partial<Pick<ICode, 'name' | 'content'>>,
}

export const createGiveCodeContentScene = composeWizardScene<CodeSuggestContentProps>(
  async (ctx) => {
    const game = ctx.scene.session?.props?.game
    
    const markup = Markup.inlineKeyboard(
      [
        Markup.button.callback(ctx.i18n.t('code_suggest.buttons.back'), 'back'),
      ],{ columns: 2 }
    )
    
    const text = genMessage({
      header: genMessage({
        header: bold(ctx.i18n.t('code_suggest.name',{ game_name: game.name })),
        body: fmt(fmt(`- ${ctx.i18n.t('code_suggest.data.content')}${ctx.scene.session?.props.code.content ? '' : '*'}: `), bold(ctx.scene.session?.props.code.content ? ctx.scene.session?.props.code.content : '-')),
      }),
      body: italic(ctx.i18n.t('code_suggest.data.send_value',{ value: ctx.i18n.t('code_suggest.data.content') })),
    })
    
    await sendMessage(ctx, {
      text,
      extra: markup
    })
    
    return ctx.wizard.next();
  },
  async (ctx, done, back) => {
    const callback_data = ctx.callbackQuery?.['data'];
    const message_text = ctx.message?.['text'];
    
    await sendMessage(ctx, {}, {clear_markup: true})
    
    if (callback_data) {
      if (callback_data === 'back') {
        await back();
      }
    } else {
      ctx.scene.session.props.code.content = message_text
      await done(types.GIVE_CODE, { ...ctx.scene.session.props })
    }
    
    return;
  },
);
