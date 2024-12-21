import assert from 'assert';
import { app } from '../../../../bootstrap';
import { LogService } from '../app/modules/foo/LogService';

describe('test/tegg.test.ts', () => {
  describe('async function', () => {
    it('should work', async () => {
      const logService = await app.getEggObject(LogService);
      assert(logService.getTracerId());
    });
  });

  describe('callback function', () => {
    it('should work', done => {
      app.mockModuleContextScope(async () => {
        const logService = await app.getEggObject(LogService);
        assert(logService.getTracerId());
        done();
      });
    });
  });
});
