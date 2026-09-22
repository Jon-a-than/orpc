import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { copyFile, mkdir, mkdtemp, readFile, rm, stat, symlink, utimes, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { test } from 'node:test'

test('generates unique statuses from nested sources and removes stale codes', async () => {
  const root = await mkdtemp(join(tmpdir(), 'error-status-map-'))
  const contractDir = join(root, 'packages/contract')
  try {
    await mkdir(join(root, 'apps/api/src'), { recursive: true })
    await mkdir(join(contractDir, 'scripts'), { recursive: true })
    await mkdir(join(contractDir, 'src/nested'), { recursive: true })
    await symlink(new URL('../node_modules', import.meta.url).pathname, join(root, 'node_modules'))
    await copyFile(new URL('./generate-error-status-map.ts', import.meta.url), join(contractDir, 'scripts/generate.ts'))
    await writeFile(join(contractDir, 'src/index.ts'), "export const code = 'FORBIDDEN::USER_NOT_FOUND'\n")
    await writeFile(
      join(contractDir, 'src/nested/errors.ts'),
      'export const codes = ["NOT_FOUND::TASK", `CUSTOM::FAILURE`, "FORBIDDEN::USER_NOT_FOUND"]\n'
    )
    await writeFile(join(root, 'apps/api/src/errors.ts'), "export const code = 'UNAUTHORIZED::API_ONLY'\n")
    const output = join(contractDir, 'src/error-status-map.gen.ts')
    await writeFile(output, "export const stale = 'BAD_REQUEST::STALE'\n")
    const generate = () => execFileSync(process.execPath, [join(contractDir, 'scripts/generate.ts')], { cwd: tmpdir() })
    execFileSync(process.execPath, [
      '--input-type=module',
      '-e',
      `await import(${JSON.stringify(join(contractDir, 'scripts/generate.ts'))})`
    ])
    assert.match(await readFile(output, 'utf8'), /STALE/)
    generate()
    const content = await readFile(output, 'utf8')
    assert.match(content, /\.\.\.COMMON_ERROR_STATUS_MAP/)
    assert.match(content, /'CUSTOM::FAILURE': 500/)
    assert.match(content, /'FORBIDDEN::USER_NOT_FOUND': 403/)
    assert.match(content, /'NOT_FOUND::TASK': 404/)
    assert.equal(content.match(/'FORBIDDEN::USER_NOT_FOUND':/g)?.length, 1)
    assert.match(content, /'UNAUTHORIZED::API_ONLY': 401/)
    assert.ok(!content.includes('STALE'))
    await utimes(output, 1, 1)
    const before = await stat(output)
    generate()
    assert.equal(await readFile(output, 'utf8'), content)
    assert.equal((await stat(output)).mtimeMs, before.mtimeMs)
    await rm(join(contractDir, 'src/nested'), { recursive: true })
    await rm(join(contractDir, 'src/index.ts'))
    await rm(join(root, 'apps/api/src/errors.ts'))
    generate()
    assert.ok(!(await readFile(output, 'utf8')).includes('::'))
    assert.match(await readFile(output, 'utf8'), /export type ErrorCode = never/)
  } finally {
    await rm(root, { force: true, recursive: true })
  }
})
