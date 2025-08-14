import InputComponent from './Input.svelte';
import TOTPInput from './TOTP.svelte';

const Input = InputComponent as typeof InputComponent & {
  TOTP: typeof TOTPInput;
};
Input.TOTP = TOTPInput;

export default Input;
