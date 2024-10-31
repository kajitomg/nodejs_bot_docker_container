import { Markup } from 'telegraf';
import { bold, fmt, italic } from 'telegraf/format';
import codeController from '../../../controllers/code-controller';
import { composeWizardScene } from '../../../helpers/compose-wizard-scene';
import { genMessage } from '../../../helpers/create-message-sample';
import send from '../../../helpers/send';
import { ICode } from '../../../models/code/code-model';
import { Game } from '../../../models/game';
import types from './types';

interface CodeCreateAddToDBProps {
  game: Game,
  code: Partial<Pick<ICode, 'name' | 'content'>>,
  entry: string,
}

export const createAddCodeAddToDBScene = composeWizardScene<CodeCreateAddToDBProps>(
  async (ctx) => {
    const game = ctx.scene.session?.props?.game
    
    const markup = Markup.inlineKeyboard(
      [
        Markup.button.callback(ctx.i18n.t('code_create.buttons.back'), 'back'),
        Markup.button.callback(ctx.i18n.t('code_create.buttons.create'), 'create-code'),
      ],{ columns: 2 }
    )
    const text = genMessage({
      header: genMessage({
        header: bold(ctx.i18n.t('code_create.name',{ game_name:game.name })),
        body: italic(ctx.i18n.t('code_create.data.warning_add_to_db',{game_name: game.name})),
      }),
      body: fmt(fmt(`- ${ctx.i18n.t('code_create.data.name')}${ctx.scene.session?.props.code.name ? '' : '*'}: `), bold(ctx.scene.session?.props.code.name ? ctx.scene.session?.props.code.name : '-'),fmt('\n\n'),fmt(`- ${ctx.i18n.t('code_create.data.content')}${ctx.scene.session?.props.code.content ? '' : '*'}: `), bold(ctx.scene.session?.props.code.content ? ctx.scene.session?.props.code.content : '-')),
    })
    
    await send(ctx, text, { parse_mode: 'MarkdownV2', reply_markup: markup.reply_markup })
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
        const code = await codeController.createCode({
          name: ctx.scene.session?.props.code.name,
          content: ctx.scene.session?.props.code.content,
          game: game.id,
          sender_id: ctx.chat.id
        })
        await done(types.ADD_CODE_END_DIALOG, {
          result: code.result,
          game,
          code: ctx.scene.session?.props.code,
          entry: ctx.scene.session.props.entry,
        })
      }
    } else {
      await ctx.sendMessage(ctx.i18n.t('code_create.exit',{ menu_name: ctx.i18n.t('code_create.name',{ game_name:game.name }) }))
      await done()
    }
    return;
  },
);