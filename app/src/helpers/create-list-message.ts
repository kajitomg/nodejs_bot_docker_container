import { fmt, FmtString } from 'telegraf/format';
import interleave from './interleave';

enum Intervals {
  'shift' = '\n',
  'indent' = '\n\n'
}

export default function <T = FmtString>(data:{ list: T[], convertFn?:(item?:T, index?: number) => FmtString }, options?:{ interval?: keyof typeof Intervals }) {
  const interval = Intervals[options?.interval] || Intervals.shift
  //@ts-ignore
  const convertFn = data.convertFn || function (item) {return fmt(item)}
  const list = data.list.filter(item => {
    if (item instanceof FmtString) {
      return item.text
    }
    return item
  })
  
  return fmt(interleave(list.map(convertFn),fmt(interval)))
}