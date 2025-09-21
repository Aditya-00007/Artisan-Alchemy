import {
  useLayoutEffect2
} from "./chunk-2MJHTGQQ.js";
import {
  require_react
} from "./chunk-XXWRGB3W.js";
import {
  __toESM
} from "./chunk-4MBMRILA.js";

// ../../../node_modules/@radix-ui/react-id/dist/index.mjs
var React = __toESM(require_react(), 1);
var useReactId = React[" useId ".trim().toString()] || (() => void 0);
var count = 0;
function useId(deterministicId) {
  const [id, setId] = React.useState(useReactId());
  useLayoutEffect2(() => {
    if (!deterministicId) setId((reactId) => reactId ?? String(count++));
  }, [deterministicId]);
  return deterministicId || (id ? `radix-${id}` : "");
}

export {
  useId
};
//# sourceMappingURL=chunk-RMQK5DAN.js.map
