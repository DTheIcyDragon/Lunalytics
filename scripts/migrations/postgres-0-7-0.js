// import local files
import SQLite from '../../server/database/sqlite/setup.js';
import logger from '../../server/utils/logger.js';

const infomation = {
  title: 'Adds support for PostgreSQL',
  description:
    'This update adds support for PostgreSQL and changes the timestamp type to datetime in all tables. This is to avoid timezone issues.',
  version: '0.7.0',
  breaking: true,
};

const migrate = async () => {
  const client = await SQLite.connect();

  // Changes for user
  logger.info('User - Fetching users...');
  const users = await SQLite.client('user').where({});

  logger.info('User - Dropping createdAt column...');
  await client.schema.alterTable('user', (table) => {
    table.dropColumn('createdAt');
  });

  logger.info('User - Converting createdAt to datetime...');
  await client.schema.alterTable('user', (table) => {
    table.datetime('createdAt');
  });

  logger.info('User - Updating createdAt...');
  for (const user of users) {
    const date = new Date(user.createdAt).toISOString();
    await SQLite.client('user')
      .where({ email: user.email })
      .update({ createdAt: date });
  }

  // Changes for notifications
  logger.info('Notifications - Fetching notifications...');
  const notifications = await SQLite.client('notifications').where({});

  logger.info('Notifications - Dropping createdAt column...');
  await client.schema.alterTable('notifications', (table) => {
    table.dropColumn('createdAt');
  });

  logger.info('Notifications - Converting createdAt to datetime...');
  await client.schema.alterTable('notifications', (table) => {
    table.datetime('createdAt');
  });

  logger.info('Notifications - Updating createdAt...');
  for (const notification of notifications) {
    const date = new Date(notification.createdAt).toISOString();
    await SQLite.client('notifications')
      .where({ id: notification.id })
      .update({ createdAt: date });
  }

  // Changes for heartbeats
  logger.info('Heartbeats - Fetching heartbeats...');
  const heartbeats = await SQLite.client('heartbeat').where({});

  logger.info('Heartbeats - Dropping createdAt column...');
  await client.schema.alterTable('heartbeat', (table) => {
    table.dropColumn('date');
  });

  logger.info('Heartbeats - Converting createdAt to datetime...');
  await client.schema.alterTable('heartbeat', (table) => {
    table.datetime('date');
    table.index(['monitorId', 'date']);
  });

  logger.info('Heartbeats - Updating createdAt...');
  for (const heartbeat of heartbeats) {
    const date = new Date(heartbeat.date).toISOString();
    await SQLite.client('heartbeat')
      .where({ monitorId: heartbeat.monitorId })
      .update({ date });
  }

  // Changes for hourly heartbeats
  logger.info('Hourly Heartbeats - Fetching hourly heartbeats...');
  const hourlyHeartbeats = await SQLite.client('hourly_heartbeat').where({});

  logger.info('Hourly Heartbeats - Dropping date column...');
  await client.schema.alterTable('hourly_heartbeat', (table) => {
    table.dropColumn('date');
  });

  logger.info('Hourly Heartbeats - Converting date to datetime...');
  await client.schema.alterTable('hourly_heartbeat', (table) => {
    table.datetime('date');
    table.index(['monitorId', 'date']);
  });

  logger.info('Hourly Heartbeats - Updating date...');
  for (const heartbeat of hourlyHeartbeats) {
    const date = new Date(heartbeat.date).toISOString();
    await SQLite.client('hourly_heartbeat')
      .where({ monitorId: heartbeat.monitorId })
      .update({ date });
  }

  // Changes for certificates
  logger.info('Certificates - Fetching certificates...');
  const certificates = await SQLite.client('certificate').where({});

  logger.info(
    'Certificates - Dropping nextCheck, validFrom, and validTill column...'
  );
  await client.schema.alterTable('certificate', (table) => {
    table.dropColumn('nextCheck');
    table.dropColumn('validFrom');
    table.dropColumn('validTill');
  });

  logger.info(
    'Certificates - Converting nextCheck, validFrom, and validTill to datetime...'
  );
  await client.schema.alterTable('certificate', (table) => {
    table.datetime('nextCheck');
    table.datetime('validFrom');
    table.datetime('validTill');
  });

  logger.info('Certificates - Updating nextCheck, validFrom, and validTill...');
  for (const certificate of certificates) {
    const date = new Date(certificate.nextCheck).toISOString();
    const fromDate = new Date(certificate.validFrom).toISOString();
    const tillDate = new Date(certificate.validTill).toISOString();
    await SQLite.client('certificate')
      .where({ monitorId: certificate.monitorId })
      .update({ nextCheck: date, validFrom: fromDate, validTill: tillDate });
  }

  logger.info('Migrations', { message: '0.7.0 has been applied' });
  return;
};

export { infomation, migrate };
