import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

// Execute the actual trusted workflow policy with synthetic GitHub responses.
// No checkout, network access, real approvals, or merges occur in these tests.
const workflow = readFileSync(new URL('../.github/workflows/dependabot-auto-merge.yml', import.meta.url), 'utf8');
const block = workflow.split('          script: |\n')[1]?.split('\n      - name:')[0];
assert.ok(block, 'The approval policy script must exist');
const script = block.split('\n').map(line => line.slice(12)).join('\n');
const runPolicy = new Function('github', 'context', 'core', 'process', `return (async () => {\n${script}\n})();`);

const head = 'a'.repeat(40);
const base = 'b'.repeat(40);
const mergeHead = 'c'.repeat(40);
const blob = 'd'.repeat(40);
const repository = 'ucdavis/software-catalog';
const rulesRoute = 'GET /repos/{owner}/{repo}/rules/branches/{branch}';

interface Rule {
  type: string;
  parameters?: {
    required_approving_review_count?: number;
    dismiss_stale_reviews_on_push?: boolean;
    required_review_thread_resolution?: boolean;
    strict_required_status_checks_policy?: boolean;
    required_status_checks?: { context: string; integration_id?: number }[];
  };
}

interface Review {
  id: number;
  user: { id: number };
  commit_id: string;
  state: string;
}

interface PullRequest {
  state: string;
  draft: boolean;
  user: { id: number };
  base: { ref: string; sha: string; repo: { full_name: string } };
  head: { sha: string; repo: { full_name: string } };
  changed_files: number;
  commits: number;
}

function fixture() {
  const files = [{ filename: 'client/package-lock.json', status: 'modified', sha: blob }];
  return {
    env: { DEPENDENCIES: JSON.stringify([{ packageEcosystem: 'npm_and_yarn', dependencyName: 'vite', updateType: 'version-update:semver-patch' }]) },
    repository, eventHead: head,
    pr: {
      state: 'open', draft: false, base: { ref: 'main', sha: base, repo: { full_name: repository } },
      user: { id: 49699333 }, head: { sha: head, repo: { full_name: repository } }, changed_files: 1, commits: 1,
    } as PullRequest,
    current: undefined as PullRequest | undefined,
    files,
    rules: [
      { type: 'pull_request', parameters: {
        required_approving_review_count: 1, dismiss_stale_reviews_on_push: true, required_review_thread_resolution: true,
      } },
      { type: 'required_status_checks', parameters: {
        strict_required_status_checks_policy: true,
        required_status_checks: [
          { context: 'Validate', integration_id: 15368 },
          { context: 'Software catalog security', integration_id: 15368 },
          { context: 'CodeRabbit', integration_id: 347564 },
          { context: 'Codacy Static Code Analysis', integration_id: 56611 },
        ],
      } },
    ] as Rule[],
    commits: [{ sha: head, author: { id: 49699333 }, committer: { id: 19864447 },
      commit: { verification: { verified: true } }, parents: [{ sha: base }] }],
    comparison: { status: 'identical', merge_base_commit: { sha: base } },
    original: { data: { sha: head, files: structuredClone(files) }, headers: { link: '' } },
    reviews: [] as Review[],
    failAt: '',
  };
}

interface Effects {
  approvals: { owner: string; repo: string; pull_number: number; commit_id: string; event: string; body: string }[];
  outputs: Record<string, string>;
  reads: string[];
}

async function evaluate(input: ReturnType<typeof fixture>, effects: Effects = { approvals: [], outputs: {}, reads: [] }) {
  let reads = 0;
  function api(name: string) {
    effects.reads.push(name);
    if (input.failAt === name) throw new Error(`GitHub API failure: ${name}`);
  }
  await runPolicy({
    rest: {
      pulls: {
        get: async () => {
          const refresh = reads++ > 0;
          api(refresh ? 'refresh' : 'pr');
          return { data: structuredClone(refresh ? input.current ?? input.pr : input.pr) };
        },
        listFiles: 'files', listCommits: 'commits', listReviews: 'reviews',
        createReview: async (review: Effects['approvals'][number]) => {
          api('approve');
          effects.approvals.push(review);
          return { data: {} };
        },
      },
      repos: {
        compareCommitsWithBasehead: async ({ basehead }: { basehead: string }) => {
          api('compare');
          assert.equal(basehead, `${base}...${input.pr.base.sha}`);
          return { data: input.comparison };
        },
        getCommit: async ({ ref, per_page }: { ref: string; per_page: number }) => {
          api('original');
          assert.equal(ref, head);
          assert.equal(per_page, 100);
          return input.original;
        },
      },
    },
    paginate: async (route: string) => {
      const name = route === rulesRoute ? 'rules' : route;
      api(name);
      switch (name) {
        case 'rules': return input.rules;
        case 'commits': return input.commits;
        case 'files': return input.files;
        case 'reviews': return input.reviews;
        default: throw new Error(`Unexpected API route: ${route}`);
      }
    },
  }, {
    repo: { owner: input.repository.split('/')[0], repo: input.repository.split('/')[1] },
    payload: { pull_request: { number: 17, head: { sha: input.eventHead } } },
  }, {
    info: () => {}, notice: () => {},
    setOutput: (name: string, value: string) => { effects.outputs[name] = value; },
  }, { env: input.env });
  return effects;
}

function withBaseMerge() {
  const input = fixture();
  input.pr.head.sha = mergeHead;
  input.eventHead = mergeHead;
  input.pr.commits = 2;
  input.commits.push({ sha: mergeHead, author: { id: 123 }, committer: { id: 19864447 },
    commit: { verification: { verified: true } }, parents: [{ sha: head }, { sha: base }] });
  return input;
}

test('signed npm update approves and queues only the reviewed head', async () => {
  const result = await evaluate(fixture());
  assert.deepEqual(result.outputs, { 'head-sha': head, eligible: 'true' });
  assert.equal(result.approvals.length, 1);
  assert.deepEqual(result.approvals[0], { owner: 'ucdavis', repo: 'software-catalog', pull_number: 17,
    commit_id: head, event: 'APPROVE', body: 'Approved by the Dependabot policy. Required checks and review threads still gate merging.' });
  assert.ok(result.reads.indexOf('refresh') < result.reads.indexOf('approve'));
});

for (const [ecosystem, filename] of [
  ['npm_and_yarn', 'package.json'],
  ['nuget', '.config/dotnet-tools.json'],
  ['nuget', 'server/server.csproj'],
  ['nuget', 'tests/server.sqltests/server.sqltests.csproj'],
  ['github_actions', '.github/workflows/configure-azure.yml'],
  ['github_actions', '.github/workflows/codeql.yml'],
  ['github_actions', '.github/workflows/dependabot-auto-merge.yml'],
]) {
  test(`verified ${ecosystem} updates can change ${filename}`, async () => {
    const input = fixture();
    input.env.DEPENDENCIES = JSON.stringify([{ packageEcosystem: ecosystem, dependencyName: 'dependency' }]);
    input.files[0]!.filename = filename!;
    assert.equal((await evaluate(input)).outputs.eligible, 'true');
  });
}

test('grouped major updates follow Dependabot configuration', async () => {
  const input = fixture();
  input.env.DEPENDENCIES = JSON.stringify([
    { packageEcosystem: 'npm_and_yarn', dependencyName: 'vite', updateType: 'version-update:semver-major' },
    { packageEcosystem: 'npm_and_yarn', dependencyName: 'other', updateType: 'version-update:semver-patch' },
  ]);
  assert.equal((await evaluate(input)).outputs.eligible, 'true');
});

test('matching current-head approval avoids a duplicate review', async () => {
  const input = fixture();
  input.reviews = [{ id: 1, user: { id: 41898282 }, commit_id: head, state: 'APPROVED' }];
  const result = await evaluate(input);
  assert.equal(result.outputs.eligible, 'true');
  assert.deepEqual(result.approvals, []);
});

test('another head or reviewer cannot substitute for policy approval', async () => {
  const input = fixture();
  input.reviews = [
    { id: 1, user: { id: 41898282 }, commit_id: base, state: 'APPROVED' },
    { id: 2, user: { id: 123 }, commit_id: head, state: 'APPROVED' },
  ];
  assert.equal((await evaluate(input)).approvals.length, 1);
});

test('the latest bot review state controls duplicate approval detection', async () => {
  const input = fixture();
  input.reviews = [
    { id: 2, user: { id: 41898282 }, commit_id: head, state: 'DISMISSED' },
    { id: 1, user: { id: 41898282 }, commit_id: head, state: 'APPROVED' },
  ];
  assert.equal((await evaluate(input)).approvals.length, 1);
});

test('a signed base merge can preserve the original dependency update', async () => {
  const result = await evaluate(withBaseMerge());
  assert.deepEqual(result.outputs, { 'head-sha': mergeHead, eligible: 'true' });
  assert.equal(result.approvals[0]?.commit_id, mergeHead);
});

const rejected: [string, (input: ReturnType<typeof fixture>) => void][] = [
  ['missing metadata', input => { input.env.DEPENDENCIES = ''; }],
  ['empty metadata', input => { input.env.DEPENDENCIES = '[]'; }],
  ['null metadata', input => { input.env.DEPENDENCIES = 'null'; }],
  ['object metadata', input => { input.env.DEPENDENCIES = '{}'; }],
  ['unknown ecosystem', input => { input.env.DEPENDENCIES = '[{"packageEcosystem":"__proto__","dependencyName":"x"}]'; }],
  ['blank dependency name', input => { input.env.DEPENDENCIES = '[{"packageEcosystem":"npm_and_yarn","dependencyName":" "}]'; }],
  ['mixed ecosystems', input => { input.env.DEPENDENCIES = '[{"packageEcosystem":"npm_and_yarn","dependencyName":"x"},{"packageEcosystem":"nuget","dependencyName":"y"}]'; }],
  ['different repository', input => { input.repository = 'other/software-catalog'; }],
  ['different author ID', input => { input.pr.user.id = 1; }],
  ['fork', input => { input.pr.head.repo.full_name = 'other/software-catalog'; }],
  ['foreign base repository', input => { input.pr.base.repo.full_name = 'other/software-catalog'; }],
  ['stale event head', input => { input.eventHead = base; }],
  ['malformed head', input => { input.eventHead = input.pr.head.sha = 'not-a-sha'; }],
  ['malformed base', input => { input.pr.base.sha = ''; }],
  ['closed PR', input => { input.pr.state = 'closed'; }],
  ['draft PR', input => { input.pr.draft = true; }],
  ['different target branch', input => { input.pr.base.ref = 'release'; }],
  ['absent rules', input => { input.rules = []; }],
  ['no review requirement', input => { input.rules[0]!.parameters!.required_approving_review_count = 0; }],
  ['stale approvals retained', input => { input.rules[0]!.parameters!.dismiss_stale_reviews_on_push = false; }],
  ['unresolved threads allowed', input => { input.rules[0]!.parameters!.required_review_thread_resolution = false; }],
  ['outdated branch allowed', input => { input.rules[1]!.parameters!.strict_required_status_checks_policy = false; }],
  ['missing validation check', input => { input.rules[1]!.parameters!.required_status_checks!.splice(0, 1); }],
  ['missing security check', input => { input.rules[1]!.parameters!.required_status_checks!.splice(1, 1); }],
  ['missing CodeRabbit check', input => { input.rules[1]!.parameters!.required_status_checks!.splice(2, 1); }],
  ['missing Codacy check', input => { input.rules[1]!.parameters!.required_status_checks!.pop(); }],
  ['wrong check app', input => { input.rules[1]!.parameters!.required_status_checks![0]!.integration_id = 123; }],
  ['unbound check app', input => { delete input.rules[1]!.parameters!.required_status_checks![0]!.integration_id; }],
  ['no commits', input => { input.commits = []; }],
  ['incomplete commits', input => { input.pr.commits = 2; }],
  ['head not in commit chain', input => { input.commits[0]!.sha = base; }],
  ['foreign original author', input => { input.commits[0]!.author.id = 123; }],
  ['foreign committer', input => { input.commits[0]!.committer.id = 123; }],
  ['unsigned commit', input => { input.commits[0]!.commit.verification.verified = false; }],
  ['original commit is a merge', input => { input.commits[0]!.parents.push({ sha: blob }); }],
  ['malformed parent SHA', input => { input.commits[0]!.parents[0]!.sha = ''; }],
  ['source change', input => { input.files[0]!.filename = 'server/Program.cs'; }],
  ['ecosystem file mismatch', input => { input.files[0]!.filename = '.github/workflows/ci-cd.yml'; }],
  ['unlisted manifest', input => { input.files[0]!.filename = 'other/package.json'; }],
  ['renamed manifest', input => { input.files[0]!.status = 'renamed'; }],
  ['added manifest', input => { input.files[0]!.status = 'added'; }],
  ['deleted manifest', input => { input.files[0]!.status = 'removed'; }],
  ['incomplete file listing', input => { input.pr.changed_files = 2; }],
  ['empty file listing', input => { input.files = []; input.pr.changed_files = 0; }],
  ['duplicate file listing', input => { input.files.push(input.files[0]!); input.pr.changed_files = 2; }],
  ['missing blob SHA', input => { input.files[0]!.sha = ''; }],
  ['head changed before approval', input => { input.current = structuredClone(input.pr); input.current.head.sha = base; }],
  ['base changed before approval', input => { input.current = structuredClone(input.pr); input.current.base.sha = blob; }],
  ['PR closed before approval', input => { input.current = structuredClone(input.pr); input.current.state = 'closed'; }],
  ['PR drafted before approval', input => { input.current = structuredClone(input.pr); input.current.draft = true; }],
];

for (const [name, mutate] of rejected) {
  test(`no approval or merge eligibility for ${name}`, async () => {
    const input = fixture();
    mutate(input);
    const result = await evaluate(input);
    assert.deepEqual(result.outputs, {});
    assert.deepEqual(result.approvals, []);
  });
}

const rejectedMerges: [string, (input: ReturnType<typeof fixture>) => void][] = [
  ['additional ordinary commit', input => { input.commits[1]!.parents.pop(); }],
  ['broken first-parent chain', input => { input.commits[1]!.parents[0]!.sha = blob; }],
  ['unsigned merge', input => { input.commits[1]!.commit.verification.verified = false; }],
  ['unrelated base parent', input => { input.comparison.status = 'diverged'; }],
  ['wrong merge base', input => { input.comparison.merge_base_commit.sha = head; }],
  ['changed dependency blob', input => { input.original.data.files[0]!.sha = base; }],
  ['changed original file set', input => { input.original.data.files[0]!.filename = 'package.json'; }],
  ['wrong original commit', input => { input.original.data.sha = base; }],
  ['paginated original diff', input => { input.original.headers.link = '<https://api.github.com/page2>; rel="next"'; }],
];

for (const [name, mutate] of rejectedMerges) {
  test(`base merges require manual review for ${name}`, async () => {
    const input = withBaseMerge();
    mutate(input);
    const result = await evaluate(input);
    assert.deepEqual(result.outputs, {});
    assert.deepEqual(result.approvals, []);
  });
}

for (const name of ['pr', 'rules', 'commits', 'files', 'reviews', 'refresh', 'approve', 'compare', 'original']) {
  test(`API failure at ${name} never authorizes a merge`, async () => {
    const input = withBaseMerge();
    input.failAt = name;
    const effects: Effects = { approvals: [], outputs: {}, reads: [] };
    await assert.rejects(evaluate(input, effects), /GitHub API failure/);
    assert.deepEqual(effects.outputs, {});
    assert.deepEqual(effects.approvals, []);
  });
}
