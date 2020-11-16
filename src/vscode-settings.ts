import * as vscode from 'vscode';

export enum JavaTestsSettingsKeys {
  FILE_OPEN_LOCATION = 'file.openLocation',
  MOCK_CONSTRUCTOR_PARAMETERS = 'template.mockConstructorParameters',
  CREATE_TEST_CASE_FOR_EACH_METHOD = 'template.createTestCaseForEachMethod',
  IGNORE_STATIC_METHOD_TEST_CASE = 'template.ignoreStaticMethodsInTestCase'
}

export interface ExtensionSettings {
  fileOpenLocation: string;
  mockConstrutorParameters: boolean;
  createTestCaseForEachMethod: boolean;
  ignoreStaticMethodTestCase: boolean;
}

export function readConfigurationValue(key: string, defaultValue: string) {
  const config = vscode.workspace.getConfiguration('javaTests');
  return config.get(key, defaultValue);
}

export function getExtensionConfiguration(): ExtensionSettings {
  return {
    fileOpenLocation: readConfigurationValue(JavaTestsSettingsKeys.FILE_OPEN_LOCATION, 'beside'),
    mockConstrutorParameters: readConfigurationValue(JavaTestsSettingsKeys.MOCK_CONSTRUCTOR_PARAMETERS, 'Yes') === 'Yes',
    createTestCaseForEachMethod: readConfigurationValue(JavaTestsSettingsKeys.CREATE_TEST_CASE_FOR_EACH_METHOD, 'Yes') === 'Yes',
    ignoreStaticMethodTestCase: readConfigurationValue(JavaTestsSettingsKeys.IGNORE_STATIC_METHOD_TEST_CASE, 'No') === 'Yes',
  } as ExtensionSettings;
}
