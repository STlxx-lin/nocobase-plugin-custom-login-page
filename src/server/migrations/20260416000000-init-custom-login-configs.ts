import { Migration } from '@nocobase/server';
import { DEFAULT_CONFIG_VALUES } from '../index';

export default class extends Migration {
  on = 'afterLoad';

  async up() {
    try {
      const repo = this.app.db.getRepository('custom_login_configs');
      if (!repo) return;

      const existing = await repo.findOne({ filter: { key: 'default' } });
      if (!existing) {
        await repo.create({
          values: {
            ...DEFAULT_CONFIG_VALUES,
            key: 'default',
          },
        });
      }
    } catch (err: any) {
      this.app.logger?.warn?.(`[CustomLoginPage Migration] init-custom-login-configs skipped: ${err.message}`);
    }
  }
}
