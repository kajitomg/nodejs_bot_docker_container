import { CreationOptional, InferAttributes, InferCreationAttributes, Model, DataTypes } from "sequelize";
import services from '../../services';

const sequelize = services.db?.postgres?.sequelize

export enum Languages {
  'ru',
  'en'
}

interface IUser extends Model<InferAttributes<IUser>, InferCreationAttributes<IUser>> {
  id: CreationOptional<number>,
  chat_id: number,
  username: string,
  first_name: string,
  last_session: string,
  language: Languages
}

const userModel = sequelize.define<IUser>('user', {
  id: {type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true},
  chat_id: {type: DataTypes.BIGINT, unique: true},
  username: {type: DataTypes.STRING},
  first_name: {type: DataTypes.STRING},
  last_session: {type: DataTypes.DATE},
  language: {type: DataTypes.INTEGER, defaultValue: Languages.ru},
})

export { userModel, IUser }