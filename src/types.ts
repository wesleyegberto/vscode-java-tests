export class JavaClass {
  componentType: JavaComponentType = JavaComponentType.SIMPLE;
  className: string;
  classParameters: string;
  accessModifier: string;
  constructorParameters: Array<Parameter>;
  publicMethods: Array<Method>;
  fileImports: Array<String> | null = null;

  constructor(
    className: string,
    classParameters: string | undefined,
    accessModifier: string,
    constructorParameters: Array<Parameter> | null,
    publicMethods: Array<Method>
  ) {
    this.className = className;
    this.classParameters = classParameters || '';
    this.accessModifier = accessModifier;
    this.constructorParameters = constructorParameters || [];
    this.publicMethods = publicMethods;
  }
}

export class Parameter {
  type: string;
  name: string;

  constructor(type: string, name: string) {
    this.type = type;
    this.name = name;
  }
}

export class Method {
  returnType: string;
  name: string;
  parameters: Array<Parameter>;
  isStatic: boolean;

  constructor(
    returnType: string,
    name: string,
    parameters: Array<Parameter> | null,
    isStatic: boolean = false
  ) {
    this.returnType = returnType;
    this.name = name;
    this.parameters = parameters || [];
    this.isStatic = isStatic;
  }
}

export enum JavaComponentType {
  SIMPLE = 'SIMPLE',
  CONTROLLER = 'CONTROLLER',
}

