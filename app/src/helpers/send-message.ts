import { Context } from 'telegraf';
import { FmtString } from 'telegraf/format';
import { ExtraEditMessageText } from 'telegraf/typings/telegram-types';
import { HandlerError } from '../exceptions/api-error';
import { AbstractMessageEntity } from '../models/post/post-model';

let lastMessage = undefined

const sendNewMedia = async (
  ctx:Context,
  data?: {
    text?: string | FmtString<any>,
    entities?: AbstractMessageEntity[],
    media?: {
      type: 'photo' | 'video' | 'document' | 'audio',
      file_id: string
    },
    extra?: ExtraEditMessageText,
  }) => {
  if (data.media?.type === 'photo') {
    return await ctx.replyWithPhoto(data.media.file_id, {
      reply_markup: data.extra?.reply_markup,
      //@ts-ignore
      caption: data.text?.text || data.text,
      //@ts-ignore
      caption_entities: data.text?.entities || data.entities
    });
  } else if (data.media?.type === 'video') {
    return await ctx.replyWithVideo(data.media.file_id, {
      reply_markup: data.extra?.reply_markup,
      //@ts-ignore
      caption: data.text?.text || data.text,
      //@ts-ignore
      caption_entities: data.text?.entities || data.entities
    });
  } else if (data.media?.type === 'document') {
    return await ctx.replyWithDocument(data.media.file_id, {
      reply_markup: data.extra?.reply_markup,
      //@ts-ignore
      caption: data.text?.text || data.text,
      //@ts-ignore
      caption_entities: data.text?.entities || data.entities
    });
  } else if (data.media?.type === 'audio') {
    return await ctx.replyWithAudio(data.media.file_id, {
      reply_markup: data.extra?.reply_markup,
      //@ts-ignore
      caption: data.text?.text || data.text,
      //@ts-ignore
      caption_entities: data.text?.entities || data.entities
    });
  }
}

export default async (
  ctx:Context,
  data: {
    text?: string | FmtString<any>,
    entities?: AbstractMessageEntity[],
    media?: {
      type: 'photo' | 'video' | 'document' | 'audio',
      file_id: string
    },
    extra?: ExtraEditMessageText,
  },
  options?: {
    new_message?: boolean,
    clear_markup?: boolean,
    clear_media?: boolean,
  }) => {
  try {
    const memory = {
      reply_markup: undefined,
      text: undefined,
      entities: undefined,
      media: undefined,
    }
    if (ctx.updateType === 'message') {
      if (options?.clear_markup && lastMessage) {
        await ctx.telegram.editMessageReplyMarkup(ctx.chat.id, lastMessage.message_id, undefined, undefined)
      }
      if (data.media) {
        return lastMessage = await sendNewMedia(ctx, data)
      } else if (data.text) {
        return lastMessage = await ctx.reply(data.text, data.extra);
      } else {
        return
      }
    } else if (ctx.updateType === 'callback_query') {
      await ctx.answerCbQuery();
      //@ts-ignore
      if (ctx.callbackQuery.message?.text) {
        //@ts-ignore
        memory.text = ctx.callbackQuery.message?.text
        //@ts-ignore
        memory.entities = ctx.callbackQuery.message?.entities
      }
      //@ts-ignore
      if(ctx.callbackQuery.message.photo) {
        //@ts-ignore
        memory.media = {type: 'photo', file_id: ctx.callbackQuery.message?.photo[0]?.file_id}
      }
      //@ts-ignore
      if(ctx.callbackQuery.message.video) {
        //@ts-ignore
        memory.media = {type: 'video', file_id: ctx.callbackQuery.message?.video?.file_id}
      }
      //@ts-ignore
      if(ctx.callbackQuery.message.document) {
        //@ts-ignore
        memory.media = {type: 'document', file_id: ctx.callbackQuery.message?.document?.file_id}
      }
      //@ts-ignore
      if(ctx.callbackQuery.message.audio) {
        //@ts-ignore
        memory.media = {type: 'audio', file_id: ctx.callbackQuery.message?.audio?.file_id}
      }
      //@ts-ignore
      memory.text = ctx.callbackQuery.message?.text || ctx.callbackQuery.message?.caption
      //@ts-ignore
      memory.entities = ctx.callbackQuery.message?.entities || ctx.callbackQuery.message?.caption_entities
      
      //@ts-ignore
      if(ctx.callbackQuery.message?.reply_markup) {
        //@ts-ignore
        memory.reply_markup = ctx.callbackQuery.message?.reply_markup
        //@ts-ignore
        memory.text = ctx.callbackQuery.message?.text || ctx.callbackQuery.message?.caption
        //@ts-ignore
        memory.entities = ctx.callbackQuery.message?.entities || ctx.callbackQuery.message?.caption_entities
      }
      //@ts-ignore
      if (options?.clear_markup && ctx.callbackQuery.message?.reply_markup) {
        await ctx.editMessageReplyMarkup(undefined)
        
        //@ts-ignore
        if (ctx.callbackQuery.message?.text) {
          if (data.media) {
            await ctx.deleteMessage()
            
            return lastMessage = await sendNewMedia(ctx, {
              media: data.media || memory.media,
              //@ts-ignore
              text: data.text || data.text.text || memory.text,
              entities: data.entities || memory.entities,
              extra: {
                ...data?.extra,
                reply_markup: data.extra?.reply_markup
              }
            })
          } else if (data.text) {
            return lastMessage = await ctx.reply(data.text, data.extra);
          } else {
            return
          }
          //@ts-ignore
        } else if (ctx.callbackQuery.message?.photo || ctx.callbackQuery.message?.video || ctx.callbackQuery.message?.document || ctx.callbackQuery.message?.audio) {
          //@ts-ignore
          lastMessage = await ctx.editMessageCaption(data.text.text || data.text, {
            reply_markup: data.extra?.reply_markup,
            //@ts-ignore
            caption_entities: data.text.entities || data.entities
          })
          if (data.media) {
            return lastMessage = await ctx.editMessageMedia({
              type: data.media?.type,
              media: data.media?.file_id
            });
          }
        }
        //@ts-ignore
      } else if (options?.clear_media && ctx.callbackQuery.message?.photo || ctx.callbackQuery.message?.video || ctx.callbackQuery.message?.document || ctx.callbackQuery.message?.audio) {
        await ctx.deleteMessage()
        if (data.media) {
          return lastMessage = await sendNewMedia(ctx, {
            media: data.media,
            //@ts-ignore
            text: data.text || data.text.text || memory.text,
            entities: data.entities || memory.entities,
            extra: {
              ...data?.extra,
              reply_markup: data.extra?.reply_markup || memory.reply_markup
            }
          })
        } else {
          return lastMessage = await ctx.reply(data.text,data?.extra);
        }
      } else {
        //@ts-ignore
        if (ctx.callbackQuery.message?.text) {
          if (data.media) {
            await ctx.deleteMessage()
            return lastMessage = await sendNewMedia(ctx, {
              media: data.media || memory.media,
              //@ts-ignore
              text: data.text || data.text?.text || memory.text,
              entities: data.entities || memory.entities,
              extra: data.extra
            })
          } else if (data.text) {
            return lastMessage = await ctx.editMessageText(data.text, data.extra);
          } else {
            return
          }
          //@ts-ignore
        } else if (ctx.callbackQuery.message?.photo || ctx.callbackQuery.message?.video || ctx.callbackQuery.message?.document || ctx.callbackQuery.message?.audio) {
          if (data.media) {
            lastMessage = await ctx.editMessageMedia({
              type: data.media?.type,
              media: data.media?.file_id
            });
          }
          //@ts-ignore
          return lastMessage = await ctx.editMessageCaption(data.text.text, {
            reply_markup: data.extra?.reply_markup,
            //@ts-ignore
            caption_entities: data.text.entities
          })
        }
      }
    }
  } catch (e) {
    console.error(new HandlerError(400, 'Ошибка: Отправка сообщения', e))
  }
};