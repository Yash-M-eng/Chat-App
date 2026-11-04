import { fireEvent, render, screen } from '@testing-library/react';
import { Avatar } from './Avatar';

describe('Avatar', () => {
  it('shows initials when there is no image', () => {
    render(<Avatar name="Priya Sharma" />);
    expect(screen.getByText('PS')).toBeInTheDocument();
  });

  it('falls back to initials when the image fails to load', () => {
    render(<Avatar name="Rahul Verma" src="broken.png" />);
    fireEvent.error(screen.getByRole('img'));
    expect(screen.getByText('RV')).toBeInTheDocument();
  });

  it('shows the online status dot', () => {
    render(<Avatar name="Priya Sharma" status="online" />);
    expect(screen.getByTitle('online')).toBeInTheDocument();
  });
});
