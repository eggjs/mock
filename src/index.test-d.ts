import { expectType } from 'tsd';
import { Application, Context } from 'egg';
import { MockApplication, MockAgent, ResultObject } from '.';
import { app, mock, mm } from './bootstrap';

expectType<MockApplication>(app);
expectType<Context>(app.currentContext);
expectType<Context | undefined>(app.ctxStorage.getStore());
expectType<MockApplication>(mock.app());
expectType<MockApplication>(mm.app());

expectType<MockAgent>(mm.app().mockAgent());

expectType<Application>(mm.app().mockHttpclient('url', 'post', { data: 'ok' }));
expectType<Application>(mm.app().mockHttpclient('url', 'post', 'data'));
expectType<Application>(mm.app().mockHttpclient('url', {
  data: 'mock response',
  repeats: 1,
}));
expectType<Application>(mm.app().mockHttpclient('url', () => {}));
expectType<Application>(mm.app().mockHttpclient('url', 'post', () => {}));
expectType<Application>(mm.app().mockHttpclient('url', 'get', {
  data: 'mock response',
  repeats: 1,
}));

expectType<void>(app.mockLog());
expectType<void>(app.mockLog('logger'));
expectType<void>(app.mockLog(app.logger));
expectType<void>(app.expectLog('foo string'));
expectType<void>(app.expectLog('foo string', 'coreLogger'));
expectType<void>(app.expectLog('foo string', app.coreLogger));
expectType<void>(app.expectLog(/foo string/));
expectType<void>(app.expectLog(/foo string/, 'coreLogger'));
expectType<void>(app.expectLog(/foo string/, app.coreLogger));
expectType<void>(mm.env('default'));
expectType<void>(mm.env('devserver'));

expectType<Promise<void>>(app.mockAgentRestore());
expectType<Promise<void>>(app.mockRestore());
expectType<Promise<void>>(app.mockContextScope(async () => {}));
expectType<Promise<void>>(app.mockContextScope(async (ctx) => {}));

expectType<Promise<void>>(app.backgroundTasksFinished());

const result: ResultObject = {};
expectType<number>(result.status!);
