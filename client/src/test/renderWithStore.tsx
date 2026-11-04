import { render } from '@testing-library/react';
import type { ReactElement } from 'react';
import { Provider } from 'react-redux';
import { makeStore, type RootState } from '@/app/store';

export function renderWithStore(ui: ReactElement, preloadedState?: Partial<RootState>) {
  const store = makeStore(preloadedState);
  return { store, ...render(<Provider store={store}>{ui}</Provider>) };
}
