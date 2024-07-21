import { JavaClass, JavaComponentType, Parameter, Method } from "../../types";

export function emptyClass(): JavaClass {
  return new JavaClass(
    'EmptyClass',
    '',
    'public ',
    [],
    []
  );
}

export class JavaClassBuilder {
  private _componentType: JavaComponentType;
  private _className: string;
  private _classParameters: string;
  private _accessModifier: string;
  private _constructorParameters: Array<Parameter>;
  private _publicMethods: Array<Method>;
  private _fileImports: Array<String> | null = null;

  public constructor() {
    this._componentType = JavaComponentType.SIMPLE;
    this._className = 'EmptyClass';
    this._classParameters = '';
    this._accessModifier = 'public ';
    this._constructorParameters = [];
    this._publicMethods = [];
    this._fileImports = null;
  }

  public controller(): JavaClassBuilder {
    this._componentType = JavaComponentType.CONTROLLER;
    return this;
  }

  public withName(className: string): JavaClassBuilder {
    this._className = className;
    return this;
  }

  public withConstructorParameter(parameter: Parameter): JavaClassBuilder {
    if (!this._constructorParameters) {
      this._constructorParameters = [];
    }
    this._constructorParameters.push(parameter);
    return this;
  }

  public withPublicMethod(method: Method): JavaClassBuilder {
    if (!this._publicMethods) {
      this._publicMethods = [];
    }
    this._publicMethods.push(method);
    return this;
  }

  public withImport(javaImport: string): JavaClassBuilder {
    if (!this._fileImports) {
      this._fileImports = [];
    }
    this._fileImports.push(javaImport);
    return this;
  }

  public build(): JavaClass {
    const javaClass = new JavaClass(
      this._className,
      this._classParameters,
      this._accessModifier,
      this._constructorParameters,
      this._publicMethods
    );
    javaClass.componentType = this._componentType;
    javaClass.fileImports = this._fileImports;
    return javaClass;
  }
}
