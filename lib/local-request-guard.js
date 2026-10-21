// Local tooling keeps this compatibility entry point. Runtime code imports
// the shared implementation directly so production does not depend on a
// local-only module path.
export {
  isLocalEnvironment,
  localTargetAllowed,
  localOutboundError,
  localFetch,
} from "./outbound-fetch.js";
