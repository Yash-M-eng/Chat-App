import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { conversations, createPreloadedState } from '@/test/fixtures';
import { renderWithStore } from '@/test/renderWithStore';
import ConversationItem from './ConversationItem';

describe('ConversationItem', () => {
  it('shows the name, last message and unread count', () => {
    renderWithStore(
      <ul>
        <ConversationItem conversation={conversations[0]} isSelected={false} onSelect={vi.fn()} />
      </ul>,
      createPreloadedState()
    );

    expect(screen.getByText('Priya Sharma')).toBeInTheDocument();
    expect(screen.getByText('Hello there')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('calls onSelect with the conversation id', async () => {
    const onSelect = vi.fn();
    renderWithStore(
      <ul>
        <ConversationItem conversation={conversations[0]} isSelected={false} onSelect={onSelect} />
      </ul>,
      createPreloadedState()
    );

    await userEvent.click(screen.getByRole('button'));
    expect(onSelect).toHaveBeenCalledWith('c1');
  });

  it('shows typing instead of the last message', () => {
    renderWithStore(
      <ul>
        <ConversationItem conversation={conversations[0]} isSelected={false} onSelect={vi.fn()} />
      </ul>,
      createPreloadedState({ conversations: { typing: { c1: ['u2'] } } })
    );

    expect(screen.getByText('typing...')).toBeInTheDocument();
    expect(screen.queryByText('Hello there')).not.toBeInTheDocument();
  });
});
