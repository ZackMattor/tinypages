import { Plugin } from "./types";

export function appendPrelude(content: string, headTags) {
  return String.raw`<!DOCTYPE html><html><head>${headTags.join(
    "\n"
  )}</head><body>${content}</body></html>`;
}

export function wrapObject(styles: Record<string, string>) {
  Object.keys(styles).forEach((key) => {
    styles[key] = `"${styles[key]}"`;
  });
  return styles;
}

export function orderPlugins(corePlugins: Plugin[], userPlugins: Plugin[]) {
  let postPlugins = [];
  userPlugins.flat().forEach((plugin) => {
    if (!plugin.enforce) {
      corePlugins.push(plugin);
    } else if (plugin.enforce === "pre") {
      corePlugins.unshift(plugin);
    } else {
      postPlugins.push(plugin);
    }
  });
  return [...corePlugins, ...postPlugins];
}
