import { Markup } from 'telegraf';
import { bold, fmt, italic } from 'telegraf/format';
import codeController from '../../../controllers/code-controller';
import { composeWizardScene } from '../../../helpers/compose-wizard-scene';
import { genMessage } from '../../../helpers/create-message-sample';
import sendMessage from '../../../helpers/send-message';
import { ICode } from '../../../models/code/code-model';
import { Game } from '../../../models/game';
import types from './types';

interface CodeSuggestAddToDBProps {
  game: Game,
  code: Partial<Pick<ICode, 'name' | 'content'>>,
  entry: string,
}

export const createGiveCodeAddToDBScene = composeWizardScene<CodeSuggestAddToDBProps>(
  async (ctx) => {
    const game = ctx.scene.session?.props?.game
    
    const markup = Markup.inlineKeyboard(
      [
        Markup.button.callback(ctx.i18n.t('code_suggest.buttons.back'), 'back'),
        Markup.button.callback(ctx.i18n.t('code_suggest.buttons.suggest'), 'create-code'),
      ],{ columns: 2 }
    )
    
    const text = genMessage({
      header: genMessage({
        header: bold(ctx.i18n.t('code_suggest.name',{ game_name: game.name })),
        body: italic(ctx.i18n.t('code_suggest.data.warning_go_to_moderate',{ game_name: game.name })),
      }),
      body: fmt(fmt(`- ${ctx.i18n.t('code_suggest.data.name')}${ctx.scene.session?.props?.code?.name ? '' : '*'}: `), bold(ctx.scene.session?.props?.code?.name ? ctx.scene.session?.props?.code?.name : '-'),fmt('\n\n'),fmt(`- ${ctx.i18n.t('code_suggest.data.content')}${ctx.scene.session?.props?.code?.content ? '' : '*'}: `), bold(ctx.scene.session?.props?.code?.content ? ctx.scene.session?.props?.code?.content : '-')),
    })
    
    await sendMessage(ctx, {
      text,
      extra: markup
    })
    
    return ctx.wizard.next();
  },
  async (ctx, done, back) => {
    const game = ctx.scene.session?.props?.game
    const callback_data = ctx.callbackQuery?.['data'];
    
    if (callback_data) {
      if (callback_data === 'back') {
        await back();
      }
      if (callback_data === 'create-code') {
        const code = await codeController.suggestCode({
          name: ctx.scene.session?.props?.code?.name,
          content: ctx.scene.session?.props?.code?.content,
          game: game.id,
          sender_id: ctx.chat.id
        })
        await done(types.GIVE_CODE_END_DIALOG, {
          result: code.result,
          game,
          code: ctx.scene.session?.props.code,
          entry: ctx.scene.session.props.entry,
        })
      }
    } else {
      await ctx.sendMessage(ctx.i18n.t('code_suggest.exit',{ menu_name: ctx.i18n.t('code_suggest.name',{ game_name:game.name }) }))
      await done();
    }
    return;
  },
);