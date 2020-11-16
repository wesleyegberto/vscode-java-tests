import * as vscode from 'vscode';
import { posix } from 'path';

import { generateTestClassFileContent, generateEmptyClassContent, getTestFileUri, createPackageNameFromUri } from './file-content-generator';
import { JavaTestsSettingsKeys, readConfigurationValue } from './vscode-settings';

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand('java.tests.createNewClass', createNewClass),
    vscode.commands.registerCommand('java.tests.createTestClass', createTestClass)
  );
}

async function createNewClass(args: any) {
  let qualifiedClassName = null;

  let inputValue = undefined;
  if (args) {
    inputValue = createPackageNameFromUri(args as vscode.Uri) + '.';
  }

  qualifiedClassName = await vscode.window.showInputBox({
    placeHolder: 'com.company.MyClass',
    ignoreFocusOut: true,
    value: inputValue,
    valueSelection: inputValue ? [inputValue.length, inputValue.length] : undefined
  });

  if (!qualifiedClassName || !qualifiedClassName.length) {
    return;
  }
  if (qualifiedClassName.endsWith('.java')) {
    qualifiedClassName = qualifiedClassName.replace('.java', '');
  }

  let classPackagePath = '';
  let classPackage = '';
  let className = qualifiedClassName;
  if (qualifiedClassName.indexOf('.') >= 0) {
    const parts = qualifiedClassName.split('.');
    if (parts.length > 1) {
      classPackagePath = parts.splice(0, parts.length - 1).join('/');
      classPackage = classPackagePath.replace(/\//g, '.');
    }
    className = parts[parts.length - 1];
  }

  const folders = vscode.workspace.workspaceFolders;
  const rootPath = folders ? folders[0].uri.path : '.';

  let filePath = vscode.Uri.parse(`${rootPath}/src/main/java/${classPackagePath}/${className}.java`);
  try {
    await vscode.workspace.fs.stat(filePath);
    vscode.window.showWarningMessage(`File already exists: ${classPackagePath}/${className}.java`);
    vscode.window.showTextDocument(filePath);

  } catch {
    const fileContent = generateEmptyClassContent(classPackage, className);
    await vscode.workspace.fs.writeFile(filePath, fileContent);
    vscode.window.showTextDocument(filePath, { selection: new vscode.Range(3, 1, 3, 1) });
  }
}

async function createTestClass(args: any) {
  let javaFileUri: vscode.Uri;

  if (args && args.scheme === 'file' && args.path) {
    javaFileUri = args as vscode.Uri;

  } else {
    const activeEditor = vscode.window.activeTextEditor;

    if (!activeEditor) {
      vscode.window.showWarningMessage('Please, open a Java file.');
      return;
    }

    javaFileUri = activeEditor.document.uri;
  }

  if (!javaFileUri || !javaFileUri.path.endsWith('.java')) {
    vscode.window.showWarningMessage('Only allowed to create test from a Java file');
    return;
  }

  const javaClassName = posix.basename(javaFileUri.path, '.java');

  const testClassName = `${javaClassName}Test`;
  const testFileUri = getTestFileUri(javaFileUri, testClassName);

  try {
    await vscode.workspace.fs.stat(testFileUri);
  } catch {
    const fileContent = await generateTestClassFileContent(javaFileUri, javaClassName, testFileUri, testClassName);
    await vscode.workspace.fs.writeFile(testFileUri, fileContent);
  }
  showTestFile(testFileUri);
}

function showTestFile(testFileUri: vscode.Uri) {
  const configOpenLocationValue = readConfigurationValue(JavaTestsSettingsKeys.FILE_OPEN_LOCATION, 'beside');
  vscode.window.showTextDocument(testFileUri, {
    viewColumn: configOpenLocationValue === 'beside' ? vscode.ViewColumn.Beside : vscode.ViewColumn.Active
  });
}
