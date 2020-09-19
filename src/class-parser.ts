import * as vscode from 'vscode';
import { parse, ParseTree, ClassBodyDeclarationContext, FormalParametersContext, ModifierContext, ClassDeclarationContext, TypeDeclarationContext, MethodDeclarationContext } from 'java-ast';
import { Parameter, Method, JavaClass } from './types';

type TargetClassOrNull = Array<JavaClass> | null;

export async function parseJavaClassesFromFile(javaFileUri: vscode.Uri): Promise<TargetClassOrNull> {
  const javaSourceCodeBuffer = await vscode.workspace.fs.readFile(javaFileUri);
  const javaSourceCode = Buffer.from(javaSourceCodeBuffer).toString();
  return parseJavaClassesFromSourceCode(javaSourceCode);
}

export function parseJavaClassesFromSourceCode(javaSourceCode: string): TargetClassOrNull {
  let parsedCode: ParseTree | null = null;
  try {
    parsedCode = parse(javaSourceCode);
  } catch (error) {
    console.error(error);
    vscode.window.showErrorMessage('Error during file parsing, test class will be generated with only class name');
    return null;
  }

  if (!parsedCode) {
    return null;
  }

  return buildJavaClassesFromParseTree(parsedCode);
}

function buildJavaClassesFromParseTree(parsedCode: ParseTree) {
  const classesDeclarations: Array<JavaClass> = [];

  parsedCode.typeDeclaration()
    .forEach(type => {
      if (!type.classDeclaration() || !type.classDeclaration()!.classBody()) {
        return;
      }

      const classDeclaration = type.classDeclaration()!;
      const targetClass = buildJavaClassDefinition(type, classDeclaration);
      if (!targetClass) {
        return;
      }
      classesDeclarations.push(targetClass);
    });

  return classesDeclarations;
}

function buildJavaClassDefinition(type: TypeDeclarationContext, classDeclaration: ClassDeclarationContext): JavaClass | undefined {
  let accessModifier: string = '';

  if (type.classOrInterfaceModifier()) {
    type.classOrInterfaceModifier().forEach(c => {
      if (c.PUBLIC()) {
        // extra space to facilitate the file write
        accessModifier = 'public ';
      }
    });
  }

  let classDependencies: Array<Parameter> | null = null;
  // const classFieldsNames: Array<string> = [];
  const classMethods: Array<Method> = [];

  classDeclaration.classBody()!
    .classBodyDeclaration()
    .forEach((classBody: ClassBodyDeclarationContext) => {
      if (!classBody || !classBody.memberDeclaration()) {
        return;
      }

      const memberDeclaration = classBody.memberDeclaration()!;
      /*
      if (memberDeclaration.fieldDeclaration()) {
        memberDeclaration.fieldDeclaration()!
          .variableDeclarators()
          .variableDeclarator()
          .forEach(field => classFieldsNames.push(field.variableDeclaratorId().IDENTIFIER().text));
      }
      */

      // will get only the first non-private constructor
      if (!classDependencies && memberDeclaration.constructorDeclaration()) {
        if (hasPrivateAccessModifier(classBody.modifier())) {
          return;
        }
        classDependencies = extractParameters(
          memberDeclaration.constructorDeclaration()!.formalParameters()
        );
      }

      if (memberDeclaration.methodDeclaration()) {
        // we will only test public methods (API)
        if (!hasPublicAccessModifier(classBody.modifier())) {
          return;
        }

        try {
          const method = memberDeclaration.methodDeclaration()!;
          const methodParameters = extractParameters(method.formalParameters());

          if (isSetter(method, methodParameters)) {
            return;
          }

          classMethods.push(new Method(method.typeTypeOrVoid().text, method.IDENTIFIER().text, methodParameters));
        } catch (err) {
          console.error('Error handling body ', classBody.text, err);
        }
      }
    });

  const targetClass = new JavaClass(
    classDeclaration.IDENTIFIER().text,
    classDeclaration.typeParameters()?.text,
    accessModifier,
    classDependencies,
    classMethods
  );
  return targetClass;
}

// TODO: improve to check the parameters and fields
function isSetter(method: MethodDeclarationContext, methodParameters: Parameter[] | null) {
  return method.IDENTIFIER().text.startsWith('set')
    && methodParameters && methodParameters.length === 1
    && method.typeTypeOrVoid().VOID();
}

function hasPublicAccessModifier(modifiers: ModifierContext[] | undefined): boolean {
  if (!modifiers) {
    return false;
  }
  return modifiers.findIndex(member => member.classOrInterfaceModifier()?.PUBLIC()) >= 0;
}

function hasPrivateAccessModifier(modifiers: ModifierContext[] | undefined): boolean {
  if (!modifiers) {
    return false;
  }
  return modifiers.findIndex(member => member.classOrInterfaceModifier()?.PRIVATE()) >= 0;
}

function extractParameters(formalParameters: FormalParametersContext): Array<Parameter> | null {
  try {
    const constructorParams = formalParameters.formalParameterList();
    if (!constructorParams) {
      return null;
    }

    return constructorParams.formalParameter()
        .map(p => new Parameter(p.typeType().text, p.variableDeclaratorId().IDENTIFIER().text));
  } catch (error) {
    console.error('Error to extract parameters from ', formalParameters.text, ':', error);
    return null;
  }
}
