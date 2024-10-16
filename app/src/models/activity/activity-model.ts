import { CreationOptional, InferAttributes, InferCreationAttributes, Model, DataTypes } from "sequelize";
import services from '../../services';
import { Games } from '../game';

const sequelize = services.db?.postgres?.sequelize

interface Activity extends Model<InferAttributes<Activity>, InferCreationAttributes<Activity>> {
  id: CreationOptional<number>,
  post_id: CreationOptional<number>,
  body_id: CreationOptional<number>,
  name: string,
  game: Games,
  date_added: string,
}

const activityModel = sequelize.define<Activity>('activity', {
  id: {type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true},
  post_id: {type: DataTypes.BIGINT},
  body_id: {type: DataTypes.BIGINT},
  name: {type: DataTypes.STRING},
  game: {type: DataTypes.INTEGER},
  date_added: {type: DataTypes.DATE},
})

export { activityModel, Activity }