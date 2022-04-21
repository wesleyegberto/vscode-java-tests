import * as assert from 'assert';

import { JavaClass, Parameter, Method } from '../../types';
import { createTestClass } from '../../file-content-generator';
import { ExtensionSettings } from '../../vscode-settings';

suite('File Content Generator', () => {
  test('Should generate test for an empty class', async () => {
    const javaClass = new JavaClass(
      'EmptyClass',
      '',
      'public ',
      [],
      []
    );
    const settings = {
      fileOpenLocation: 'beside',
      mockConstrutorParameters: false,
      createTestCaseForEachMethod: true,
      ignoreStaticMethodTestCase: true,
      junitDefaultVersion: '5'
    } as ExtensionSettings;

    const testClassFileContent = createTestClass(javaClass, settings);

    const expectedTestClassContent = `\n
@ExtendWith(MockitoExtension.class)
public class EmptyClassTest {
\tprivate EmptyClass emptyClass;

\t@BeforeEach
\tpublic void setup() {
\t\tthis.emptyClass = new EmptyClass();
\t}
\t@Test
\tpublic void shouldCompile() {
\t\tassertThat("Actual value", is("Expected value"));
\t}
}
`;

    assert.equal(testClassFileContent.replace(/\s/g, ''), expectedTestClassContent.replace(/\s/g, ''));
  });

  test('Should generate for a class with importing', async () => {
    const javaClass = new JavaClass(
      'EmptyClass',
      '',
      'public ',
      [],
      []
    );
    javaClass.fileImports = ['java.util.Random', 'java.util.Map'];

    const settings = {
      fileOpenLocation: 'beside',
      mockConstrutorParameters: false,
      createTestCaseForEachMethod: true,
      ignoreStaticMethodTestCase: true,
      junitDefaultVersion: '5'
    } as ExtensionSettings;

    const testClassFileContent = createTestClass(javaClass, settings);

    const expectedTestClassContent = `import java.util.Random;\nimport java.util.Map;\n
@ExtendWith(MockitoExtension.class)
public class EmptyClassTest {
\tprivate EmptyClass emptyClass;

\t@BeforeEach
\tpublic void setup() {
\t\tthis.emptyClass = new EmptyClass();
\t}
\t@Test
\tpublic void shouldCompile() {
\t\tassertThat("Actual value", is("Expected value"));
\t}
}
`;

    assert.equal(testClassFileContent.replace(/\s/g, ''), expectedTestClassContent.replace(/\s/g, ''));
  });

});
