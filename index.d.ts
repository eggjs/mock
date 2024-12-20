import { Application, Context, EggLogger } from 'egg';
import { MockMate } from 'mm';
import { Test } from 'supertest';
import { MockAgent } from 'urllib';
import { Suite } from 'mocha';

export { MockAgent };

export interface EggTest extends Test {
  unexpectHeader(name: string, b?: Function): EggTest;
  expectHeader(name: string, b?: Function): EggTest;
}

export type Methods = 'get' | 'post' | 'delete' | 'del' | 'put' | 'head' | 'options' | 'patch' | 'trace' | 'connect';

export interface BaseMockApplication<T, C> extends Application {
  ready(): Promise<void>;
  close(): Promise<void>;
  callback(): any;

  /**
   * mock Context
   */
  mockContext(data?: any): C;

  /**
   * mock Context
   */
  mockContextScope<R>(fn: (ctx: C) => Promise<R>, data?: any): Promise<R>;

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

  mockHttpclient(mockUrl: string | RegExp, mockMethod: string | string[], mockResult: MockHttpClientResult): Application;

  mockHttpclient(mockUrl: string | RegExp, mockResult: MockHttpClientResult): Application;

  mockAgent(): MockAgent;
  mockAgentRestore(): Promise<void>;
  mockRestore(): Promise<void>;

  /**
   * mock csrf
   */
  mockCsrf(): T;

  /**
   * http request helper
   */
  httpRequest(): {
    [key in Methods]: (url: string) => EggTest;
  } & {
    [key: string]: (url: string) => EggTest;
  };

  /**
   * mock logger
   */
  mockLog(logger?: EggLogger | string): void;
  expectLog(expected: string | RegExp, logger?: EggLogger | string): void;
  notExpectLog(expected: string | RegExp, logger?: EggLogger | string): void;

  /**
   * background task
   */
  backgroundTasksFinished(): Promise<void>;
}

export interface ResultObject {
  data?: string | object | Buffer;
  status?: number;
  headers?: any;
  delay?: number;
  persist?: boolean;
  repeats?: number;
}

export type ResultFunction = (url?: string, opts?: any) => ResultObject | string | void;

export type MockHttpClientResult = ResultObject | ResultFunction | string;

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

  /**
   * default options.mockCtxStorage value on each mockContext
   */
  mockCtxStorage?: boolean;
}

export interface MockClusterOption extends MockOption {
  workers?: number | string;
  cache?: boolean;
  /**
   * opt for egg-bin
   */
  opt?: object;
}

export type EnvType = 'default' | 'test' | 'prod' | 'local' | 'unittest' | string & {};
export type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR' | 'NONE';

export interface MockApplication extends BaseMockApplication<Application, Context> {
  [key: string]: any;
}

export interface EggMock extends MockMate {
  /**
   * Create a egg mocked application
   */
  app: (option?: MockOption) => MockApplication;

  /**
   * Create a mock cluster server, but you can't use API in application, you should test using supertest
   */
  cluster: (option?: MockClusterOption) => MockApplication;

  /**
   * mock the serverEnv of Egg
   */
  env: (env: EnvType) => void;

  /**
   * mock console level
   */
  consoleLevel: (level: LogLevel) => void;

  /**
   * set EGG_HOME path
   */
  home: (homePath: string) => void;

  /**
   * restore mock
   */
  restore: () => any;

  /**
   * If you use mm.app instead of egg-mock/bootstrap to bootstrap app.
   * Should manually call setGetAppCallback,
   * then egg-mock will inject ctx for each test case
   * @param cb
   */
  setGetAppCallback: (cb: (suite: Suite) => Promise<MockApplication> ) => void;
}

declare const mm: EggMock;
export { mm }
export default mm;
