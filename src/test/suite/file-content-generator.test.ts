import * as assert from 'assert';

import { createTestClass } from '../../file-content-generator';
import { ExtensionSettings } from '../../vscode-settings';
import { JavaClassBuilder, emptyClass } from './scenario-builder';
import { Parameter } from '../../types';

suite('File Content Generator', () => {
  test('Should generate test for an empty class', async () => {
    const javaClass = emptyClass();

    const testClassFileContent = createTestClass(javaClass, createSettings());

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

  test('Should generate test for a class with imports', async () => {
    const javaClass = new JavaClassBuilder()
      .withImport('java.util.Random')
      .withImport('java.util.Map')
      .build();

    const testClassFileContent = createTestClass(javaClass, createSettings());

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

  test('Should generate a test class for a controller', async () => {
    const javaClass = new JavaClassBuilder()
      .controller()
      .withName('PetsController')
      .build();

    const testClassFileContent = createTestClass(javaClass, createSettings());

    const expectedTestClassContent = `@SpringBootTest(webEnvironment = WebEnvironment.RANDOM_PORT)
public class PetsControllerTest {
\t@Autowired
\tprivate TestRestTemplate restTemplate;
}
`;

    assert.equal(testClassFileContent.replace(/\s/g, ''), expectedTestClassContent.replace(/\s/g, ''));
  });

  test('Should generate a test class for a controller with dependency', async () => {
    const javaClass = new JavaClassBuilder()
      .controller()
      .withName('PetsController')
      .withConstructorParameter(new Parameter('PetRepository', 'pets'))
      .build();

    const testClassFileContent = createTestClass(javaClass, createSettings(true));

    const expectedTestClassContent = `@SpringBootTest(webEnvironment = WebEnvironment.RANDOM_PORT)
public class PetsControllerTest {
\t@MockBean
\tprivate PetRepository pets;
\t@Autowired
\tprivate TestRestTemplate restTemplate;
}
`;

    assert.equal(testClassFileContent.replace(/\s/g, ''), expectedTestClassContent.replace(/\s/g, ''));
  });
});

function createSettings(mockConstrutorParameters = false): ExtensionSettings {
  return {
    fileOpenLocation: 'beside',
    mockConstrutorParameters: mockConstrutorParameters,
    createTestCaseForEachMethod: true,
    ignoreStaticMethodTestCase: true,
    junitDefaultVersion: '5'
  } as ExtensionSettings;
}
