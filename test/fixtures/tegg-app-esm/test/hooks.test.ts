import assert from 'node:assert';
import { ContextDelegation } from 'egg';
// import { app } from '../../../../src/bootstrap.js';
import { app } from '../../../../dist/esm/bootstrap.js';

describe('test/hooks.test.ts', () => {
  let beforeCtx;
  let afterCtx;
  const beforeEachCtxList: Record<string, ContextDelegation> = {};
  const afterEachCtxList: Record<string, ContextDelegation> = {};
  const itCtxList: Record<string, ContextDelegation> = {};

  before(async () => {
    beforeCtx = app.currentContext;
  });

  after(() => {
    afterCtx = app.currentContext;
    assert(beforeCtx);
    assert(beforeCtx !== itCtxList.foo);
    assert(itCtxList.foo !== itCtxList.bar);
    assert(afterCtx === beforeCtx);
    assert(beforeEachCtxList.foo === afterEachCtxList.foo);
    assert(beforeEachCtxList.foo === itCtxList.foo);
  });

  describe('foo', () => {
    beforeEach(() => {
      beforeEachCtxList.foo = app.currentContext as ContextDelegation;
    });

    it('should work', () => {
      itCtxList.foo = app.currentContext as ContextDelegation;
    });

    afterEach(() => {
      afterEachCtxList.foo = app.currentContext as ContextDelegation;
    });
  });

  describe('bar', () => {
    beforeEach(() => {
      beforeEachCtxList.bar = app.currentContext as ContextDelegation;
    });

    it('should work', () => {
      itCtxList.bar = app.currentContext as ContextDelegation;
    });

    afterEach(() => {
      afterEachCtxList.bar = app.currentContext as ContextDelegation;
    });
  });

  describe('multi it', () => {
    const itCtxList: Array<ContextDelegation> = [];

    it('should work 1', () => {
      itCtxList.push(app.currentContext as ContextDelegation);
    });

    it('should work 2', () => {
      itCtxList.push(app.currentContext as ContextDelegation);
    });

    after(() => {
      assert(itCtxList[0] !== itCtxList[1]);
    });
  });
});
