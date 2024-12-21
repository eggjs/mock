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
   */
  framework?: string | boolean;

  /**
   * current test on plugin
   */
  plugin?: boolean;

  /**
   * @deprecated please use framework instead
   */
  customEgg?: string;

  /**
   * Cache application based on baseDir
   */
  cache?: boolean;

  /**
   * Switch on process coverage, but it'll be slower
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

  beforeInit?: (app: any) => Promise<void>;
}

export interface MockApplicationOptions extends MockOptions {
  baseDir: string;
  framework: string;
  clusterPort?: number;
}
