// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest';

describe('openBlockContentEditor dynamic loader', () => {
  it('dynamically imports BlockContentEditorDrawer and opens editor', async () => {
    const mockOpen = vi.fn();
    vi.doMock('../components/BlockContentEditorDrawer', () => ({
      openBlockContentEditor: mockOpen,
    }));

    const { openBlockContentEditor } = await import('../components/openBlockEditor');
    const mockModel = { uid: 'test_model_1' };
    const mockOnSave = vi.fn();

    await openBlockContentEditor(mockModel, mockOnSave);

    expect(mockOpen).toHaveBeenCalledWith(mockModel, mockOnSave);
  });
});
