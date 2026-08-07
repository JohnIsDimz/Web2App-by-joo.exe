import JSZip from 'jszip';
import { AppConfig } from '../types';
import {
  generateMainDart,
  generatePubspecYaml,
  generateAndroidManifest,
  generateInfoPlist,
  generatePwaManifest,
  generateReadme,
  generateGithubWorkflow,
} from './flutterGenerator';

export async function downloadFlutterProjectZip(config: AppConfig) {
  const zip = new JSZip();
  const folderName = config.appName.toLowerCase().replace(/[^a-z0-9_]/g, '_') || 'flutter_app';
  const root = zip.folder(folderName) || zip;

  // Add root files
  root.file('pubspec.yaml', generatePubspecYaml(config));
  root.file('README.md', generateReadme(config));

  // Add .github/workflows for auto APK build
  const githubWorkflows = root.folder('.github')?.folder('workflows');
  if (githubWorkflows) {
    githubWorkflows.file('build_apk.yml', generateGithubWorkflow(config));
  }

  // Add lib folder
  const lib = root.folder('lib');
  if (lib) {
    lib.file('main.dart', generateMainDart(config));
  }

  // Add android folder
  const androidApp = root.folder('android')?.folder('app')?.folder('src')?.folder('main');
  if (androidApp) {
    androidApp.file('AndroidManifest.xml', generateAndroidManifest(config));
  }

  // Add ios folder
  const iosRunner = root.folder('ios')?.folder('Runner');
  if (iosRunner) {
    iosRunner.file('Info.plist', generateInfoPlist(config));
  }

  // Add web folder
  const webFolder = root.folder('web');
  if (webFolder) {
    webFolder.file('manifest.json', generatePwaManifest(config));
    webFolder.file(
      'index.html',
      `<!DOCTYPE html>
<html>
<head>
  <base href="$FLUTTER_BASE_HREF">
  <meta charset="UTF-8">
  <meta content="IE=Edge" http-equiv="X-UA-Compatible">
  <meta name="description" content="${config.splashTagline}">
  <title>${config.appName}</title>
  <link rel="manifest" href="manifest.json">
</head>
<body>
  <script src="flutter_bootstrap.js" async></script>
</body>
</html>`
    );
  }

  // Generate blob and trigger browser download
  const content = await zip.generateAsync({ type: 'blob' });
  const downloadUrl = URL.createObjectURL(content);
  const link = document.createElement('a');
  link.href = downloadUrl;
  link.download = `${folderName}_flutter_project.zip`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(downloadUrl);
}
