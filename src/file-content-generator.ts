import * as vscode from 'vscode';
import { posix } from 'path';

import { parseJavaClassesFromFile } from './class-parser';
import { JavaClass } from './types';
import { ExtensionSettings, getExtensionConfiguration } from './vscode-settings';

export async function generateTestClassFileContent(
  javaFileUri: vscode.Uri,
  javaClassName: string,
  testFileUri: vscode.Uri,
  testClassName: string
): Promise<Buffer> {
  const settings = getExtensionConfiguration();

  if (settings.junitDefaultVersion === 'alwaysAsk') {
    const inputedVersion = await vscode.window.showInputBox({ prompt: 'JUnit version', value: '4' });
    settings.junitDefaultVersion = inputedVersion === '5' ? '5' : '4';
  }

  const packageDeclaration = generateTestClassPackageDeclaration(testFileUri, testClassName);

  const javaClasses = await parseJavaClassesFromFile(javaFileUri);
  // console.log(javaClasses);

  let fileContent = packageDeclaration + createDefaultImports(settings);

  if (javaClasses && javaClasses.length > 0) {
    // find (or set) a public class (required by JUnit)
    let publicClass = javaClasses.find(c => c.accessModifier.startsWith('public'));
    if (!publicClass) {
      publicClass = javaClasses[0];
      publicClass.accessModifier = 'public ';
    }

    fileContent += createTestClass(publicClass, settings);

  } else {
    fileContent += createDefaultTestClass(javaClassName, testClassName);
  }

  return Buffer.from(fileContent, 'utf8');
}

export function generateEmptyClassContent(packageName: string, className: string): Buffer {
  let classContent = '';
  if (packageName && packageName.length) {
    classContent = `package ${packageName};\n\n`;
  }
  classContent += `public class ${className} {\n\t\n}`;
  return Buffer.from(classContent, 'utf8');
}

export function createPackageNameFromUri(uri: vscode.Uri, filename: string | null = null, isTest: boolean = false): string {
  const pathPrefix = isTest ? '/src/test/java' : '/src/main/java';
  const startIndex = uri.fsPath.indexOf(pathPrefix) + 15; // '/src/test/java/'.length
  let endIndex = uri.path.length;

  const extension = posix.extname(uri.path);
  if (extension && extension.length > 0) {
    if (!filename || !filename.length) {
      filename = posix.basename(uri.path);
    }
    endIndex = uri.fsPath.indexOf(filename) - 1;
    if (startIndex >= endIndex) {
      return '';
    }
  }

  return uri.fsPath.substring(startIndex, endIndex).replace(/\//g, '.');
}

function createTestClass(javaClass: JavaClass, settings: ExtensionSettings) {
  const varName = lowercaseFirstLetter(javaClass.className);

  let testClassContent = `\n${javaClass.accessModifier}class ${javaClass.className}Test {\n`;

  if (settings.junitDefaultVersion === '5') {
    testClassContent = '\n@ExtendWith(MockitoExtension.class)' + testClassContent;
  } else {
    testClassContent = '\n@RunWith(MockitoJUnitRunner.class)' + testClassContent;
  }

  let constructorArgs = '';
  if (settings.mockConstrutorParameters) {
    if (javaClass.constructorParameters && javaClass.constructorParameters.length > 0) {
      for (const param of javaClass.constructorParameters) {
        const attributeName = lowercaseFirstLetter(param.name);
        if (constructorArgs.length) {
          constructorArgs += `, ${attributeName}`;
        } else {
          constructorArgs = attributeName;
        }
        testClassContent += `\t@Mock\n\tprivate ${param.type} ${attributeName};\n`;
      }
    }
  }

  testClassContent += `\n\tprivate ${javaClass.className}${javaClass.classParameters} ${varName};\n
\t@Before
\tpublic void setup() {
\t\tthis.${varName} = new ${javaClass.className}${javaClass.classParameters}(${constructorArgs});
\t}\n`;

  if (settings.createTestCaseForEachMethod) {
    testClassContent = generateTestCaseForEachPublicMethod(settings, javaClass, testClassContent, varName);
  }

  return testClassContent + '}\n';
}

function generateTestCaseForEachPublicMethod(settings: ExtensionSettings, javaClass: JavaClass,
  testClassContent: string, varName: string) {

  if (javaClass.publicMethods && javaClass.publicMethods.length) {
    for (const method of javaClass.publicMethods) {
      if (method.isStatic && settings.ignoreStaticMethodTestCase) {
        continue;
      }

      testClassContent += `\n\t@Test
\tpublic void should${capitalizeFirstLetter(method.name)}() {\n`;

      let methodArgs = '';
      if (method.parameters && method.parameters.length > 0) {
        testClassContent += `\t\t// TODO: initialize args\n`;

        for (const param of method.parameters) {
          testClassContent += `\t\t${param.type} ${param.name};\n`;
          if (methodArgs.length) {
            methodArgs += `, ${param.name}`;
          } else {
            methodArgs = param.name;
          }
        }

        testClassContent += `\n`;
      }

      if (method.returnType !== 'void') {
        testClassContent += `\t\t${method.returnType} actualValue = `;
      } else {
        testClassContent += '\t\t';
      }

      let accessor = method.isStatic ? javaClass.className : varName;
      testClassContent += `${accessor}.${method.name}(${methodArgs});\n\n\t\t// TODO: assert scenario\n\t}\n`;
    }

  } else {
    testClassContent += `\t@Test
\tpublic void shouldCompile() {
\t\tassertThat("Actual value", is("Expected value"));
\t}\n`;
  }
  return testClassContent;
}

function createDefaultTestClass(javaClassName: string, testClassName: string) {
  return `\npublic class ${testClassName} {
\tprivate ${javaClassName} cut;

\t@Before
\tpublic void setup() {
\t\tthis.cut = new ${javaClassName}();
\t}

\t@Test
\tpublic void shouldCompile() {
\t\tassertThat("Actual value", is("Expected value"));
\t}
}`;
}

function createDefaultImports(settings: ExtensionSettings) {
  // Junit 5
  if (settings.junitDefaultVersion === '5') {
    return `\n\nimport static org.hamcrest.Matchers.*;
import static org.hamcrest.MatcherAssert.assertThat;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.*;
import org.hamcrest.CoreMatchers;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.mockito.ArgumentCaptor;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.Mock;\n`;
  }

  // JUnit 4
  return `\n\nimport static org.hamcrest.Matchers.*;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertThat;
import static org.mockito.Mockito.*;
import org.hamcrest.CoreMatchers;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.MockitoJUnitRunner;\n`;
}

export function getTestFileUri(javaFileUri: vscode.Uri, testClassName: string) {
  const testPath = javaFileUri.path.replace('/src/main/java', '/src/test/java');
  const testFilePath = posix.join(testPath, '..', `${testClassName}.java`);
  return javaFileUri.with({ path: testFilePath });
}

function generateTestClassPackageDeclaration(testFileUri: vscode.Uri, testClassName: string) {
  const packageName = createPackageNameFromUri(testFileUri, testClassName, true);
  if (!packageName.length) {
    return '';
  }
  return `package ${packageName};`;
}

function generateTargetTestClassPackageImport(javaFileUri: vscode.Uri, javaClassName: string) {
  const packageName = createPackageNameFromUri(javaFileUri, javaClassName, false);
  if (!packageName.length) {
    return '';
  }
  return `import ${packageName}.${javaClassName};`;
}

function capitalizeFirstLetter(string: string): string {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function lowercaseFirstLetter(string: string): string {
  return string.charAt(0).toLowerCase() + string.slice(1);
}
