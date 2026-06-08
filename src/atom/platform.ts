import { BunServices } from "@effect/platform-bun";
import { NodeServices } from "@effect/platform-node";
import * as Atom from "effect/unstable/reactivity/Atom";

const platformLayer =
  typeof Bun !== "undefined"
    ? BunServices.layer
    : NodeServices.layer;

export const runtimeAtom = Atom.runtime(platformLayer).pipe(Atom.keepAlive);
