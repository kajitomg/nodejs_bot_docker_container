import {Transaction} from "sequelize"
import services from '../services';

const sequelize = services.db?.postgres?.sequelize

export type TransactionErrorType = { status: false, error: any }
export type TransactionSuccessCreateType = { status: true, data: Transaction }
export type TransactionSuccessCommitType = { status: true }
export type CreateType = TransactionSuccessCreateType | TransactionErrorType
export type CommitType = TransactionSuccessCommitType | TransactionErrorType
export type RollbackType = never | TransactionErrorType
export type MyTransactionType = {
  create: () => Promise<CreateType>,
  commit: (transaction: Transaction) => Promise<CommitType>,
  rollback: (transaction: Transaction) => Promise<RollbackType>,
  isTransactionError: typeof isTransactionError
}
const isTransactionError = (obj: CreateType | CommitType | RollbackType): obj is TransactionErrorType => {
  return obj.status === false && obj.error
}

const create = async (): Promise<CreateType> => {
  try {
    const t = await sequelize.transaction({})
    return Promise.resolve({
      status: true,
      data: t
    })
  } catch (error) {
    return Promise.reject({
      status: false,
      error
    })
  }
}

const commit = async (transaction): Promise<CommitType> => {
  try {
    await transaction.commit()
    return Promise.resolve({
      status: true
    })
  } catch (error) {
    return Promise.reject({
      status: false,
      error
    })
  }
}

const rollback = async (transaction): Promise<RollbackType> => {
  try {
    await transaction.rollback()
  } catch (error) {
    return Promise.reject({
      status: error.status,
      error
    })
  }
}

export default {
  create,
  commit,
  rollback,
  isTransactionError
}