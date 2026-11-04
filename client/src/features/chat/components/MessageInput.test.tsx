import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { chatApi } from '@/services/api';
import { createMessage, createPreloadedState } from '@/test/fixtures';
import { renderWithStore } from '@/test/renderWithStore';
import { MessageInput } from './MessageInput';

vi.mock('@/services/api', () => ({
  chatApi: { sendMessage: vi.fn(), editMessage: vi.fn() },
}));

describe('MessageInput', () => {
  beforeEach(() => {
    vi.mocked(chatApi.sendMessage).mockResolvedValue(
      createMessage({ id: 'server-1', senderId: 'me', text: 'Hello team', status: 'sent' })
    );
  });

  it('sends the message when Enter is pressed', async () => {
    const { store } = renderWithStore(<MessageInput conversationId="c1" />, createPreloadedState());
    const input = screen.getByLabelText('Message');

    await userEvent.type(input, 'Hello team{Enter}');

    expect(chatApi.sendMessage).toHaveBeenCalledWith('c1', expect.objectContaining({ text: 'Hello team' }));
    await waitFor(() => expect(input).toHaveValue(''));
    expect(store.getState().messages.byConversation.c1.items[0].text).toBe('Hello team');
  });

  it('adds a new line on Shift + Enter instead of sending', async () => {
    renderWithStore(<MessageInput conversationId="c1" />, createPreloadedState());
    const input = screen.getByLabelText('Message');

    await userEvent.type(input, 'Line one{Shift>}{Enter}{/Shift}Line two');

    expect(chatApi.sendMessage).not.toHaveBeenCalled();
    expect(input).toHaveValue('Line one\nLine two');
  });

  it('does not send an empty message', async () => {
    renderWithStore(<MessageInput conversationId="c1" />, createPreloadedState());

    await userEvent.type(screen.getByLabelText('Message'), '   {Enter}');

    expect(chatApi.sendMessage).not.toHaveBeenCalled();
    expect(screen.getByLabelText('Send message')).toBeDisabled();
  });

  it('shows who you are replying to and can cancel it', async () => {
    const { store } = renderWithStore(
      <MessageInput conversationId="c1" />,
      createPreloadedState({ messages: { replyTo: createMessage() } })
    );

    expect(screen.getByText('Replying to Priya Sharma')).toBeInTheDocument();

    await userEvent.click(screen.getByLabelText('Cancel'));
    expect(store.getState().messages.replyTo).toBeNull();
  });

  it('fills the input when editing a message', () => {
    renderWithStore(
      <MessageInput conversationId="c1" />,
      createPreloadedState({ messages: { editing: createMessage({ senderId: 'me', text: 'Old text' }) } })
    );

    expect(screen.getByText('Editing message')).toBeInTheDocument();
    expect(screen.getByLabelText('Message')).toHaveValue('Old text');
  });
});
