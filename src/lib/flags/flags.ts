interface FlagDefinitionType {
  key: string;
  description?: string;
  decide: (id: string) => Promise<boolean> | boolean;
}

export class Flag {
  key: FlagDefinitionType['key'];
  description: FlagDefinitionType['description'];
  _decide: FlagDefinitionType['decide'];
  overrideValue: boolean | null;

  constructor(definition: FlagDefinitionType) {
    this.key = definition.key;
    this.description = definition.description;
    this._decide = definition.decide;
    this.overrideValue = null;
  }

  override(value: boolean) {
    this.overrideValue = value;
  }

  clearOverride() {
    this.overrideValue = null;
  }

  decide(id: string): Promise<boolean> | boolean {
    if (this.overrideValue !== null) {
      return this.overrideValue;
    }
    return this._decide(id);
  }
}

export interface FlagDecisions {
  [key: string]: boolean | null;
}

export class Flags {
  private flags: Map<string, Flag>;

  constructor() {
    this.flags = new Map();
  }

  addFlag(flag: Flag) {
    this.flags.set(flag.key, flag);
  }

  getFlag(key: string): Flag | undefined {
    return this.flags.get(key);
  }

  getAllFlags(): Flag[] {
    return Array.from(this.flags.values());
  }
}
