import { getMethodDesFromMethodInfo } from "../../../bridge/fix/il2cppM"

const generateClass = (className: string, classPtr: NativePointer = ptr(0)) => {
    if (className == undefined) return
    LOGW(getLine(80))

    let clsInstance: Il2Cpp.Class

    // gen class title
    if (classPtr.isNull()) {
        clsInstance = new Il2Cpp.Class(findClass(className))
    } else {
        clsInstance = new Il2Cpp.Class(classPtr)
    }
    let clsName = clsInstance.namespace.replace('.', '_') + "_" + clsInstance.name + "_Impl"
    let clsExtend = clsInstance.parent?.namespace.replace('.', '_') + "_" + clsInstance.parent?.name + "_Impl"
    LOGD(`\nclass ${clsName} extends ${clsExtend} {\n`)
    // gen fields
    let fields = clsInstance.fields
    fields.forEach((field: Il2Cpp.Field) => {
        //     m_Transition: Transition = lfv(this.handle, "m_Transition")
        let type = repStr(field.type.name.replace('.', '_'))
        LOGD(`\t${field.name}: ${type} = lfv(this.handle, "${field.name}") as unknown as ${type}`)
    })

    // constructor(handleOrWrapper: NativePointer) {
    //     super(handleOrWrapper)
    // }
    LOGD('\tconstructor(handleOrWrapper: NativePointer) {')
    LOGD('\t\t super(handleOrWrapper)')
    LOGD('\t}')

    // gen methods
    let methods = clsInstance.methods
    let names = new Array<string>()
    methods.forEach((method: Il2Cpp.Method) => {
        // CancelInvoke_methodName(methodName: string): void {
        //     return Il2Cpp.Api.MonoBehaviour._CancelInvoke_String(this.handle, allocCStr(methodName));
        // }
        let params = method.parameters.map((param: Il2Cpp.Parameter) => {
            return param.name + ':' + param.type.name.replace('.', '_')
        }).join(', ')
        let paramNames = method.parameters.map((param: Il2Cpp.Parameter) => {
            return param.name
        }).join(', ')

        let staticStr = method.isStatic ? "static " : ""
        let sameNameFix = names.includes(method.name) ? `_${method.parameterCount}` : ""
        let line1 = `\t${staticStr}${method.name.replace('.', '_')}${sameNameFix}(${params}): ${repStr(method.returnType.name.replace('.', '_'))} {`
        line1 = repStr(line1)

        let firstParam = method.isStatic ? '' : (method.parameters.length == 0 ? 'this.handle' : 'this.handle , ')

        let methodName = '_' + method.name.replace('.', '_')
        let retValue = `${incorLib(className) ? "mscorlib" : "Il2Cpp"}.Api.${clsInstance.name}.${methodName}(${firstParam}${paramNames})`
        if (method.returnType.name == "System.String") retValue = 'readU16(' + retValue + ')'
        // else if (method.returnType.name != "System.Void" && method.returnType.name != "System.Boolean" && method.returnType.name != "System.Int32") {
        //     retValue = `new ${method.returnType.name.replace('.', '_')}(${retValue})`
        // }
        let line2 = `\t\treturn ${retValue}`
        let line3 = '\t}'
        LOGD(`${line1} \n ${line2} \n ${line3} \n`)
        names.push(method.name)
    })
    LOGD('}\n')

    newLine()

    // declare global {
    //     namespace Il2Cpp {
    //         class MonoBehaviour extends UnityEngine_MonoBehaviour_Impl { }
    //     }
    // }

    // export { UnityEngine_MonoBehaviour_Impl }

    LOGD(`${incorLib(className) ? "mscorlib" : "Il2Cpp"}.${className} = ${clsName}\n`)

    LOGD('declare global {')
    LOGD(`\tnamespace ${incorLib(className) ? "mscorlib" : "Il2Cpp"}{`)
    LOGD(`\t\tclass ${className} extends ${clsName} { }`)
    LOGD('\t}')
    LOGD('}\n')
    LOGD(`export { ${clsName} } `)
    // LOGD(`export { ${clsName} as ${className}} `)

    newLine()

    LOGW(getLine(80))
}

const repStr = (str: string): string => {
    return str
    // .replace('System_Void', 'void')
    // .replace('System_String', 'string')
    // .replace('System_Int32', 'number')
    // .replace('System_Int64', 'number')
    // .replace('System_Single', 'number')
    // .replace('System_Double', 'number')
    // .replace('System_Boolean', 'boolean')
}

globalThis.incorLib = (name: string) => {
    let corLib: boolean = false
    Il2Cpp.Domain.assembly('mscorlib').image.classes.forEach((cls: Il2Cpp.Class) => {
        if (cls.name == name) corLib = true
    })
    return corLib
}

const generateApi = (className: string, classPtr: NativePointer = ptr(0)) => {
    if (className == undefined) return
    LOGW(getLine(80))

    let clsInstance: Il2Cpp.Class

    // gen class title
    if (classPtr.isNull()) {
        clsInstance = new Il2Cpp.Class(findClass(className))
    } else {
        clsInstance = new Il2Cpp.Class(classPtr)
    }

    // gen class title
    let clsName = clsInstance.namespace.replace('.', '_') + "_" + clsInstance.name + "_API"

    // import { cache } from "decorator-cache-getter"
    LOGD(`import { cache } from "decorator-cache-getter"\n`)
    // class ApplicationApi {
    LOGD(`class ${clsName} {`)

    // @cache
    // static get _CancelInvoke() {
    //     // CancelInvoke() : Void
    //     return Il2Cpp.Api.t("UnityEngine.CoreModule", "UnityEngine.MonoBehaviour", "CancelInvoke", 0, "void", ["pointer"]);
    // }

    // gen methods
    let methods = clsInstance.methods
    let names = new Array<string>()
    methods.forEach((method: Il2Cpp.Method) => {
        LOGZ(`\t// ${getMethodDesFromMethodInfo(method)}`)
        // 静态函数没有第一个pointer
        let param = ''
        if (!method.isStatic) param += `"pointer"`

        for (let i = 0; i < method.parameters.length; i++) {
            param += `,"pointer"`
        }
        if (param.startsWith(',')) param = param.substring(1)
        param = `[${param}]`
        LOGD(`\t@cache`)

        let disPName = method.name.replace('.', '_')
        if (names.includes(method.name)) {
            let addName = method.parameters.map((param: Il2Cpp.Parameter) => param.name).join('_')
            disPName += '_' + addName
        }

        LOGD(`\tstatic get _${disPName}() {`)
        let retName = method.returnType.name
        if (retName == "System.Void") retName = 'void'
        else retName = 'pointer'
        let classNameSpace = method.class.namespace.length == 0 ? "" : `${method.class.namespace}.`
        if (false && !names.includes(method.name)) {
            LOGD(`\t\treturn Il2Cpp.Api.t("${method.class.image.assembly.name}", "${classNameSpace}${className}", "${method.name}", ${method.parameters.length}, "${retName}", ${param})`)
        } else {
            // 重名函数
            // return Il2Cpp.Api.o("UnityEngine.CoreModule", "UnityEngine.MonoBehaviour", "StartCoroutine", 1, ["System.Collections.IEnumerator"], "pointer", ["pointer", "pointer"]);
            let paramTypes = `[${method.parameters.map((param: Il2Cpp.Parameter) => `"${param.type.name}"`).join(',')}]`
            LOGD(`\t\treturn Il2Cpp.Api.o("${method.class.image.assembly.name}", "${classNameSpace}${className}", "${method.name}", ${method.parameters.length}, ${paramTypes}, "${retName}", ${param})`)
        }
        LOGD('\t}\n')

        names.push(method.name)
    })
    LOGD('}\n')

    // declare global {
    //     namespace Il2Cpp.Api {
    //         class MonoBehaviour extends MonoBehaviourAPI { }
    //     }
    // }

    // Il2Cpp.Api.MonoBehaviour = MonoBehaviourAPI;

    // export { }


    LOGE(`Il2Cpp.Api.${className} = ${clsName}\n`)

    LOGD('declare global {')
    LOGD(`\tnamespace ${incorLib(className) ? "mscorlib" : "Il2Cpp"}.Api{`)
    LOGD(`\t\tclass ${className} extends ${clsName} { }`)
    LOGD('\t}')
    LOGD('}\n')
    LOGD(`export { }\n`)

    LOGW(getLine(80))
}

const generateFieldEnum = (className: string, classPtr: NativePointer = ptr(0)) => {
    LOGW(getLine(80))

    let clsInstance: Il2Cpp.Class

    // gen class title
    if (classPtr.isNull()) {
        clsInstance = new Il2Cpp.Class(findClass(className))
    } else {
        clsInstance = new Il2Cpp.Class(classPtr)
    }

    // export enum UnityEngine_ColorSpace {
    //     Gamma = 0,
    //     Linear = 1,
    //     Uninitialized = -1
    // }

    LOGE(`export enum ${clsInstance.namespace.replace('.', '_')}_${clsInstance.name} {`)
    clsInstance.fields.forEach((field: Il2Cpp.Field) => {
        Il2Cpp.Api._typeGetTypeEnum
        LOGD(`\t${field.name} = ${field}`)
    })
    LOGO(`}\n`)
}

declare global {
    var generateClass: (className: string, classPtr?: NativePointer) => void
    var generateApi: (className: string, classPtr?: NativePointer) => void
    var generateFieldEnum: (className: string, classPtr?: NativePointer) => void
    var incorLib: (name: string) => boolean
}

globalThis.generateClass = generateClass
globalThis.generateApi = generateApi
globalThis.generateFieldEnum = generateFieldEnum
globalThis.incorLib = incorLib

export { }

