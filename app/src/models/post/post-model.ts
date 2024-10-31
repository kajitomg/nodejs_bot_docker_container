import { CreationOptional, InferAttributes, InferCreationAttributes, Model, DataTypes } from "sequelize";
import services from '../../services';

const sequelize = services.db?.postgres?.sequelize
interface User {
  /** Unique identifier for this user or bot. */
  id: number;
  /** True, if this user is a bot */
  is_bot: boolean;
  /** User's or bot's first name */
  first_name: string;
  /** User's or bot's last name */
  last_name?: string;
  /** User's or bot's username */
  username?: string;
  /** IETF language tag of the user's language */
  language_code?: string;
  /** True, if this user is a Telegram Premium user */
  is_premium?: true;
  /** True, if this user added the bot to the attachment menu */
  added_to_attachment_menu?: true;
}

  export interface AbstractMessageEntity {
    /** Type of the entity. Currently, can be “mention” (@username), “hashtag” (#hashtag), “cashtag” ($USD), “bot_command” (/start@jobs_bot), “url” (https://telegram.org), “email” (do-not-reply@telegram.org), “phone_number” (+1-212-555-0123), “bold” (bold text), “italic” (italic text), “underline” (underlined text), “strikethrough” (strikethrough text), “spoiler” (spoiler message), “blockquote” (block quotation), “code” (monowidth string), “pre” (monowidth block), “text_link” (for clickable text URLs), “text_mention” (for users without usernames), “custom_emoji” (for inline custom emoji stickers) */
    type: string;
    /** Offset in UTF-16 code units to the start of the entity */
    offset: number;
    /** Length of the entity in UTF-16 code units */
    length: number;
  }
  interface CommonMessageEntity extends AbstractMessageEntity {
    type: "mention" | "hashtag" | "cashtag" | "bot_command" | "url" | "email" | "phone_number" | "bold" | "blockquote" | "italic" | "underline" | "strikethrough" | "spoiler" | "code";
  }
  interface PreMessageEntity extends AbstractMessageEntity {
    type: "pre";
    /** For “pre” only, the programming language of the entity text */
    language?: string;
  }
  interface TextLinkMessageEntity extends AbstractMessageEntity {
    type: "text_link";
    /** For “text_link” only, URL that will be opened after user taps on the text */
    url: string;
  }
  interface TextMentionMessageEntity extends AbstractMessageEntity {
    type: "text_mention";
    /** For “text_mention” only, the mentioned user */
    user: User;
  }
  interface CustomEmojiMessageEntity extends AbstractMessageEntity {
    type: "custom_emoji";
    /** For “custom_emoji” only, unique identifier of the custom emoji. Use getCustomEmojiStickers to get full information about the sticker */
    custom_emoji_id: string;
  }

export type MessageEntity = CommonMessageEntity | PreMessageEntity | TextLinkMessageEntity | TextMentionMessageEntity | CustomEmojiMessageEntity

export enum MediaTypes {
  DOCUMENT = 'document',
  AUDIO = 'audio',
  PHOTO = 'photo',
  VIDEO = 'video'
}

export type PostMedia = {
  id: string
  type: MediaTypes,
  name: string,
}

export type Variables = {
  name: string,
  value?: string
}

export enum PostTypes {
  'TEMPLATE'= 'template',
  'BODY' = 'body',
  'POST' = 'post'
}

interface Post extends Model<InferAttributes<Post>, InferCreationAttributes<Post>> {
  id: CreationOptional<number>
  name: string
  type: PostTypes
  template?: string
  entities?: MessageEntity[]
  media?: PostMedia[]
  variables?: Variables[]
  date_added: string
}

const postModel = sequelize.define<Post>('post', {
  id: {type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true},
  name: {type: DataTypes.STRING},
  type: {type: DataTypes.ENUM(...Object.values(PostTypes))},
  template: {type: DataTypes.STRING(10000)},
  entities: {type: DataTypes.ARRAY(DataTypes.JSONB)},
  media: {type: DataTypes.ARRAY(DataTypes.JSONB)},
  variables: {type: DataTypes.ARRAY(DataTypes.JSONB)},
  date_added: {type: DataTypes.DATE},
})

export { postModel, Post }