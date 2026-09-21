import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { copyFile, mkdir, mkdtemp, readFile, rm, symlink, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { test } from 'node:test'

test('generates unique statuses from nested sources and removes stale codes', async () => {
  const root = await mkdtemp(join(tmpdir(), 'error-status-map-'))
  try {
    await mkdir(join(root, 'scripts'))
    await mkdir(join(root, 'src/nested'), { recursive: true })
    await symlink(new URL('../node_modules', import.meta.url).pathname, join(root, 'node_modules'))
    await copyFile(new URL('./generate-error-status-map.ts', import.meta.url), join(root, 'scripts/generate.ts'))
    await writeFile(join(root, 'src/index.ts'), "export const code = 'FORBIDDEN::USER_NOT_FOUND'\n")
    await writeFile(
      join(root, 'src/nested/errors.ts'),
      'export const codes = ["NOT_FOUND::TASK", `CUSTOM::FAILURE`, "FORBIDDEN::USER_NOT_FOUND"]\n'
    )
    const output = join(root, 'src/error-status-map.ts')
    await writeFile(output, "export const stale = 'BAD_REQUEST::STALE'\n")
    const generate = () => execFileSync(process.execPath, [join(root, 'scripts/generate.ts')], { cwd: tmpdir() })
    generate()
    const content = await readFile(output, 'utf8')
    assert.match(content, /\.\.\.COMMON_ERROR_STATUS_MAP/)
    assert.match(content, /'CUSTOM::FAILURE': 500/)
    assert.match(content, /'FORBIDDEN::USER_NOT_FOUND': 403/)
    assert.match(content, /'NOT_FOUND::TASK': 404/)
    assert.equal(content.match(/FORBIDDEN::USER_NOT_FOUND/g)?.length, 1)
    assert.ok(!content.includes('STALE'))
    generate()
    assert.equal(await readFile(output, 'utf8'), content)
    await rm(join(root, 'src/nested'), { recursive: true })
    await rm(join(root, 'src/index.ts'))
    generate()
    assert.ok(!(await readFile(output, 'utf8')).includes('::'))
  } finally {
    await rm(root, { force: true, recursive: true })
  }
})
