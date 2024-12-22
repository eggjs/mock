export interface MockOptions {
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
   *
   * Set to `true` to use the current directory as framework directory
   */
  framework?: string | boolean;

  /**
   * current test on plugin
   */
  plugin?: boolean;

  /**
   * @deprecated please use framework instead
   */
  customEgg?: string | boolean;

  /**
   * Cache application based on baseDir
   */
  cache?: boolean;

  /**
   * Switch on process coverage, but it'll be slower
   */
  coverage?: boolean;

  /**
   * Remove $baseDir/logs and $baseDir/run before start, default is `true`
   */
  clean?: boolean;

  /**
   * default options.mockCtxStorage value on each mockContext
   */
  mockCtxStorage?: boolean;

  beforeInit?: (app: any) => Promise<void>;
}

export interface MockClusterOptions extends MockOptions {
  workers?: number | string;
  cache?: boolean;
  port?: number;
  /**
   * opt pass to coffee, such as { execArgv: ['--debug'] }
   */
  opt?: object;
}

export interface MockApplicationOptions extends MockOptions {
  baseDir: string;
  framework: string;
  clusterPort?: number;
}

export interface MockClusterApplicationOptions extends MockClusterOptions {
  baseDir: string;
  framework: string;
  port: number;
}
