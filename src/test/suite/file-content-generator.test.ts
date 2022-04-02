import * as assert from 'assert';

import { JavaClass, Parameter, Method } from '../../types';
import { createTestClass } from '../../file-content-generator';
import { ExtensionSettings } from '../../vscode-settings';

suite('Class Parser', () => {
  test('Should generate a empty class', async () => {
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

    const testClassFileContent = await createTestClass(javaClass, settings);

    assert.strictEqual(testClassFileContent, 'public class EmptyClassTest {}');
  });
});
