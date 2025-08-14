import OptionComponent from './Option.svelte';
import SelectComponent from './Select.svelte';

const Select = SelectComponent as typeof SelectComponent & { Option: typeof OptionComponent };
Select.Option = OptionComponent;

export default Select;
