import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { POINTS_PROXY } from './points-data.mjs';
const run = promisify(execFile);
export async function pointsSourceJson(path) {
  const { stdout } = await run(process.platform === 'win32' ? 'curl.exe' : 'curl', ['--fail', '--silent', '--show-error', '--location', '--max-time', '20', `${POINTS_PROXY}${path}`], { timeout: 23000, maxBuffer: 5 * 1024 * 1024, windowsHide: true });
  return JSON.parse(stdout);
}
