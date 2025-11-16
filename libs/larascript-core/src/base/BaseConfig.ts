import { compose } from "@larascript-framework/compose";
import { HasConfigConcern } from "../concerns/HasConfigConcern.js";

export class BaseConfig extends compose(class {}, HasConfigConcern) {
  declare getConfig: <T = unknown>() => T;

  declare setConfig: (config: unknown) => void;
}
