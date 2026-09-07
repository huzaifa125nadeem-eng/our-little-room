import tailwindcss from '@tailwindcss/postcss';
import vinext from 'vinext';
import { defineConfig } from 'vite';

const PRODUCTION_DATABASE_ID =
  '2635e20a-1943-42f7-96a1-b0ec9ff9be30';

const databaseId =
  process.env.CLOUDFLARE_D1_DATABASE_ID ??
  PRODUCTION_DATABASE_ID;

// macOS Seatbelt blocks FSEvents, so Codex previews need polling for HMR.
const isCodexSeatbeltSandbox = process.env.CODEX_SANDBOX === 'seatbelt';

const localBindingConfig = {
  name: 'our-little-room',
  main: 'vinext/server/fetch-handler',
  compatibility_date: '2026-09-01',
  compatibility_flags: ['nodejs_compat'],
  d1_databases: [
    {
      binding: 'DB',
      database_name: 'our-little-room-db',
      database_id: databaseId,
      migrations_dir: 'drizzle',
    },
  ],
};

export default defineConfig(async () => {
  // Keep Wrangler and Miniflare state project-local. These are non-secret tool
  // settings; application environment belongs in ignored `.env*` files.
  process.env.WRANGLER_WRITE_LOGS ??= 'false';
  process.env.WRANGLER_LOG_PATH ??= '.wrangler/logs';
  process.env.MINIFLARE_REGISTRY_PATH ??= '.wrangler/registry';

  // Wrangler snapshots its log path while the Cloudflare plugin is imported.
  const { cloudflare } = await import('@cloudflare/vite-plugin');

  return {
    css: { postcss: { plugins: [tailwindcss()] } },
    server: isCodexSeatbeltSandbox
      ? { watch: { useFsEvents: false, usePolling: true } }
      : undefined,
    plugins: [
      vinext(),
      cloudflare({
        viteEnvironment: { name: 'rsc', childEnvironments: ['ssr'] },
        config: localBindingConfig,
      }),
    ],
  };
});

