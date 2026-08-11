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
  const engineClean = (config.engineType || 'flutter').toLowerCase().replace(/[^a-z0-9_]/g, '_');
  const folderName = config.appName.toLowerCase().replace(/[^a-z0-9_]/g, '_') || 'app_project';

  // Attempt backend ZIP API first for maximum fidelity and exact engine structure
  try {
    const backendUrl = `/api/export-zip?appName=${encodeURIComponent(config.appName)}&packageName=${encodeURIComponent(config.packageName)}&engineType=${encodeURIComponent(config.engineType)}&url=${encodeURIComponent(config.url)}`;
    const response = await fetch(backendUrl);
    if (response.ok) {
      const blob = await response.blob();
      const downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `${folderName}_${engineClean}_project.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(downloadUrl);
      return;
    }
  } catch (err) {
    console.warn('Backend ZIP export fallback to client-side JSZip:', err);
  }

  // Client-side fallback generation
  const zip = new JSZip();
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

  // Generate blob and trigger browser download
  const content = await zip.generateAsync({ type: 'blob' });
  const downloadUrl = URL.createObjectURL(content);
  const link = document.createElement('a');
  link.href = downloadUrl;
  link.download = `${folderName}_${engineClean}_project.zip`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(downloadUrl);
}
