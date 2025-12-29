
export type TBinding = {
  column: string;
  value: unknown;
};

/**
 * Helper class to manage bindings for a query builder.
 */
class BindingsHelper {
  protected bindings: TBinding[] = [];

  add(column: string, value: unknown): this {
    this.bindings.push({
      column: column,
      value: value,
    });
    return this;
  }

  useLastBinding(): TBinding | null {
    const lastBindingIndex = this.bindings.length - 1;
    const lastBinding = this.bindings[lastBindingIndex] ?? null;

    if(lastBinding) {
      this.bindings.splice(lastBindingIndex, 1);
      return lastBinding;
    }
    
    return null;
  }

  useAllBindings(): TBinding[] {
    const bindings = this.bindings;
    this.bindings = [];
    return bindings;
  }

  getBindings(): TBinding[] {
    return this.bindings;
  }

  reset() {
    this.bindings = [];
  }

}

export default BindingsHelper;
