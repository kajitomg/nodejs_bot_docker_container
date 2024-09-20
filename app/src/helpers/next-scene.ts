
type NextSceneType = string

export function createNextScene(scene: string): NextSceneType {
  return `next_scene(${scene})`
}

export function getNextScene(scene: NextSceneType): string | null {
  const reg = new RegExp(/next_scene\(([^)]+)\)/)
  return scene.match(reg)?.[1]
}