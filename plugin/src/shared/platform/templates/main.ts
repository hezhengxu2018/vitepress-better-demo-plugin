import type { ComponentType } from '@/types'
import { COMPONENT_TYPE } from '@/shared/constant'

const mainVue = `import { createApp } from "vue";
import Demo from "./Demo.vue";

const app = createApp(Demo);
app.mount("#app");
`

const mainReact = `import React from "react";
import { createRoot } from "react-dom/client";
import Demo from "./Demo.tsx";

const root = createRoot(document.querySelector("#app"));
root.render(<Demo />);
`

export function genMainTs(type: ComponentType): string {
  if (type === COMPONENT_TYPE.VUE) {
    return mainVue
  }

  if (type === COMPONENT_TYPE.REACT) {
    return mainReact
  }

  return ''
}
