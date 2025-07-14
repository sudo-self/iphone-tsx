# iphone-tsx

<img width="1430" alt="og" src="https://github.com/user-attachments/assets/e0f64669-bd15-4797-a28e-31c0a5f62997" />

## Multiple integrated databases
- Supabase for photos and Redis for contacts/events
- Google Drive integration with OAuth authentication
- 
## Interactive Apps: Chat, Email, Maps, Calendar, Camera, Notes, Games.
- Realistic iPhone interface with customizable settings
- Real-time features using Supabase realtime subscriptions

## Left the DB rules open for demo

## Clone

`git clone https://github.com/sudo-self/iphone-tsx.git && cd iphone-tsx`

## install deps

`pnpm install`

### Example

```
CLIENT_ID=your-google-client-id.apps.googleusercontent.com
CLIENT_SECRET=your-google-client-secret
NEXTAUTH_SECRET=your-nextauth-secret
NEXTAUTH_URL=https://your-domain.com
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-public-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_URL=https://your-project.supabase.co
DATABASE_URL=postgresql://postgres.your-project:your-db-password@your-db-host:6543/postgres
NEXT_PUBLIC_PICKER_API_KEY=your-google-picker-api-key
YOUTUBE_PLAYER_API=your-youtube-player-api-key
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-upstash-token
NEXT_PUBLIC_MAPTILER_API_KEY=your-maptile-api-key
NEXT_PUBLIC_FORMSPREE_ID=your-formspree-id
NEXT_PUBLIC_BUILD_HASH=your-build-hash
```
