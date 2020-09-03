import * as assert from 'assert';

import { parseJavaClassesFromSourceCode } from '../../class-parser';
import {JavaClass, Parameter, Method} from '../../types';

suite('Class Parser', () => {
    test('should parse a empty class with public visibility', async () => {
        const sourceCode = 'public class EmptyClass {}';

        const parsedClasses = await parseJavaClassesFromSourceCode(sourceCode);

        assertClassStructure(parsedClasses, 'EmptyClass', 'public ');
    });

    test('Should parse a empty class with package visibility', async () => {
      const sourceCode = 'class EmptyClass {}';

      const parsedClass = await parseJavaClassesFromSourceCode(sourceCode);

      assertClassStructure(parsedClass, 'EmptyClass', '');
    });

    test('Should parse a class with a empty constructor', async () => {
      const sourceCode = 'public class SingleConstructor { public SingleConstructor() {} }';

      const parsedClass = await parseJavaClassesFromSourceCode(sourceCode);

      assertClassStructure(parsedClass, 'SingleConstructor', 'public ');
    });

    test('Should parse a class with an one-arg constructor', async () => {
      const sourceCode = 'public class SingleConstructor { public SingleConstructor(int param) {} }';

      const parsedClass = await parseJavaClassesFromSourceCode(sourceCode);

      assertClassStructure(parsedClass, 'SingleConstructor', 'public ', [new Parameter('int', 'param')]);
    });

    test('Should parse a class with two-arg constructor', async () => {
      const sourceCode = 'public class SingleConstructor { public SingleConstructor(int param, String anotherParam) {} }';

      const parsedClass = await parseJavaClassesFromSourceCode(sourceCode);

      assertClassStructure(parsedClass, 'SingleConstructor', 'public ', [
        new Parameter('int', 'param'),
        new Parameter('String', 'anotherParam')
      ]);
    });

    test('Should ignore private constructor', async () => {
      const sourceCode = 'public class PrivateConstructor { private PrivateConstructor(int param) {} }';

      const parsedClass = await parseJavaClassesFromSourceCode(sourceCode);

      assertClassStructure(parsedClass, 'PrivateConstructor', 'public ');
    });

    test('Should parse a classe with one no-arg method', async () => {
      const sourceCode = 'public class NoArgMethod { public void noArgMethod() {} }';

      const parsedClass = await parseJavaClassesFromSourceCode(sourceCode);

      assertClassStructure(parsedClass, 'NoArgMethod', 'public ', [], [
        new Method('void', 'noArgMethod', null)
      ]);
    });

    test('Should parse a classe with one arg method', async () => {
      const sourceCode = 'public class OneArgMethod { public void oneArgMethod(int param) {} }';

      const parsedClass = await parseJavaClassesFromSourceCode(sourceCode);

      assertClassStructure(parsedClass, 'OneArgMethod', 'public ', [], [
        new Method('void', 'oneArgMethod', [ new Parameter('int', 'param') ])
      ]);
    });

    test('Should parse a classe with two arg method', async () => {
      const sourceCode = 'public class TwoArgMethod { public void twoArgMethod(int param, List<String> params) {} }';

      const parsedClass = await parseJavaClassesFromSourceCode(sourceCode);

      assertClassStructure(parsedClass, 'TwoArgMethod', 'public ', [], [
        new Method('void', 'twoArgMethod', [
          new Parameter('int', 'param'),
          new Parameter('List<String>', 'params')
        ])
      ]);
    });

    test('Should parse a classe with a constructor and a method', async () => {
      const sourceCode = 'public class SimpleClass { public SimpleClass() {} public void aMethod() {} }';

      const parsedClass = await parseJavaClassesFromSourceCode(sourceCode);

      assertClassStructure(parsedClass, 'SimpleClass', 'public ', [], [
        new Method('void', 'aMethod', null)
      ]);
    });

    test('Should parse a classe with arg constructor and a method', async () => {
      const sourceCode = 'public class SimpleClass { public SimpleClass(int param) {} public void aMethod(int param) {} }';

      const parsedClass = await parseJavaClassesFromSourceCode(sourceCode);

      assertClassStructure(parsedClass, 'SimpleClass', 'public ', [
        new Parameter('int', 'param')
      ], [
        new Method('void', 'aMethod', [ new Parameter('int', 'param') ])
      ]);
    });

    test('Should parse a generic type', async () => {
      const sourceCode = 'public class TypedClass<T> {}';

      const parsedClass = await parseJavaClassesFromSourceCode(sourceCode);

      assertClassStructure(parsedClass, 'TypedClass<T>', 'public ');
  });
});

function assertClassStructure(parsedClasses: JavaClass[] | null, className: string, accessModifier: string,
                             constructorParameters: Array<Parameter> = [],
                             publicMethods: Array<Method> = []) {
  assert(parsedClasses);
  const parsedClass = parsedClasses[0];
  assert.equal(parsedClasses?.length, 1);
  assert.equal(parsedClass.className, className);
  assert.equal(parsedClass.accessModifier, accessModifier);
  assert.equal(parsedClass.constructorParameters.length, constructorParameters.length);
  assert.deepStrictEqual(parsedClass.constructorParameters, constructorParameters);
  assert.deepStrictEqual(parsedClass.publicMethods, publicMethods);
}
