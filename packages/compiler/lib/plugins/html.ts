import { parse } from "node-html-parser";
import type { Config, Plugin } from "../types";
import iconsRenderer from "./helpers/icons";
const tags = require("html-tags");

export function PluginHTML(): Plugin {
  let text: Plugin;
  let config: Config;
  return {
    name: "core:html",
    defineConfig(_config) {
      config = _config;
      text = config.plugins.find((plugin) => plugin.name === "core:text");
    },
    transform(id: string, payload: string) {
      if (id === "html") {
        const dom = parse(payload);
        const loop = (dom) => {
          for (let node of dom.childNodes) {
            if (node && node.rawTagName) {
              const tagName = node.rawTagName.toLowerCase();
              if (
                tagName === "svg" ||
                node.classList.contains("katex-display") ||
                node.classList.contains("katex")
              ) {
                continue;
              }
              if (!tags.includes(tagName)) {
                const iconsSvg = iconsRenderer(tagName, {
                  attrs: node.attrs,
                  config,
                });
                if (!!iconsSvg) {
                  node.replaceWith(iconsSvg);
                } else {
                  node.innerHTML = text.transform("html", node.innerHTML);
                  const compStr = node.toString().trim();
                  config.metaConstruct.components.push({
                    componentName: node.rawTagName,
                    componentLiteral: compStr,
                    props: node.attrs || {},
                    children: node.innerHTML,
                  });
                  node.replaceWith(compStr);
                }
                continue;
              }
              loop(node);
            }
          }
        };
        loop(dom);
        return dom.toString();
      }
    },
  };
}
