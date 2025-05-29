// lib/raiseListenerLimit.ts
import { setMaxListeners } from 'events';

if (process.env.NODE_ENV === 'development') {
  // Allow up to 50 listener attachments on stdout/stderr to silence warnings
  process.stdout.setMaxListeners(50);
  process.stderr.setMaxListeners(50);
}