import * as vscode from 'vscode';
import { posix } from 'path';

import { parseJavaClassesFromFile } from './class-parser';
import { JavaClass, JavaComponentType } from './types';
import { ExtensionSettings, getExtensionConfiguration } from './vscode-settings';

const isWindows = process.platform === 'win32';

export async function generateTestClassFileContent(
  javaComponentType: JavaComponentType,
  javaFileUri: vscode.Uri,
  javaClassName: string,
  testFileUri: vscode.Uri,
  testClassName: string
): Promise<Buffer> {
  const settings = getExtensionConfiguration();

  if (settings.junitDefaultVersion === 'alwaysAsk') {
    settings.junitDefaultVersion = await askForJunitVersion();
  }

  const packageDeclaration = generateTestClassPackageDeclaration(testFileUri, testClassName);

  const javaClasses = await parseJavaClassesFromFile(javaFileUri);

  let fileContent = packageDeclaration + createDefaultImports(javaComponentType, settings);

  if (javaClasses && javaClasses.length > 0) {
    // find (or set) a public class (required by JUnit)
    let publicClass = javaClasses.find(c => c.accessModifier.startsWith('public'));
    if (!publicClass) {
      publicClass = javaClasses[0];
      publicClass.accessModifier = 'public ';
    }
    publicClass.componentType = javaComponentType;

    fileContent += createTestClass(publicClass, settings);

  } else {
    fileContent += createDefaultTestClass(javaClassName, testClassName, settings);
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
  const posixPath = isWindows ? uri.path.replace(/\\/g, '/') : uri.path;
  const startIndex = posixPath.indexOf(pathPrefix) + 15; // '/src/test/java/'.length
  let endIndex = posixPath.length;

  const extension = posix.extname(posixPath);
  if (extension && extension.length > 0) {
    if (!filename || !filename.length) {
      filename = posix.basename(posixPath);
    }
    endIndex = posixPath.indexOf(filename) - 1;
    if (startIndex >= endIndex) {
      return '';
    }
  }

  return posixPath.substring(startIndex, endIndex).replace(/\//g, '.');
}

export function createTestClass(javaClass: JavaClass, settings: ExtensionSettings): string {
  let testClassContent = generateTargetTestClassImports(javaClass);

  switch (javaClass.componentType) {
    case JavaComponentType.CONTROLLER:
      testClassContent = testClassContent + '\n@SpringBootTest(webEnvironment = WebEnvironment.RANDOM_PORT)\n';
      break;
    case JavaComponentType.SIMPLE:
      if (settings.junitDefaultVersion === '5') {
        testClassContent = testClassContent + '\n@ExtendWith(MockitoExtension.class)\n';
      } else {
        testClassContent = testClassContent + '\n@RunWith(MockitoJUnitRunner.class)\n';
      }
  }

  testClassContent = `${testClassContent}${javaClass.accessModifier}class ${javaClass.className}Test {\n`;

  let constructorArgs = '';
  if (settings.mockConstrutorParameters) {
    if (javaClass.constructorParameters && javaClass.constructorParameters.length > 0) {
      const mockAnnotation = javaClass.componentType == JavaComponentType.CONTROLLER ? '@MockBean' : '@Mock';

      for (const param of javaClass.constructorParameters) {
        const attributeName = lowercaseFirstLetter(param.name);
        if (constructorArgs.length) {
          constructorArgs += `, ${attributeName}`;
        } else {
          constructorArgs = attributeName;
        }
        testClassContent += `\t${mockAnnotation}\n\tprivate ${param.type} ${attributeName};\n`;
      }
    }
  }

  switch (javaClass.componentType) {
    case JavaComponentType.CONTROLLER:
      testClassContent += `\t@Autowired\n\tprivate TestRestTemplate restTemplate;\n`;
      break;

    case JavaComponentType.SIMPLE:
      const varName = lowercaseFirstLetter(javaClass.className);
      testClassContent += `\n\tprivate ${javaClass.className}${javaClass.classParameters} ${varName};\n
                           \t@Before${settings.junitDefaultVersion === '5' ? 'Each' : ''}
                           \tpublic void setup() {
                           \t\tthis.${varName} = new ${javaClass.className}${javaClass.classParameters}(${constructorArgs});
                           \t}\n`;

      if (settings.createTestCaseForEachMethod) {
        testClassContent = generateTestCaseForEachPublicMethod(settings, javaClass, testClassContent, varName);
      }
      break;
  }

  return testClassContent + '}\n';
}

function generateTestCaseForEachPublicMethod(
  settings: ExtensionSettings,
  javaClass: JavaClass,
  testClassContent: string,
  varName: string
): string {

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

function createDefaultTestClass(
  javaClassName: string,
  testClassName: string,
  settings: ExtensionSettings
): string {
  return `\npublic class ${testClassName} {
\tprivate ${javaClassName} cut;

\t@Before${settings.junitDefaultVersion === '5' ? 'Each' : ''}
\tpublic void setup() {
\t\tthis.cut = new ${javaClassName}();
\t}

\t@Test
\tpublic void shouldCompile() {
\t\tassertThat("Actual value", is("Expected value"));
\t}
}`;
}

function createDefaultImports(javaComponentType: JavaComponentType, settings: ExtensionSettings): string {
  let customImports = '';
  switch (javaComponentType) {
    case JavaComponentType.CONTROLLER:
      customImports = `
                      import org.springframework.beans.factory.annotation.Autowired;
                      import org.springframework.boot.test.context.SpringBootTest;
                      import org.springframework.boot.test.context.SpringBootTest.WebEnvironment;
                      import org.springframework.boot.test.mock.mockito.MockBean;
                      import org.springframework.boot.test.web.client.TestRestTemplate;
                      import org.springframework.http.HttpStatus;
                      import org.springframework.http.ResponseEntity;
                      `;
      break;
  }

  // Junit 5
  if (settings.junitDefaultVersion === '5') {
    return `\n\nimport static org.hamcrest.Matchers.*;
import static org.hamcrest.MatcherAssert.assertThat;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.*;
import org.hamcrest.CoreMatchers;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.mockito.ArgumentCaptor;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.Mock;\n${customImports}`;
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
import org.mockito.junit.MockitoJUnitRunner;
${customImports}`;
}

export function getTestFileUri(javaFileUri: vscode.Uri, testClassName: string): vscode.Uri {
  const testPath = javaFileUri.path.replace('/src/main/java', '/src/test/java');
  const testFilePath = posix.join(testPath, '..', `${testClassName}.java`);
  return javaFileUri.with({ path: testFilePath });
}

function generateTestClassPackageDeclaration(testFileUri: vscode.Uri, testClassName: string): string {
  const packageName = createPackageNameFromUri(testFileUri, testClassName, true);
  if (!packageName.length) {
    return '';
  }
  return `package ${packageName};`;
}

function generateTargetTestClassImports(javaClass: JavaClass): string {
  if (!javaClass.fileImports || !javaClass.fileImports.length) {
    return '';
  }
  return `\n` + (javaClass.fileImports.map(clazz => `import ${clazz};`).join('\n')) + `\n`;
}

async function askForJunitVersion(): Promise<string> {
  const items: Array<vscode.QuickPickItem> = [
    { label: '4', description: 'JUnit 4' },
    { label: '5', description: 'JUnit 5' }
  ];
  const inputedVersion = await vscode.window.showQuickPick(items);
  return inputedVersion?.label === '5' ? '5' : '4';
}

function capitalizeFirstLetter(string: string): string {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function lowercaseFirstLetter(string: string): string {
  return string.charAt(0).toLowerCase() + string.slice(1);
}
