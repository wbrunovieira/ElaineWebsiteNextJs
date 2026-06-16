import { describe, it, expect } from 'vitest';
import { reorderById } from '@/lib/gallery';

// Photos labeled by their order position: p0, p1, p2, p3, p4.
const gallery = Array.from({ length: 5 }, (_, i) => ({
  id: `p${i}`,
}));
const order = (items: { id: string }[]) => items.map(p => p.id);

describe('reorderById (gallery drag-and-drop order)', () => {
  it('moves a photo forward to a later position', () => {
    // drag p1 onto p3 → p1 lands at index 3
    const result = reorderById(gallery, 'p1', 'p3');
    expect(order(result)).toEqual(['p0', 'p2', 'p3', 'p1', 'p4']);
  });

  it('moves a photo backward to an earlier position', () => {
    // drag p3 onto p1 → p3 lands at index 1
    const result = reorderById(gallery, 'p3', 'p1');
    expect(order(result)).toEqual(['p0', 'p3', 'p1', 'p2', 'p4']);
  });

  it('moves the first photo to the last position', () => {
    const result = reorderById(gallery, 'p0', 'p4');
    expect(order(result)).toEqual(['p1', 'p2', 'p3', 'p4', 'p0']);
  });

  it('moves the last photo to the first position', () => {
    const result = reorderById(gallery, 'p4', 'p0');
    expect(order(result)).toEqual(['p4', 'p0', 'p1', 'p2', 'p3']);
  });

  it('is a no-op when dropped on itself', () => {
    const result = reorderById(gallery, 'p2', 'p2');
    expect(order(result)).toEqual(['p0', 'p1', 'p2', 'p3', 'p4']);
  });

  it('ignores an unknown active id', () => {
    expect(order(reorderById(gallery, 'ghost', 'p1'))).toEqual(
      order(gallery)
    );
  });

  it('ignores an unknown over id', () => {
    expect(order(reorderById(gallery, 'p1', 'ghost'))).toEqual(
      order(gallery)
    );
  });

  it('does not mutate the original array', () => {
    const before = order(gallery);
    reorderById(gallery, 'p0', 'p4');
    expect(order(gallery)).toEqual(before);
  });

  it('preserves length and the full set of ids', () => {
    const result = reorderById(gallery, 'p1', 'p4');
    expect(result).toHaveLength(gallery.length);
    expect(new Set(order(result))).toEqual(new Set(order(gallery)));
  });
});
