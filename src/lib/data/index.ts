import { firebaseRepo, pinAuth } from "./firebase";
import { mockAuth, mockRepo } from "./mock";

// Toggle between Live Firebase and Local Preview
export const USE_FIREBASE = true;

export const repo = USE_FIREBASE ? firebaseRepo : mockRepo;
export const auth = USE_FIREBASE ? pinAuth : mockAuth;
export const IS_PREVIEW = !USE_FIREBASE;
