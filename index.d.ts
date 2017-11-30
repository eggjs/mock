import { Application, Context } from 'egg';

export interface BaseMockApplication<T, C> extends Application { // tslint:disble-line
  ready(): Promise<void>;
  close(): Promise<void>;
  callback(): any;

  /**
   * mock Context
   */
  mockContext(data?: any): C;

  /**
   * mock cookie session
   */
  mockSession(data: any): T;

  mockCookies(cookies: any): T;

  mockHeaders(headers: any): T;

  /**
   * Mock service
   */
  mockService(service: string, methodName: string, fn: any): T;

  /**
   * mock service that return error
   */
  mockServiceError(service: string, methodName: string, err?: Error): T;

  mockHttpclient(mockUrl: string, mockMethod: string | string[], mockResult: {
    data?: Buffer | string | JSON;
    status?: number;
    headers?: any;
  }): Application;

  mockHttpclient(mockUrl: string, mockResult: {
    data?: Buffer | string | JSON;
    status?: number;
    headers?: any;
  }): Application;

  /**
   * mock csrf
   */
  mockCsrf(): T;

  /**
   * http request helper
   */
  httpRequest(): any;
}

export interface MockOption {
  /**
   * The directory of the application
   */
  baseDir?: string;

  /**
   * Custom you plugins
   */
  plugins?: any;

  /**
   * The directory of the egg framework
   */
  framework?: string;

  /**
   * Cache application based on baseDir
   */
  cache?: boolean;

  /**
   * Swtich on process coverage, but it'll be slower
   */
  coverage?: boolean;

  /**
   * Remove $baseDir/logs
   */
  clean?: boolean;
}

type EnvType = 'default' | 'test' | 'prod' | 'local' | 'unittest';
type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR' | 'NONE';

interface MockApplication extends BaseMockApplication<Application, Context> { }

export interface EggMock {
  /**
   * Create a egg mocked application
   */
  app(option?: MockOption): MockApplication;

  /**
   * Create a mock cluster server, but you can't use API in application, you should test using supertest
   */
  cluster(option?: MockOption): MockApplication;

  /**
   * mock the serverEnv of Egg
   */
  env(env: EnvType): void;

  /**
   * mock console level
   */
  consoleLevel(level: LogLevel): void;

  /**
   * set EGG_HOME path
   */
  home(homePath: string): void;

  /**
   * restore mock
   */
  restore(): void;
}
declare const mm: EggMock;
export default mm;
