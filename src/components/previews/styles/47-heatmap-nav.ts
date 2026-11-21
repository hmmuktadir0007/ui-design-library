/**
 * Keyboard navigation for a 2D heatmap grid (default 7 columns x 4 rows = 28 cells).
 * Returns the next cell index, or null if the key is not a grid navigation key.
 */
export function nextHeatmapCell(index: number, key: string, ctrlKey = false, cols = 7, total = 28): number | null {
  switch (key) {
    case "ArrowRight":
      return Math.min(total - 1, index + 1);
    case "ArrowLeft":
      return Math.max(0, index - 1);
    case "ArrowDown":
      return index + cols < total ? index + cols : index;
    case "ArrowUp":
      return index - cols >= 0 ? index - cols : index;
    case "Home":
      return ctrlKey ? 0 : Math.floor(index / cols) * cols;
    case "End":
      return ctrlKey ? total - 1 : Math.min(total - 1, Math.floor(index / cols) * cols + cols - 1);
    default:
      return null;
  }
}
