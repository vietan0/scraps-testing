import { ChangeEvent, useState } from 'react';

export default function FavNum({ min = 1, max = 9 }) {
  const [number, setNumber] = useState(0);
  const [numberEntered, setNumberEntered] = useState(false);
  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    setNumber(Number(event.target.value));
    setNumberEntered(true);
  }

  const isValid = !numberEntered || (number >= min && number <= max);
  return (
    <div>
      <label htmlFor="favorite-number">Favorite Number</label>
      <input
        id="favorite-number"
        type="number"
        value={number}
        onChange={handleChange}
        max={max}
      />
      {!isValid && <div role="alert">The number is invalid</div>}
    </div>
  );
}