// Realistically all components would be MUI and MUIs theme would be used, this works for now
const buttonAddTransactionColor = getComputedStyle(
  document.documentElement
).getPropertyValue('--button-add-transaction-form');
const buttonCancelTransactionColor = getComputedStyle(
  document.documentElement
).getPropertyValue('--button-cancel-transaction-form');
const buttonDisabledColor = getComputedStyle(
  document.documentElement
).getPropertyValue('--button-cancel-transaction-form-disabled');

export const buttonStyleAdd = {
  padding: '10px 20px',
  borderRadius: '10px',
  border: 'none',
  fontSize: '1.3rem',
  boxShadow:
    '0px 8px 28px -6px rgba(24, 39, 75, 0.12), 0px 18px 88px -4px rgba(24, 39, 75, 0.14)',
  transition: 'all ease-in 0.1s',
  cursor: 'pointer',
  FontFace: 'sans-serif',
  backgroundColor: buttonAddTransactionColor,
  color: 'white',
  width: '150px',
  disabled: {
    padding: '10px 20px',
    borderRadius: '10px',
    border: 'none',
    fontSize: '1.3rem',
    boxShadow:
      '0px 8px 28px -6px rgba(24, 39, 75, 0.12), 0px 18px 88px -4px rgba(24, 39, 75, 0.14)',
    transition: 'all ease-in 0.1s',
    cursor: 'pointer',
    FontFace: 'sans-serif',
    backgroundColor: buttonDisabledColor,
    color: 'white',
    width: '150px',
  },
};

export const buttonStyleCancel = {
  padding: '10px 20px',
  borderRadius: '10px',
  border: 'none',
  fontSize: '1.3rem',
  boxShadow:
    '0px 8px 28px -6px rgba(24, 39, 75, 0.12), 0px 18px 88px -4px rgba(24, 39, 75, 0.14)',
  transition: 'all ease-in 0.1s',
  cursor: 'pointer',
  FontFace: 'sans-serif',
  backgroundColor: buttonCancelTransactionColor,
  color: 'white',
  width: '150px',
};
