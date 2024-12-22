// import assert from 'node:assert';
// import { Context } from 'egg';
// import { app } from '../../../../src/bootstrap.js';

// describe('test/hooks.test.ts', () => {
//   let beforeCtx;
//   let afterCtx;
//   const beforeEachCtxList: Record<string, Context> = {};
//   const afterEachCtxList: Record<string, Context> = {};
//   const itCtxList: Record<string, Context> = {};

//   before(async () => {
//     beforeCtx = app.currentContext;
//   });

//   after(() => {
//     afterCtx = app.currentContext;
//     assert(beforeCtx);
//     assert(beforeCtx !== itCtxList.foo);
//     assert(itCtxList.foo !== itCtxList.bar);
//     assert(afterCtx === beforeCtx);
//     assert(beforeEachCtxList.foo === afterEachCtxList.foo);
//     assert(beforeEachCtxList.foo === itCtxList.foo);
//   });

//   describe('foo', () => {
//     beforeEach(() => {
//       beforeEachCtxList.foo = app.currentContext;
//     });

//     it('should work', () => {
//       itCtxList.foo = app.currentContext;
//     });

//     afterEach(() => {
//       afterEachCtxList.foo = app.currentContext;
//     });
//   });

//   describe('bar', () => {
//     beforeEach(() => {
//       beforeEachCtxList.bar = app.currentContext;
//     });

//     it('should work', () => {
//       itCtxList.bar = app.currentContext;
//     });

//     afterEach(() => {
//       afterEachCtxList.bar = app.currentContext;
//     });
//   });

//   describe('multi it', () => {
//     const itCtxList: Array<Context> = [];

//     it('should work 1', () => {
//       itCtxList.push(app.currentContext);
//     });

//     it('should work 2', () => {
//       itCtxList.push(app.currentContext);
//     });

//     after(() => {
//       assert(itCtxList[0] !== itCtxList[1]);
//     });
//   });
// });
