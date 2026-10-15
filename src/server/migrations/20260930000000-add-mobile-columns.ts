import { Migration } from '@nocobase/server';
import { DataTypes } from '@nocobase/database';

export default class extends Migration {
  on = 'afterLoad';

  async up() {
    try {
      const queryInterface = this.app?.db?.sequelize?.getQueryInterface?.();
      if (!queryInterface) return;
      const tableName = 'custom_login_configs';
      const tables = await queryInterface.showAllTables();
      const tableExists = tables.some((t: string | { tableName?: string }) => {
        const name = typeof t === 'string' ? t : t.tableName;
        return name === tableName || name?.toLowerCase() === tableName.toLowerCase();
      });
      if (!tableExists) return;

      const description = await queryInterface.describeTable(tableName);
      const columnsToAdd = [
        { name: 'enableMobileCustom', type: DataTypes.BOOLEAN, options: { defaultValue: false } },
        { name: 'mobileGridSchema', type: DataTypes.TEXT, options: { allowNull: true } },
        { name: 'enableMobileTheme', type: DataTypes.BOOLEAN, options: { defaultValue: false } },
        { name: 'mobileThemeConfig', type: DataTypes.TEXT, options: { defaultValue: '{}' } },
        { name: 'mobileContainerStyle', type: DataTypes.STRING(255), options: { defaultValue: 'transparent' } },
      ];

      const logger = (this.app as any)?.logger || (this.app as any)?.log;
      for (const col of columnsToAdd) {
        if (!description[col.name]) {
          logger?.info?.(`[CustomLoginPage Migration] Adding column ${col.name} to ${tableName}`);
          await queryInterface.addColumn(tableName, col.name, {
            type: col.type,
            ...col.options,
          });
        }
      }
    } catch (err: any) {
      const logger = (this.app as any)?.logger || (this.app as any)?.log;
      logger?.warn?.(`[CustomLoginPage Migration] add-mobile-columns skipped: ${err.message}`);
    }
  }
}
