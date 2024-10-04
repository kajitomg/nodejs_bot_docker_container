import { CreationOptional, InferAttributes, InferCreationAttributes, Model, DataTypes } from "sequelize";
import services from '../../services';

const sequelize = services.db?.postgres?.sequelize

interface IMandatoryChannel extends Model<InferAttributes<IMandatoryChannel>, InferCreationAttributes<IMandatoryChannel>> {
  id: CreationOptional<number>,
  channel_id?: number,
  name: string,
  link: string,
  description?: string,
  active: boolean,
  date_added: string,
}

const mandatoryChannelModel = sequelize.define<IMandatoryChannel>('mandatory-channel', {
  id: {type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true},
  channel_id: {type: DataTypes.BIGINT, unique: true},
  name: {type: DataTypes.STRING},
  link: {type: DataTypes.STRING},
  description: {type: DataTypes.STRING},
  active: {type: DataTypes.BOOLEAN},
  date_added: {type: DataTypes.DATE},
})

export { mandatoryChannelModel, IMandatoryChannel }