import * as assert from 'assert';

import { parseJavaClassesFromSourceCode } from '../../class-parser';
import { JavaClass, Parameter, Method } from '../../types';

suite('Class Parser', () => {
  test('should parse a empty class with public visibility', () => {
      const sourceCode = 'public class EmptyClass {}';

      const parsedClasses = parseJavaClassesFromSourceCode(sourceCode);

      assertClassStructure(parsedClasses, 'EmptyClass', 'public ');
  });

  test('Should parse a empty class with package visibility', () => {
    const sourceCode = 'class EmptyClass {}';

    const parsedClass = parseJavaClassesFromSourceCode(sourceCode);

    assertClassStructure(parsedClass, 'EmptyClass', '');
  });

  test('Should parse a class with a empty constructor', () => {
    const sourceCode = 'public class SingleConstructor { public SingleConstructor() {} }';

    const parsedClass = parseJavaClassesFromSourceCode(sourceCode);

    assertClassStructure(parsedClass, 'SingleConstructor', 'public ');
  });

  test('Should parse a class with an one-arg constructor', () => {
    const sourceCode = 'public class SingleConstructor { public SingleConstructor(int param) {} }';

    const parsedClass = parseJavaClassesFromSourceCode(sourceCode);

    assertClassStructure(parsedClass, 'SingleConstructor', 'public ', [new Parameter('int', 'param')]);
  });

  test('Should parse a class with two-arg constructor', () => {
    const sourceCode = 'public class SingleConstructor { public SingleConstructor(int param, String anotherParam) {} }';

    const parsedClass = parseJavaClassesFromSourceCode(sourceCode);

    assertClassStructure(parsedClass, 'SingleConstructor', 'public ', [
      new Parameter('int', 'param'),
      new Parameter('String', 'anotherParam')
    ]);
  });

  test('Should ignore private constructor', () => {
    const sourceCode = 'public class PrivateConstructor { private PrivateConstructor(int param) {} }';

    const parsedClass = parseJavaClassesFromSourceCode(sourceCode);

    assertClassStructure(parsedClass, 'PrivateConstructor', 'public ');
  });

  test('Should parse a classe with one no-arg method', () => {
    const sourceCode = 'public class NoArgMethod { public void noArgMethod() {} }';

    const parsedClass = parseJavaClassesFromSourceCode(sourceCode);

    assertClassStructure(parsedClass, 'NoArgMethod', 'public ', [], [
      new Method('void', 'noArgMethod', null)
    ]);
  });

  test('Should parse a classe with one arg method', () => {
    const sourceCode = 'public class OneArgMethod { public void oneArgMethod(int param) {} }';

    const parsedClass = parseJavaClassesFromSourceCode(sourceCode);

    assertClassStructure(parsedClass, 'OneArgMethod', 'public ', [], [
      new Method('void', 'oneArgMethod', [ new Parameter('int', 'param') ])
    ]);
  });

  test('Should parse a classe with two arg method', () => {
    const sourceCode = 'public class TwoArgMethod { public void twoArgMethod(int param, List<String> params) {} }';

    const parsedClass = parseJavaClassesFromSourceCode(sourceCode);

    assertClassStructure(parsedClass, 'TwoArgMethod', 'public ', [], [
      new Method('void', 'twoArgMethod', [
        new Parameter('int', 'param'),
        new Parameter('List<String>', 'params')
      ])
    ]);
  });

  test('Should parse a classe with a constructor and a method', () => {
    const sourceCode = 'public class SimpleClass { public SimpleClass() {} public void aMethod() {} }';

    const parsedClass = parseJavaClassesFromSourceCode(sourceCode);

    assertClassStructure(parsedClass, 'SimpleClass', 'public ', [], [
      new Method('void', 'aMethod', null)
    ]);
  });

  test('Should parse a classe with arg constructor and a method', () => {
    const sourceCode = 'public class SimpleClass { public SimpleClass(int param) {} public void aMethod(int param) {} }';

    const parsedClass = parseJavaClassesFromSourceCode(sourceCode);

    assertClassStructure(parsedClass, 'SimpleClass', 'public ', [
      new Parameter('int', 'param')
    ], [
      new Method('void', 'aMethod', [ new Parameter('int', 'param') ])
    ]);
  });

  test('Should parse a generic type', () => {
    const sourceCode = 'public class TypedClass<T> {}';

    const parsedClass = parseJavaClassesFromSourceCode(sourceCode);

    assertClassStructure(parsedClass, 'TypedClass', 'public ', [], [], '<T>');
  });

  test('Should parse a class with imports', () => {
    const sourceCode = 'import java.util.List;import java.util.Map; public class MyCustomList { private List<Object> list; private Map<String, String> fields; }';

    const parsedClass = parseJavaClassesFromSourceCode(sourceCode);

    assertClassStructure(parsedClass, 'MyCustomList', 'public ', [], [], '', ['java.util.List','java.util.Map']);
  });

});

function assertClassStructure(
  parsedClasses: JavaClass[] | null,
  className: string,
  accessModifier: string,
  constructorParameters: Array<Parameter> = [],
  publicMethods: Array<Method> = [],
  classParameter: string = '',
  fileImports: Array<string> | null = null,
) {
  assert(parsedClasses);
  const parsedClass = parsedClasses[0];
  assert.strictEqual(parsedClasses?.length, 1);
  assert.strictEqual(parsedClass.className, className);
  assert.strictEqual(parsedClass.classParameters, classParameter);
  assert.strictEqual(parsedClass.accessModifier, accessModifier);
  assert.strictEqual(parsedClass.constructorParameters.length, constructorParameters.length);
  assert.deepStrictEqual(parsedClass.constructorParameters, constructorParameters);
  assert.deepStrictEqual(parsedClass.publicMethods, publicMethods);
  assert.deepStrictEqual(parsedClass.fileImports, fileImports);
}
