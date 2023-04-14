import { BuildExecutorSchema } from "./schema";
import { ExecutorContext } from "nx/src/config/misc-interfaces";
import * as fs from "fs";
import { exec } from "child_process";

async function getRemotePackageVersions(packageName: string): Promise<string[]> {
  const response = await fetch(`https://registry.npmjs.org/${packageName}`).then(r => {
    if (r.status === 404) {
      return { versions: {} };
    }
    if (!r.ok) {
      throw new Error(`Failed to fetch package version for ${packageName}`);
    }
    return r.json();
  });
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

export default async function runExecutor(
  options: BuildExecutorSchema,
  context: ExecutorContext
): Promise<{ success: boolean }> {
  const outDir = context.workspace.projects[context.projectName!].targets!.build.options.outputPath;
  const packageJson = JSON.parse(fs.readFileSync(`${outDir}/package.json`, "utf-8"));
  const packageName = packageJson.name;

  const remotePackageVersion = await getRemotePackageVersions(packageName);
  const localPackageVersion = packageJson.version.trim();
  if (remotePackageVersion.includes(localPackageVersion)) {
    console.log(`Package ${packageName} is already published with version ${localPackageVersion}`);
    return {
      success: true,
    };
  }

  if (!options.dryRun) {
    const result = await executeCommand(`npm publish ${outDir} --access public`);
    if (!result.success) {
      console.error("Failed to publish package", packageName);
      console.error(result.stderr);
      return {
        success: false,
      };
    }
    console.log(result.stdout);
    console.log("Successfully published package", packageName);
  }

  return {
    success: true,
  };
}
