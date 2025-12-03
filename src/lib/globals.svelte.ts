import type { FlagDecisions } from './server/db/flag';

class Flags {
  flags = $state<FlagDecisions>({});

  getFlag(key: string): boolean | null {
    const f = this.flags[key];
    if (!f) return null;
    return f.override !== null ? f.override : f.value;
  }

  getFlagOverride(key: string): boolean | null {
    const f = this.flags[key];
    if (!f) return null;
    return f.override;
  }

  setFlags(newFlags: FlagDecisions) {
    this.flags = newFlags;
  }

  setOverride(key: string, override: boolean | null) {
    if (this.flags[key]) {
      this.flags[key].override = override;
    }
  }

  getAllFlags(): FlagDecisions {
    return this.flags;
  }

  addFlag(key: string, value: boolean) {
    if (!this.flags[key]) {
      this.flags[key] = { value, override: null };
    }
  }
}
class GlobalsClass {
  flags = new Flags();
}

const Globals = new GlobalsClass();

export default Globals;
