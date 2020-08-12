import * as vscode from 'vscode';
import { posix } from 'path';

import { generateTestClassFileContent } from './file-content-generator';

export function activate(context: vscode.ExtensionContext) {
	let disposable = vscode.commands.registerCommand('vscode-java-tests.createTestClass', createTestClass);

	context.subscriptions.push(disposable);
}

export function deactivate() {}

async function createTestClass() {
	const activeEditor = vscode.window.activeTextEditor;

	if (!activeEditor) {
		vscode.window.showWarningMessage("Please, open a Java file.");
		return;
	}

	if (!activeEditor.document.fileName.endsWith('.java')) {
		vscode.window.showWarningMessage('Only allowed to create test from a Java file');
		return;
	}

	const javaFileUri = activeEditor.document.uri;
	const javaClassName = posix.basename(javaFileUri.path, '.java');

	const testClassName = `${javaClassName}Test`;
	const testFileUri = getTestFileUri(javaFileUri, testClassName);

	try {
		await vscode.workspace.fs.stat(testFileUri);
		showTestFile(testFileUri);

	} catch {
		const fileContent = generateTestClassFileContent(javaFileUri, javaClassName, testFileUri, testClassName);
		await vscode.workspace.fs.writeFile(testFileUri, fileContent);

		showTestFile(testFileUri);
	}
}

function showTestFile(testFileUri: vscode.Uri) {
  // TODO: extract configuration to define where to open it: beside (new editor group) or current editor group
  vscode.window.showTextDocument(testFileUri, { viewColumn: vscode.ViewColumn.Beside });
}

function getTestFileUri(javaFileUri: vscode.Uri, testClassName: string) {
	const testPath = javaFileUri.path.replace('/src/main/java', '/src/test/java');
	const testFilePath = posix.join(testPath, '..', `${testClassName}.java`);
	return javaFileUri.with({ path: testFilePath });
}

