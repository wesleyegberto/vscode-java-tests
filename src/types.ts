export class JavaClass {
    className: string;
    accessModifier: string;
    constructorParameters: Array<Parameter> | null;
    publicMethods: Array<Method> | null;

    constructor(className: string, accessModifier: string,
            constructorParameters: Array<Parameter> | null,
            publicMethods: Array<Method> | null) {
        this.className = className;
        this.accessModifier = accessModifier;
        this.constructorParameters = constructorParameters;
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
    parameters: Array<Parameter> | null;

    constructor(returnType: string, name: string, parameters: Array<Parameter> | null) {
        this.returnType = returnType;
        this.name = name;
        this.parameters = parameters;
    }
}