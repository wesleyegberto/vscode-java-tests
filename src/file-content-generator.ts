import * as vscode from 'vscode';
import { parseJavaClassesFromFile } from './class-parser';
import { JavaClass } from './types';

export async function generateTestClassFileContent(
  javaFileUri: vscode.Uri,
  javaClassName: string,
  testFileUri: vscode.Uri,
  testClassName: string
) {
  const packageDeclaration = generateTestClassPackageDeclaration(testFileUri, testClassName);

  const javaClasses = await parseJavaClassesFromFile(javaFileUri);
  console.log(javaClasses);

  let fileContent = packageDeclaration + createDefaultImports();

  if (javaClasses && javaClasses.length > 0) {
    // find (or set) a public class (required by JUnit)
    let publicClass = javaClasses.find(c => c.accessModifier.startsWith('public'));
    if (!publicClass) {
      publicClass = javaClasses[0];
      publicClass.accessModifier = 'public ';
    }

    fileContent += createTestClass(publicClass);

  } else {
    fileContent += createDefaultTestClass(javaClassName, testClassName);
  }

  return Buffer.from(fileContent, 'utf8');
}

function createTestClass(javaClass: JavaClass) {
  const varName = lowercaseFirstLetter(javaClass.className);

  let testClassContent = `\n@RunWith(MockitoJUnitRunner.class)\n${javaClass.accessModifier}class ${javaClass.className}Test {\n`;

  let constructorArgs = '';
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

  testClassContent += `\n\tprivate ${javaClass.className} ${varName};

\t@Before
\tpublic void setup() {
\t\tthis.${varName} = new ${javaClass.className}(${constructorArgs});
\t}\n`;

  if (javaClass.publicMethods && javaClass.publicMethods.length) {
    for (const method of javaClass.publicMethods) {
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

      testClassContent += `${varName}.${method.name}(${methodArgs});\n\n\t\t// TODO: assert scenario\n\t}\n`;
    }

  } else {
    testClassContent += `\t@Test
\tpublic void shouldCompile() {
\t\tassertThat("Actual value", is("Expected value"));
\t}\n`;
  }

  return testClassContent + '}\n';
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

function createDefaultImports() {
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

function capitalizeFirstLetter(string: string): string {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function lowercaseFirstLetter(string: string): string {
  return string.charAt(0).toLowerCase() + string.slice(1);
}
