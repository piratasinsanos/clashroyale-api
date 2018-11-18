import {environment} from '../../../../../src/configuration/environment';
import {Constants} from '../../../../../src/model/constants';
import {Security} from '../../../../../src/model/security';
import {Ranking} from '../../../../../src/model/ranking';
import {Logger} from '../../../../../src/lib/logger';
import {app} from '../../../../../src/bootstrap';
import {connect, Mongoose} from 'mongoose';
import {isNullOrUndefined} from 'util';
import * as request from 'supertest';
import {Response} from 'superagent';
import {join} from 'lodash';
import {v4} from 'uuid';

describe('Rankings /api/v2/rankings', function () {

  const logger = new Logger({
    message: 'Server initialized',
    level: 'error'
  });

  const tag = v4();

  let token: string;

  let rankings: Ranking[];

  let connection: Promise<Mongoose>;

  beforeEach(() => {

    token = join(['Bearer', Security.generate({
      sub: v4(),
    })], Constants.EMPTY_STRING);

    // Database connection
    return connection = connect(<string>environment.mongo.host, {
      poolSize: 30
    }).then((mongo: Mongoose) => {
      return mongo;
    });

  });

  afterEach(() => {
    return connection.then((mongo: Mongoose) => {
      return mongo.disconnect().then(() => {
        return logger.log('debug', 'The connection closed database!')
      });
    });
  });

  it('/post new ratings without information', (done) => {
    request.agent(app).post('/api/v2/rankings')
      .set('Content-Type', 'application/json')
      .set('Accept-Language', 'pt-BR;en-US')
      .set('Accept', 'application/json')
      .set('Authorization', token)
      .expect(412)
      .end((error: any) => {
        done(error);
      });

  });

  it('/post new untagged #clan ratings', (done) => {
    request.agent(app).post('/api/v2/rankings')
      .set('Content-Type', 'application/json')
      .set('Accept-Language', 'pt-BR;en-US')
      .set('Accept', 'application/json')
      .set('Authorization', token)
      .send(
        [{
          'member': {
            'name': `${v4()}`
          }
        }]
      )
      .expect(412)
      .end((error: any) => {
        done(error);
      });

  });

  it('/post new classifications without member', (done) => {
    request.agent(app).post('/api/v2/rankings')
      .set('Content-Type', 'application/json')
      .set('Accept-Language', 'pt-BR;en-US')
      .set('Accept', 'application/json')
      .set('Authorization', token)
      .send(
        [{
          'tag': `#${v4()}`
        }]
      )
      .expect(412)
      .end((error: any) => {
        done(error);
      });

  });

  it('/post new classifications without member #tag', (done) => {
    request.agent(app).post('/api/v2/rankings')
      .set('Content-Type', 'application/json')
      .set('Accept-Language', 'pt-BR;en-US')
      .set('Accept', 'application/json')
      .set('Authorization', token)
      .send(
        [{
          'tag': `#${v4()}`,
          'member': {
            'name': `${v4()}`
          }
        }]
      )
      .expect(412)
      .end((error: any) => {
        done(error);
      });

  });

  it('/post new classifications without member name', (done) => {
    request.agent(app).post('/api/v2/rankings')
      .set('Content-Type', 'application/json')
      .set('Accept-Language', 'pt-BR;en-US')
      .set('Accept', 'application/json')
      .set('Authorization', token)
      .send(
        [{
          'tag': `#${v4()}`,
          'member': {
            'tag': `#${v4()}`
          }
        }]
      )
      .expect(412)
      .end((error: any) => {
        done(error);
      });

  });

  it('/post new rankings without member trophies', (done) => {
    request.agent(app).post('/api/v2/rankings')
      .set('Content-Type', 'application/json')
      .set('Accept-Language', 'pt-BR;en-US')
      .set('Accept', 'application/json')
      .set('Authorization', token)
      .send(
        [{
          'tag': `#${v4()}`,
          'member': {
            'tag': `#${v4()}`,
            'name': `${v4()}`
          }
        }]
      )
      .expect(412)
      .end((error: any) => {
        done(error);
      });

  });

  it('/post new rankings', (done) => {
    request.agent(app).post('/api/v2/rankings')
      .set('Content-Type', 'application/json')
      .set('Accept-Language', 'pt-BR;en-US')
      .set('Accept', 'application/json')
      .set('Authorization', token)
      .send(
        [{
          'tag': `#${tag}`,
          'member': {
            'tag': `#${v4()}`,
            'name': `${v4()}`,
            'expLevel': `${Math.random()}`,
            'trophies': `${Math.random()}`
          }
        }]
      )
      .expect(200)
      .expect('Content-Type', /json/)
      .end((error: any, res: Response) => {
        if (!isNullOrUndefined(res.body)) {
          rankings = <Ranking[]> res.body;
        }
        done(error);
      });

  });

  it('/get a ranking by query (v2)', (done) => {
    request.agent(app).get('/api/v2/rankings')
      .set('Content-Type', 'application/x-www-form-urlencoded')
      .set('Authorization', token)
      .query({
        clan: `#${tag}`,
        page: 0
      })
      .expect(200)
      .end((error: any) => {
        done(error);
      })
  });

  it('/get unregistered ranking service, not acceptable (v2)', (done) => {
    request.agent(app).get('/api/v2/rankings/'.concat(v4()))
      .set('Content-Type', 'application/json')
      .set('Authorization', token)
      .query({
        clan: `#${tag}`,
        page: 0
      })
      .expect(406)
      .end((error: any) => {
        done(error);
      })
  });

});
