// Test fixture only; never imported by the product or production bundle.
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth, authReady } from "../../../apps/web/src/firebase";
export async function createSyntheticIdentity(email: string) {
  if (
    auth.app.options.projectId !== "demo-satsuniccode" ||
    location.hostname !== "127.0.0.1"
  )
    throw new Error("Emulator fixture only");
  await authReady;
  await createUserWithEmailAndPassword(
    auth,
    email,
    "synthetic-emulator-only-123",
  );
}

export async function setSyntheticProfile(displayName: string) {
  if (
    auth.app.options.projectId !== "demo-satsuniccode" ||
    location.hostname !== "127.0.0.1" ||
    !auth.currentUser
  )
    throw new Error("Emulator fixture only");
  await updateProfile(auth.currentUser, { displayName });
}
