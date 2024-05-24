import { App } from '@/app';
import { ValidateEnv } from '@utils/validateEnv';
import { CacheRoute } from '@routes/cache.route';

ValidateEnv();

const app = new App([new CacheRoute()]);

app.listen();
