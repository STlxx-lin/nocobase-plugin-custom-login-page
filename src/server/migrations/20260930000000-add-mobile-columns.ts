import { Migration } from '@nocobase/server';
import { DataTypes } from '@nocobase/database';
import { toSnakeCase } from '../index';

export default class extends Migration {
  on = 'afterLoad';

  async up() {
    const logger = (this.app as any)?.logger || (this.app as any)?.log;
    try {
      const db = this.app?.db;
      const col = db?.getCollection?.('custom_login_configs');
      const queryInterface = db?.sequelize?.getQueryInterface?.();
      if (!queryInterface) {
        if (typeof col?.sync === 'function') {
          await col.sync();
        }
        return;
      }

      const rawTableName =
        (typeof col?.getTableNameWithSchema === 'function' ? col.getTableNameWithSchema() : null) ||
        (typeof col?.model?.getTableName === 'function' ? col.model.getTableName() : null) ||
        'custom_login_configs';
      const plainTableName =
        typeof rawTableName === 'string' ? rawTableName : rawTableName?.tableName || 'custom_login_configs';

      const tables = await queryInterface.showAllTables();
      const tableExists = tables.some((t: string | { tableName?: string }) => {
        const name = typeof t === 'string' ? t : t?.tableName;
        return name === plainTableName || name?.toLowerCase() === plainTableName.toLowerCase();
      });
      if (!tableExists) return;

      const underscored =
        typeof db?.options?.underscored === 'boolean'
          ? db.options.underscored
          : typeof (db?.sequelize as any)?.options?.define?.underscored === 'boolean'
            ? (db?.sequelize as any).options.define.underscored
            : process.env.DB_UNDERSCORED === 'true';

      const rawAttributes = col?.model?.rawAttributes;
      const resolveColumnName = (fieldName: string): string =>
        rawAttributes?.[fieldName]?.field || (underscored ? toSnakeCase(fieldName) : fieldName);

      const columnsToAdd = [
        { name: 'enableMobileCustom', type: DataTypes.BOOLEAN, options: { defaultValue: false } },
        { name: 'mobileGridSchema', type: DataTypes.TEXT, options: { allowNull: true } },
        { name: 'enableMobileTheme', type: DataTypes.BOOLEAN, options: { defaultValue: false } },
        { name: 'mobileThemeConfig', type: DataTypes.TEXT, options: { defaultValue: '{}' } },
        { name: 'mobileContainerStyle', type: DataTypes.STRING(255), options: { defaultValue: 'transparent' } },
      ];

      const description = await queryInterface.describeTable(rawTableName);
      const hasCol = (colName: string) =>
        Object.prototype.hasOwnProperty.call(description, colName) ||
        Object.keys(description).some((k) => k.toLowerCase() === colName.toLowerCase());

      const missingColumns = columnsToAdd
        .map((c) => ({ ...c, columnName: resolveColumnName(c.name) }))
        .filter((c) => !hasCol(c.columnName));

      if (missingColumns.length === 0) return;

      if (typeof col?.sync === 'function') {
        logger?.info?.(
          `[CustomLoginPage Migration] Syncing collection ${plainTableName} for missing columns: ${missingColumns.map((c) => c.columnName).join(', ')}`
        );
        await col.sync();
        return;
      }

      for (const item of missingColumns) {
        logger?.info?.(`[CustomLoginPage Migration] Adding column ${item.columnName} to ${plainTableName}`);
        await queryInterface.addColumn(rawTableName, item.columnName, {
          type: item.type,
          ...item.options,
        });
      }
    } catch (err: any) {
      logger?.warn?.(`[CustomLoginPage Migration] add-mobile-columns skipped: ${err.message}`);
    }
  }
}
