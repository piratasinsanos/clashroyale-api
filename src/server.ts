import {ScheduleService} from './service/schedule.service';
import {environment} from './configuration/environment';
import {AxiosError, AxiosResponse} from 'axios';
import {format, isNullOrUndefined} from 'util';
import {connect, Mongoose} from 'mongoose';
import {Logger} from './lib/logger';
import {app} from './bootstrap';
import {CronJob} from 'cron';
import {Server} from 'http';
import {Ranking} from './model/ranking';

const logger = new Logger({
  message: 'Server initialized',
  level: environment.env === 'test' ? 'error' : 'debug'
});

// Database connection
const connection = connect(<string>environment.mongo.host, {
  poolSize: 30,
  useNewUrlParser: true,
  dbName: environment.mongo.datasource
}).then((mongo: Mongoose) => {
  return mongo;
});

const server: Server = app.listen(environment.port, async () => {
  if (!isNullOrUndefined(environment.env)) {
    logger.log('info', format('Server listening on http://localhost:%d', environment.port));
  }
});

server.on('listening', function () {
  if (!isNullOrUndefined(environment.env)) {
    logger.log('info', 'Application ready to serve requests.');
    logger.log('info', format('Environment: %s', environment.env || 'development'));
    if (!isNullOrUndefined(environment.clashroyale.token)) {
      const job = new CronJob({
        cronTime: '00 */6 * * * *',
        timeZone: 'America/Bahia',
        start: true,
        onTick: () => {
          new ScheduleService(new Date()).process('#JRUQVP').then((result: AxiosResponse<Ranking[]>) => {
            result.data.forEach((ranking: Ranking) => {
              logger.log('info', format('Ranking #%s %s last date: %s',
                ranking.member.name,
                ranking.member.trophies,
                ranking.created));
            });
          }).catch((e: AxiosError) => {
            logger.log('error', e.message)
          });
        }
      });
      logger.log('info', format('Cron last date: %s', job.lastDate()));
      logger.log('info', format('Cron next date: %s', job.nextDates(1)));
      logger.log('info', format('Cron running: %s', job.running));
    }
  }
});

server.on('close', async () => {
  if (!isNullOrUndefined(connection)) {
    await connection.then((mongo: Mongoose) => {
      return mongo.disconnect().then(() => logger.log('debug', 'The connection closed database!'));
    });
  }
});

export {server}
