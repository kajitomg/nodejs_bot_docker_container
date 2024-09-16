export default (arr, thing) => [].concat(...arr.map(n => [n, thing])).slice(0, -1)
