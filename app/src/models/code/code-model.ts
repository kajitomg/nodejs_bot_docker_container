import { CreationOptional, InferAttributes, InferCreationAttributes, Model, DataTypes } from "sequelize";
import services from '../../services';
import { Games } from '../game';
import { CodeStatuses } from './index';

const sequelize = services.db?.postgres?.sequelize

interface ICode extends Model<InferAttributes<ICode>, InferCreationAttributes<ICode>> {
  id: CreationOptional<number>,
  name: string,
  content: string,
  status: CodeStatuses,
  game: Games,
  date_added: string,
  sender_id: number,
  moderator_id?: number,
}

const codeModel = sequelize.define<ICode>('code', {
  id: {type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true},
  name: {type: DataTypes.STRING},
  content: {type: DataTypes.STRING},
  status: {type: DataTypes.INTEGER},
  game: {type: DataTypes.INTEGER},
  date_added: {type: DataTypes.DATE},
  sender_id: {type: DataTypes.BIGINT},
  moderator_id: {type: DataTypes.BIGINT},
})

export { codeModel, ICode }