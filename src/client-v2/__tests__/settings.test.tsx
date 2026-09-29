// @vitest-environment jsdom
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';

const mocks = vi.hoisted(() => ({ request: vi.fn(), flowEngine: { flowSettings: { enable() {}, disable() {} } } }));
vi.mock('@nocobase/client-v2', () => ({ useApp: () => ({ apiClient: { request: mocks.request } }) }));
vi.mock('@nocobase/flow-engine', () => ({ useFlowEngine: () => mocks.flowEngine }));
vi.mock('../locale', () => ({ useT: () => (key: string) => key }));
vi.mock('../components/LoginPageBlockGridCanvas', () => ({ DEFAULT_PRESET_GRID_SCHEMA: { use: 'TestGrid' } }));
vi.mock('../components/BlockContentEditorDrawer', () => ({ BlockContentEditorDrawer: () => null }));
vi.mock('../components/CustomLoginContainer', async () => {
  const React = await import('react');
  const { observable } = await import('@formily/reactive');
  return {
    CustomLoginContainer: React.forwardRef(({ onModelReady }: any, ref) => {
      const [props] = React.useState(() => observable({ title: 'original' }));
      const [model] = React.useState(() => ({ serialize: () => ({ use: 'TestGrid', props: { ...props } }) }));
      React.useImperativeHandle(ref, () => ({ serialize: model.serialize }));
      React.useEffect(() => { onModelReady?.(model); }, [model, onModelReady]);
      return <button onClick={() => { props.title = 'edited'; }}>Edit canvas</button>;
    }),
  };
});
import { CustomLoginPageSettings } from '../pages/CustomLoginPageSettings';

const config = { enabled: true, gridSchema: { use: 'TestGrid' }, themeConfig: {}, customBlocks: [] };
function deferred() {
  let resolve!: (value: any) => void;
  const promise = new Promise((done) => { resolve = done; });
  return { promise, resolve };
}

beforeEach(() => {
  mocks.request.mockReset();
  window.matchMedia = vi.fn().mockImplementation(() => ({ matches: false, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {} }));
});
afterEach(cleanup);

describe('editor saving', () => {
  it('blocks writes until configuration is loaded', async () => {
    const pending = deferred();
    mocks.request.mockReturnValue(pending.promise);
    render(<CustomLoginPageSettings />);
    expect((screen.getByRole('switch') as HTMLButtonElement).disabled).toBe(true);
    expect((screen.getByRole('button', { name: /Save global config/ }) as HTMLButtonElement).disabled).toBe(true);
    await act(async () => pending.resolve({ data: { data: config } }));
    await screen.findByRole('button', { name: 'Edit canvas' });
    expect((screen.getByRole('switch') as HTMLButtonElement).disabled).toBe(false);
  });

  it('offers retry after a read error without enabling default configuration writes', async () => {
    mocks.request.mockRejectedValueOnce(new Error('offline')).mockResolvedValue({ data: config });
    render(<CustomLoginPageSettings />);
    await screen.findByText('Failed to load configuration. Editing is disabled to protect your saved page.');
    expect((screen.getByRole('switch') as HTMLButtonElement).disabled).toBe(true);
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
    await screen.findByRole('button', { name: 'Edit canvas' });
    expect(mocks.request.mock.calls.every(([request]) => request.url === 'customLoginPage:getConfig')).toBe(true);
  });

  it('only saves enabled when toggling and retains unsaved canvas edits', async () => {
    mocks.request.mockResolvedValue({ data: config });
    render(<CustomLoginPageSettings />);
    fireEvent.click(await screen.findByRole('button', { name: 'Edit canvas' }));
    await screen.findByText('Unsaved changes');
    fireEvent.click(screen.getByRole('switch'));
    await waitFor(() => expect(mocks.request).toHaveBeenCalledTimes(2));
    expect(mocks.request.mock.calls[1][0].data).toEqual({ enabled: false });
    await waitFor(() => expect(screen.getByText('Unsaved changes')).toBeTruthy());
  });

  it('serializes the current canvas, prevents concurrent writes and keeps newer edits unsaved', async () => {
    const pending = deferred();
    mocks.request.mockResolvedValueOnce({ data: config }).mockReturnValueOnce(pending.promise);
    render(<CustomLoginPageSettings />);
    await screen.findByRole('button', { name: 'Edit canvas' });
    fireEvent.click(screen.getByRole('button', { name: /Save global config/ }));
    await waitFor(() => expect(mocks.request).toHaveBeenCalledTimes(2));
    expect(mocks.request.mock.calls[1][0].data.gridSchema.props.title).toBe('original');
    expect(mocks.request.mock.calls[1][0].data).not.toHaveProperty('enabled');
    expect((screen.getByRole('switch') as HTMLButtonElement).disabled).toBe(true);
    fireEvent.click(screen.getByRole('button', { name: 'Edit canvas' }));
    await act(async () => pending.resolve({ data: config }));
    await screen.findByText('Unsaved changes');
    expect(mocks.request).toHaveBeenCalledTimes(2);
  });

  it('shows failure and allows a retry of the same edits', async () => {
    mocks.request.mockResolvedValueOnce({ data: config }).mockRejectedValueOnce(new Error('offline')).mockResolvedValue({ data: config });
    render(<CustomLoginPageSettings />);
    fireEvent.click(await screen.findByRole('button', { name: 'Edit canvas' }));
    fireEvent.click(screen.getByRole('button', { name: /Save global config/ }));
    await screen.findByText('Save failed. Please retry.');
    fireEvent.click(screen.getByRole('button', { name: /Save global config/ }));
    await screen.findByText('Saved');
    expect(mocks.request.mock.calls[2][0].data.gridSchema.props.title).toBe('edited');
  });
});
