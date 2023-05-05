import { BuildExecutorSchema } from "./schema";
import { ExecutorContext } from "nx/src/config/misc-interfaces";
import * as fs from "fs";
import { exec } from "child_process";

async function getRemotePackageVersions(packageName: string): Promise<string[]> {
  const response = await fetch(`https://registry.npmjs.org/${packageName}`).then<{ versions: Record<string, unknown> }>(
    r => {
      if (r.status === 404) {
        return { versions: {} };
      }
      if (!r.ok) {
        throw new Error(`Failed to fetch package version for ${packageName}`);
      }
      return r.json();
    }
  );
  return Object.keys(response.versions).map(v => v.trim());
}

async function executeCommand(command: string): Promise<{ success: boolean; stderr: string; stdout: string }> {
  return new Promise(resolve => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        resolve({ success: false, stderr: stderr.trim(), stdout: stdout.trim() });
      } else {
        resolve({ success: true, stderr: stderr.trim(), stdout: stdout.trim() });
      }
    });
  });
}

async function executeAndPrintCommand(command: string): Promise<boolean> {
  const result = await executeCommand(command);
  if (!result.success) {
    console.error(result.stderr);
  }
  console.log(result.stdout);
  return result.success;
}

export default async function runExecutor(
  options: BuildExecutorSchema,
  context: ExecutorContext
): Promise<{ success: boolean }> {
  const outDir = context.workspace!.projects[context.projectName!].targets!.build.options.outputPath;
  const packageJson = JSON.parse(fs.readFileSync(`${outDir}/package.json`, "utf-8"));
  const npmPackageName = packageJson.name;

  const remotePackageVersion = await getRemotePackageVersions(npmPackageName);
  const localPackageVersion = packageJson.version.trim();
  if (remotePackageVersion.includes(localPackageVersion)) {
    console.log(`Package ${npmPackageName} is already published with version ${localPackageVersion}`);
    return {
      success: true,
    };
  }

  const NPM_COMMAND = `npm publish ${outDir} --access public`;
  const GIT_TAG_COMMAND = `git tag ${context.projectName}@${localPackageVersion}`;

  if (!options.dryRun) {
    // Tag the release
    if (options.gitTagRelease) {
      const success = await executeAndPrintCommand(GIT_TAG_COMMAND);
      if (!success) return { success: false };
    }

    // Publish the package
    const success = await executeAndPrintCommand(NPM_COMMAND);
    if (!success) return { success: false };
  } else {
    if (options.gitTagRelease) {
      console.log(`Dry run: skipping "${GIT_TAG_COMMAND}"`);
    }
    console.log(`Dry run: skipping "${NPM_COMMAND}"`);
  }

  return {
    success: true,
  };
}
