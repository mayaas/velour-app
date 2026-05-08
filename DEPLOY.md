# Deploy Velour — Step by Step

## 1. Supabase (5 דקות)

1. לך ל־[supabase.com](https://supabase.com) → New Project
2. שם: `velour-prod` · בחר region קרוב (EU Frankfurt מומלץ)
3. SQL Editor → הדבק את `supabase-schema.sql` → Run
4. Settings → API → העתק:
   - `Project URL` → `VITE_SUPABASE_URL`
   - `anon public` key → `VITE_SUPABASE_ANON_KEY`

## 2. GitHub (2 דקות)

```bash
cd velour
git init
git add .
git commit -m "feat: initial Velour MVP"
gh repo create velour-app --private --push
```

## 3. Vercel (3 דקות)

1. לך ל־[vercel.com](https://vercel.com) → Import Git Repository → בחר `velour-app`
2. Framework Preset: **Vite**
3. Build Command: `npm run build`
4. Output Directory: `dist`
5. **Environment Variables** — הוסף:
   ```
   VITE_SUPABASE_URL=https://xxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGc...
   ```
6. Deploy → תוך 90 שניות האפליקציה חיה

## 4. Custom Domain (אופציונלי)

ב-Vercel: Settings → Domains → הוסף `velour.app` או כל דומיין שתרצי

## 5. Supabase Auth - הגדרת URL

Supabase → Authentication → URL Configuration:
- Site URL: `https://velour.app`
- Redirect URLs: `https://velour.app/**`

---

## סטאטוס MVP לאחר Deploy

| מודול | סטאטוס |
|-------|--------|
| Auth (Sign up / Sign in) | ✅ מוכן |
| Onboarding (5 שלבים) | ✅ מוכן |
| Discover + Matching | ✅ מוכן |
| Boundaries Engine | ✅ מוכן |
| Profile + Privacy | ✅ מוכן |
| Matches | ✅ מוכן |
| Messages | ✅ מוכן |
| AI Coach (Claude) | ✅ מוכן |
| Couple System | ✅ מוכן |
| Reputation System | 🔜 Phase 2 |
| Events & Communities | 🔜 Phase 2 |
| Push Notifications | 🔜 Phase 2 |
| Native App (React Native) | 🔜 Phase 3 |
