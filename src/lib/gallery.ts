/**
 * Reorders a list by moving the item with `activeId` to the position of the
 * item with `overId` (drag-and-drop semantics). Pure and side-effect free so it
 * can be unit-tested without rendering. Mirrors dnd-kit's arrayMove.
 */
export function reorderById<T extends { id: string }>(
  items: T[],
  activeId: string,
  overId: string
): T[] {
  if (activeId === overId) return items;
  const from = items.findIndex(i => i.id === activeId);
  const to = items.findIndex(i => i.id === overId);
  if (from === -1 || to === -1) return items;
  const next = items.slice();
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  return next;
}
