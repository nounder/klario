export function getDrawingTransitionName(id?: string | number) {
  const normalized = id ?? "default"
  return `drawing-preview-${normalized}`
}
