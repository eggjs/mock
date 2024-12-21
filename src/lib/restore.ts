import { restore as mmRestore } from 'mm';
import { restoreMockAgent } from './mock_agent.js';
import { restore as clusterRestore } from './cluster.js';

export async function restore() {
  await clusterRestore();
  await Promise.all([ restoreMockAgent(), mmRestore() ]);
}
