import t, { TransactionSuccessCreateType} from './transaction';

export type OptionsType = {
  transaction: TransactionSuccessCreateType
}
interface ParsedQs {
  [key: string]: undefined
    | string
    | string[]
    | ParsedQs
    | ParsedQs[]
}

type acceptProps<DATA = undefined,OPTIONS = undefined,QUERIES = undefined> = {
  data?:DATA,
  options?:OPTIONS,
  queries?:QUERIES
}

export default function<DATA = undefined, QUERIES = undefined, T = void>(callback: (props: acceptProps<DATA, OptionsType, QUERIES>) => Promise<T>):(props: acceptProps<DATA, OptionsType, QUERIES>) => Promise<T> {
  return async function(props) {
    try {
      return await callback(props)
    } catch (error) {
      console.log(error)
      await t.rollback(props.options.transaction.data)
      return Promise.reject(error)
    }
  }
}