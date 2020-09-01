import * as vscode from 'vscode';

export function generateTestClassFileContent(
  javaFileUri: vscode.Uri,
  javaClassName: string,
  testFileUri: vscode.Uri,
  testClassName: string
) {
  const packageDeclaration = generateTestClassPackageDeclaration(testFileUri, testClassName);
  const packageImport = generateTargetTestClassPackageImport(javaFileUri, javaClassName);

  const fileContent = `${packageDeclaration}

import static org.hamcrest.Matchers.*;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertThat;
import static org.mockito.Mockito.*;
import org.hamcrest.CoreMatchers;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.mockito.ArgumentCaptor;

${packageImport}

public class ${testClassName} {
	private ${javaClassName} cut;

	@Before
	public void setup() {
		this.cut = new ${javaClassName}();
	}

	@Test
	public void shouldCompile() {
		assertThat("Actual value", is("Expected value"));
	}
}
`;

  return Buffer.from(fileContent, 'utf8');
}

function generateTestClassPackageDeclaration(testFileUri: vscode.Uri, testClassName: string) {
  const packageName = extractPackageName(testFileUri, testClassName, true);
  if (!packageName.length) {
    return '';
  }
  return `package ${packageName};`;
}

function generateTargetTestClassPackageImport(javaFileUri: vscode.Uri, javaClassName: string) {
  const packageName = extractPackageName(javaFileUri, javaClassName, false);
  if (!packageName.length) {
    return '';
  }
  return `import ${packageName}.${javaClassName};`;
}

function extractPackageName(fileUri: vscode.Uri, fileClassName: string, isTest: boolean): string {
  const pathPrefix = isTest ? '/src/test/java' : '/src/main/java';
  const startIndex = fileUri.fsPath.indexOf(pathPrefix) + 15; // '/src/test/java/'.length
  const endIndex = fileUri.fsPath.indexOf(fileClassName) - 1;
  if (startIndex >= endIndex) {
    return '';
  }
  return fileUri.fsPath.substring(startIndex, endIndex).replace(/\//g, '.');
}
