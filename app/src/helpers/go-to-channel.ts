
type GoToChannelType = string

export function createGoToChannel(data: string): GoToChannelType {
  return `goto_channel(${data})`
}

export function getGoToChannel(data: GoToChannelType): string | null {
  const reg = new RegExp(/goto_channel\(([^)]+)\)/)
  return data.match(reg)?.[1]
}