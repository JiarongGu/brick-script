import * as fs from 'fs';
import * as path from 'path';
import url from 'url';

const appDirectory = fs.realpathSync(process.cwd());
const resolveApp = relativePath => path.resolve(appDirectory, relativePath);
const resolveOwn = relativePath => path.resolve(__dirname, '..', relativePath);

export const appPath = resolveApp('.');
export const ownPath = resolveOwn('.');
