import { Markup } from 'telegraf';
import { bold, code, fmt, FmtString, italic } from 'telegraf/format';
import codeController from '../../../controllers/code-controller';
import { composeWizardScene } from '../../../helpers/compose-wizard-scene';
import createListMessage from '../../../helpers/create-list-message';
import { createMessageSample, genMessage } from '../../../helpers/create-message-sample';
import MarkupPagination from '../../../helpers/markup-pagination';
import { createNextScene, getNextScene } from '../../../helpers/next-scene';
import send from '../../../helpers/send';
import { CodeStatuses } from '../../../models/code';
import { Languages } from '../../../models/user/user-model';
import Slices from '../../../slices';
import types from './types';

const limit = 25

export const createSearchCodesScene = composeWizardScene(
  async (ctx) => {
    const game = ctx.wizard.state.options.game
    
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
    
    ctx.wizard.state.search_codes_pagination = ctx.wizard.state.search_codes_pagination || new MarkupPagination(1, 1)
    ctx.wizard.state.search_codes_message_sample = ctx.wizard.state.search_codes_message_sample || new createMessageSample({
      content_wait: fmt(ctx.i18n.t('code.search.loader')),
      data: {
        page: ctx.wizard.state.search_codes_pagination.page,
        max_pages: ctx.wizard.state.search_codes_pagination.maxPages,
      },
      sample: (data?:{
        page?: number,
        max_pages?: number,
        content?: FmtString
      }) => {
        const markup = Markup.inlineKeyboard(
          [
            ctx.wizard.state.search_codes_pagination.prevPageButton(),
            Markup.button.callback(`${data?.page || '*'}/${data?.max_pages || data?.page || '*'}(↻)`, 'force_update'),
            ctx.wizard.state.search_codes_pagination.nextPageButton(),
            Markup.button.callback(ctx.i18n.t('code.search.buttons.back'), createNextScene(ctx.wizard.state.options.entry)),
          ],{ columns: 3 }
        )
        
        const text = genMessage({
          header: bold(ctx.i18n.t('code.search.header', { game: game.name })),
          ...(data.content && {body: data.content}),
          footer: italic(ctx.i18n.t('code.search.footer'))
        })
        
        return {
          text,
          reply_markup: markup.reply_markup
        }
      }
    })
    ctx.wizard.state.search_codes_message_sample.is_loading = true
    const message = await send(ctx, ctx.wizard.state.search_codes_message_sample.result.text, { reply_markup: ctx.wizard.state.search_codes_message_sample.result.reply_markup, parse_mode: 'MarkdownV2' })
    //@ts-ignore
    ctx.wizard.state.delete_message_id = message?.message_id
    
    const count = await codeController.getCount({
      game: game.id,
      status: CodeStatuses.accept
    }, {
      search: ctx.wizard.state.search_codes_search_query || true
    })
    
    ctx.wizard.state.search_codes_count_prev = ctx.wizard.state.search_codes_count
    ctx.wizard.state.search_codes_count = count.count
    ctx.wizard.state.search_codes_pagination.maxPages = Math.ceil(count.count / limit) || 1
    
    const isNeedUpdate = ctx.wizard.state.need_update || (!ctx.wizard.state.search_codes_force_update && (ctx.wizard.state.search_codes_pagination.prevPage !== ctx.wizard.state.search_codes_pagination.page)) || (ctx.wizard.state.search_codes_force_update && (ctx.wizard.state.search_codes_pagination.prevMaxPages !== ctx.wizard.state.search_codes_pagination.maxPages) || (ctx.wizard.state.search_codes_force_update && (ctx.wizard.state.search_codes_count_prev !== ctx.wizard.state.search_codes_count) && (ctx.wizard.state.search_codes_pagination.maxPages === ctx.wizard.state.search_codes_pagination.page)))
 
    if (isNeedUpdate) {
 
      const codes = await codeController.getCodes({
        game: game.id,
        status: CodeStatuses.accept
      },{
        page: ctx.wizard.state.search_codes_pagination.page,
        limit,
        search: ctx.wizard.state.search_codes_search_query || true
      })
      
      const text = codes?.items?.length > 0 ? genMessage({
        body: genMessage({
          ...(ctx.wizard.state.search_codes_search_query && { header: italic(ctx.i18n.t('code.search.request', { codeName: ctx.wizard.state.search_codes_search_query}))}),
          //@ts-ignore
          body: createListMessage({ list: codes.items, convertFn: (key, i) => fmt( (ctx.wizard.state.search_codes_pagination.page - 1) * limit + (i + 1), '. ', key.name, ': ', code(key.content) )},),
          footer: italic(ctx.i18n.t('code.search.help'))
        }),
        footer: bold(`${ctx.i18n.t('code.search.paginationContent')} `,(ctx.wizard.state.search_codes_pagination.page - 1) * limit + 1,'-',(ctx.wizard.state.search_codes_pagination.page - 1) * limit + codes.items?.length, ' / ', ctx.wizard.state.search_codes_count) ,
      }) : ctx.wizard.state.search_codes_search_query ? genMessage({
        ...(ctx.wizard.state.search_codes_search_query && { header: italic(ctx.i18n.t('code.search.request', { codeName: ctx.wizard.state.search_codes_search_query}))}),
        body: italic(ctx.i18n.t('code.search.emptyArray'))
      }) : fmt('')
      
      ctx.wizard.state.search_codes_message_sample.data = {
        content: text,
        max_pages: ctx.wizard.state.search_codes_pagination.maxPages,
        page: ctx.wizard.state.search_codes_pagination.page
      }
      ctx.wizard.state.search_codes_message_sample.is_loading = false
      
      //@ts-ignore
      await ctx.telegram.editMessageText(ctx.chat.id, message.message_id, undefined, ctx.wizard.state.search_codes_message_sample.result.text, { reply_markup: ctx.wizard.state.search_codes_message_sample.result.reply_markup})
      
    }
    if (ctx.wizard.state.search_codes_force_update) {
      ctx.wizard.state.search_codes_force_update = false
    }
    if (ctx.wizard.state.search_codes_message_sample.is_loading) {
      ctx.wizard.state.search_codes_message_sample.is_loading = false
      //@ts-ignore
      await ctx.telegram.editMessageText(ctx.chat.id, message.message_id, undefined, ctx.wizard.state.search_codes_message_sample.result.text, { reply_markup: ctx.wizard.state.search_codes_message_sample.result.reply_markup })
    }
    ctx.wizard.state.need_update = false
    
    return ctx.wizard.next();
  },
  async (ctx, done) => {
    const chatId = ctx.chat?.id;
    const callback_data = ctx.update?.callback_query?.data;
    const messageText = ctx.message?.text;
    
    ctx.telegram.editMessageReplyMarkup(chatId, ctx.wizard.state.delete_message_id, undefined, undefined, undefined)
    
    if (callback_data) {
      
      const nextScene = getNextScene(callback_data)
      if (nextScene) {
        ctx.wizard.state.nextScene = nextScene;
      }
      ctx.wizard.state.search_codes_pagination.onPrevPage(callback_data, () => {
        ctx.wizard.state.nextScene = types.SEARCH_CODES;
      })
      if (callback_data === 'force_update') {
        ctx.wizard.state.search_codes_force_update = true
        ctx.wizard.state.nextScene = types.SEARCH_CODES;
      }
      ctx.wizard.state.search_codes_pagination.onNextPage(callback_data, () => {
        ctx.wizard.state.nextScene = types.SEARCH_CODES;
      })
    } else {
      
      delete ctx.wizard.state.search_codes_message_sample
      ctx.wizard.state.nextScene = types.SEARCH_CODES;
      ctx.wizard.state.need_update = true
      ctx.wizard.state.search_codes_search_query = messageText;
      
    }
    
    return done();
  },
);
