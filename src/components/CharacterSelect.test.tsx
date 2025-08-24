import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
import CharacterSelect from './CharacterSelect';
import App from '../App';

describe('CharacterSelect', () => {
  it('should enable the start button only when both characters are selected', async () => {
    render(<App />);
    const user = userEvent.setup();

    const startButton = screen.getByRole('button', { name: /start battle/i });
    expect(startButton).toBeDisabled();

    const playerSelect = screen.getByLabelText('Choose your Character');
    await user.selectOptions(playerSelect, 'p001'); // Select Kanao

    expect(startButton).toBeDisabled();

    const opponentSelect = screen.getByLabelText('Choose your Opponent');
    await user.selectOptions(opponentSelect, 'e001'); // Select Naruto

    expect(startButton).toBeEnabled();
  });
});
