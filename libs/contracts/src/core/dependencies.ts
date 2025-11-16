import { Containers } from "./containers.js";

export type DependencyLoader<C extends Containers = Containers> = <
  T extends C,
  K extends keyof T,
>(
  name: K,
) => T[K];

export interface RequiresDependency {
  setDependencyLoader(loader: DependencyLoader): void;
}
