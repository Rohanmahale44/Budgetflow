<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/temp/1

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
2a. (Optional) To enable Firebase Authentication, add the following to `.env.local` from your Firebase project settings (Web app):

```
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_APP_ID=1:xxxxxxxx:web:xxxxxxxxxxxx
```

Make sure to restart the dev server after updating `.env.local` so Vite picks up the new values.
3. Run the app:
   `npm run dev`

4. Firebase Authentication setup (important):
   - In the Firebase console go to "Authentication" → "Sign-in method".
   - Enable the "Email/Password" provider and save.
   - Without this, email/password sign-in will fail with errors like `auth/invalid-login-credentials` or `auth/wrong-password`.
