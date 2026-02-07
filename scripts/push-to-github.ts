import { Octokit } from '@octokit/rest';
import * as fs from 'fs';
import * as path from 'path';

const OWNER = 'xhclintohn';
const REPO = 'P';
const BRANCH = 'main';
const COMMIT_MESSAGE = 'feat: Expand to 49 endpoints - add AI Image Editor, Twitter/X dlv2, YouTube dlv3/dlv4, Spotify Search, Temp Mail + duplicate scraper versioning';

const EXCLUDED_DIRS = new Set([
  'node_modules',
  '.git',
  'dist',
  '.cache',
  'attached_assets',
  'tmp',
]);

let connectionSettings: any;

async function getAccessToken() {
  if (connectionSettings && connectionSettings.settings.expires_at && new Date(connectionSettings.settings.expires_at).getTime() > Date.now()) {
    return connectionSettings.settings.access_token;
  }

  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY
    ? 'repl ' + process.env.REPL_IDENTITY
    : process.env.WEB_REPL_RENEWAL
    ? 'depl ' + process.env.WEB_REPL_RENEWAL
    : null;

  if (!xReplitToken) {
    throw new Error('X_REPLIT_TOKEN not found for repl/depl');
  }

  connectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=github',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken,
      },
    }
  )
    .then((res) => res.json())
    .then((data) => data.items?.[0]);

  const accessToken =
    connectionSettings?.settings?.access_token ||
    connectionSettings.settings?.oauth?.credentials?.access_token;

  if (!connectionSettings || !accessToken) {
    throw new Error('GitHub not connected');
  }
  return accessToken;
}

async function getUncachableGitHubClient() {
  const accessToken = await getAccessToken();
  return new Octokit({ auth: accessToken });
}

function getAllFiles(dirPath: string, basePath: string): string[] {
  const files: string[] = [];
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    const relativePath = path.relative(basePath, fullPath);

    if (entry.isDirectory()) {
      if (EXCLUDED_DIRS.has(entry.name)) {
        continue;
      }
      files.push(...getAllFiles(fullPath, basePath));
    } else if (entry.isFile()) {
      files.push(relativePath);
    }
  }

  return files;
}

function isBinary(filePath: string): boolean {
  try {
    const buffer = fs.readFileSync(filePath);
    const sampleSize = Math.min(buffer.length, 8000);
    for (let i = 0; i < sampleSize; i++) {
      if (buffer[i] === 0) return true;
    }
    return false;
  } catch {
    return false;
  }
}

async function main() {
  console.log('Starting push to GitHub...');
  console.log(`Repository: ${OWNER}/${REPO}`);
  console.log(`Branch: ${BRANCH}`);

  const octokit = await getUncachableGitHubClient();
  console.log('GitHub client initialized successfully.');

  const projectRoot = path.resolve(process.cwd());
  const files = getAllFiles(projectRoot, projectRoot);
  console.log(`Found ${files.length} files to push.`);

  let baseSha: string | undefined;
  try {
    const { data: ref } = await octokit.git.getRef({
      owner: OWNER,
      repo: REPO,
      ref: `heads/${BRANCH}`,
    });
    baseSha = ref.object.sha;
    console.log(`Current ${BRANCH} branch SHA: ${baseSha}`);
  } catch (error: any) {
    if (error.status === 404) {
      console.log(`Branch ${BRANCH} not found. Will create initial commit.`);
    } else {
      throw error;
    }
  }

  const treeItems: { path: string; mode: '100644'; type: 'blob'; sha: string }[] = [];
  const batchSize = 5;

  for (let i = 0; i < files.length; i += batchSize) {
    const batch = files.slice(i, i + batchSize);
    const results = await Promise.all(
      batch.map(async (filePath) => {
        const fullPath = path.join(projectRoot, filePath);
        const binary = isBinary(fullPath);

        let content: string;
        let encoding: 'utf-8' | 'base64';

        if (binary) {
          content = fs.readFileSync(fullPath).toString('base64');
          encoding = 'base64';
        } else {
          content = fs.readFileSync(fullPath, 'utf-8');
          encoding = 'utf-8';
        }

        const { data: blob } = await octokit.git.createBlob({
          owner: OWNER,
          repo: REPO,
          content,
          encoding,
        });

        return {
          path: filePath,
          mode: '100644' as const,
          type: 'blob' as const,
          sha: blob.sha,
        };
      })
    );

    treeItems.push(...results);
    console.log(`Created blobs: ${Math.min(i + batchSize, files.length)}/${files.length}`);
  }

  console.log('Creating tree...');
  const { data: tree } = await octokit.git.createTree({
    owner: OWNER,
    repo: REPO,
    tree: treeItems,
    ...(baseSha ? { base_tree: undefined } : {}),
  });
  console.log(`Tree created: ${tree.sha}`);

  console.log('Creating commit...');
  const { data: commit } = await octokit.git.createCommit({
    owner: OWNER,
    repo: REPO,
    message: COMMIT_MESSAGE,
    tree: tree.sha,
    parents: baseSha ? [baseSha] : [],
  });
  console.log(`Commit created: ${commit.sha}`);

  console.log(`Updating ${BRANCH} branch ref...`);
  try {
    await octokit.git.updateRef({
      owner: OWNER,
      repo: REPO,
      ref: `heads/${BRANCH}`,
      sha: commit.sha,
      force: true,
    });
    console.log(`Branch ${BRANCH} updated successfully.`);
  } catch (error: any) {
    if (error.status === 422) {
      await octokit.git.createRef({
        owner: OWNER,
        repo: REPO,
        ref: `refs/heads/${BRANCH}`,
        sha: commit.sha,
      });
      console.log(`Branch ${BRANCH} created successfully.`);
    } else {
      throw error;
    }
  }

  console.log(`\nDone! Pushed ${files.length} files to ${OWNER}/${REPO} on branch ${BRANCH}.`);
  console.log(`Commit: ${commit.sha}`);
  console.log(`Message: ${COMMIT_MESSAGE}`);
}

main().catch((error) => {
  console.error('Error pushing to GitHub:', error);
  process.exit(1);
});
