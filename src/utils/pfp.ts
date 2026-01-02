import { createAvatar } from "@dicebear/core";
import { adventurer } from "@dicebear/collection";


export function generateAvatar(options = {}) {
  const avatar = createAvatar(adventurer, options);
  return avatar.toString();
}

