import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import HealthBar from './HealthBar';

describe('HealthBar', () => {
  it('renders the health bar with correct data', () => {
    render(
      <HealthBar
        name="Pikachu"
        currentHp={50}
        maxHp={100}
        stats="50/100"
        isPlayer={true}
      />
    );

    expect(screen.getByText('Pikachu')).toBeInTheDocument();
    expect(screen.getByText('50/100')).toBeInTheDocument();
    const healthBar = screen.getByRole('progressbar');
    expect(healthBar).toBeInTheDocument();
    // JSDOM doesn't calculate styles, so we can't easily check the width percentage.
    // We can check the aria-valuenow attribute though.
    expect(healthBar).toHaveAttribute('aria-valuenow', '50');
  });
});
