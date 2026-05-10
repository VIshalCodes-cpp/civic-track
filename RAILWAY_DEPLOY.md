Deployment to Railway

Quick steps:

1. Create a Railway project and connect this repository (or push this repo to GitHub and connect).
2. Add environment variables in Railway for the service:
   - `MONGODB_URI` (required)
   - `SENDGRID_API_KEY` (optional)
   - `FROM_EMAIL` (optional)
   - `TWILIO_ACCOUNT_SID` (optional)
   - `TWILIO_AUTH_TOKEN` (optional)
   - `TWILIO_PHONE_NUMBER` (optional)
   - `PING_MESSAGE` (optional)

3. If you use Railway's Docker deployment, Railway will build the provided `Dockerfile`.
   - Otherwise set Build Command: `npm run build`
   - Start Command: `npm run start`

4. By default the app listens on `process.env.PORT`. Railway provides the port automatically.

Notes:
- The root `start` script runs `node dist/server/node-build.mjs` which is produced by `npm run build`.
- Make sure `pnpm-lock.yaml` is present when using the included Dockerfile; the Dockerfile uses `pnpm`.
