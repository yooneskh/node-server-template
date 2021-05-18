// tslint:disable: no-null-keyword
// tslint:disable: no-any

import Convict from 'convict';
import Formats from 'convict-format-with-validator';

Convict.addFormat(Formats.ipaddress);
Convict.addFormat(Formats.url);
Convict.addFormat(Formats.email);

export const ConfigLoader = Convict({
  env: {
    format: ['production', 'development'],
    nullable: false,
    default: null,
    env: 'NODE_ENV',
    arg: 'NODE_ENV'
  },
  subenvs: {
    format: String,
    nullable: true,
    default: null,
    env: 'SUBENVS',
    arg: 'subenvs'
  },
  port: {
    format: 'port',
    nullable: true,
    default: null,
    env: 'PORT',
    arg: 'port'
  },
  db: {
    host: {
      format: String,
      nullable: true,
      default: null,
      env: 'DB_HOST',
      arg: 'db-host'
    },
    port: {
      format: 'port',
      nullable: true,
      default: null,
      env: 'DB_PORT',
      arg: 'db-port'
    },
    name: {
      format: String,
      nullable: true,
      default: null,
      env: 'DB_NAME',
      arg: 'db-name'
    }
  },
  media: {
    baseUrl: {
      format: 'url',
      nullable: true,
      default: null,
      env: 'MEDIA_BASE_URL',
      arg: 'media-base-url'
    },
    directory: {
      format: String,
      nullable: true,
      default: null,
      env: 'MEDIA_DIRECTORY',
      arg: 'media-directory'
    }
  },
  corsHandle: {
    format: String,
    nullable: true,
    default: null,
    env: 'CORS_HANDLE',
    arg: 'cors-handle'
  },
  sarv: {
    ssoUserUrl: {
      format: String,
      nullable: true,
      default: null,
      env: 'SARV_SSO_USER_URL',
      arg: 'sarv-sso-user-url'
    },
    profileUrl: {
      format: String,
      nullable: true,
      default: null,
      env: 'SARV_PROFILE_URL',
      arg: 'sarv-profile-url'
    }
  }
});

ConfigLoader.validate({ allowed: 'strict' });

if (ConfigLoader.has('subenvs')) {
  const subenvs = ConfigLoader.get('subenvs') as unknown as (string | null);
  if (subenvs !== null) {
    ConfigLoader.loadFile( subenvs.split(',').map(it => `./env/${it}.json`) );
    console.log('subenvs loaded', subenvs.split(','));
  }
}

export function getConfig<T>(key: string, def: T): T {
  if (ConfigLoader.has(key as any)) {
    const val = ConfigLoader.get(key as any) as unknown as T | null;
    return val === null ? def : val;
  } return def;
}
