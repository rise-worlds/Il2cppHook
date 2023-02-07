import { mscorlib_System_Reflection_Module_impl } from "../Module/class"
import { mscorlib_System_RuntimeTypeHandle_impl } from "../RuntimeTypeHandle/class"
import { mscorlib_System_Type_impl } from "../Type/class"

class mscorlib_System_RuntimeType_impl extends mscorlib_System_Type_impl {

    // DelegateType : RuntimeType
    _DelegateType: mscorlib_System_Type_impl = new mscorlib_System_Type_impl(lfv(this.handle, "DelegateType"))
    // EnumType : RuntimeType
    _EnumType: mscorlib_System_Type_impl = new mscorlib_System_Type_impl(lfv(this.handle, "EnumType"))
    // GenericCache : Object
    GenericCache: NativePointer = lfv(this.handle, "GenericCache")
    // m_serializationCtor : RuntimeConstructorInfo
    m_serializationCtor: NativePointer = lfv(this.handle, "m_serializationCtor")
    // ObjectType : RuntimeType
    _ObjectType: mscorlib_System_Type_impl = new mscorlib_System_Type_impl(lfv(this.handle, "ObjectType"))
    // StringType : RuntimeType
    _StringType: mscorlib_System_Type_impl = new mscorlib_System_Type_impl(lfv(this.handle, "StringType"))
    // type_info : MonoTypeInfo
    type_info: NativePointer = lfv(this.handle, "type_info")
    // ValueType : RuntimeType
    _ValueType: mscorlib_System_Type_impl = new mscorlib_System_Type_impl(lfv(this.handle, "ValueType"))

    get_AssemblyQualifiedName(): string {
        return readU16(mscorlib.Api.RuntimeType._get_AssemblyQualifiedName(this.handle))
    }

    get_BaseType(): mscorlib.Type {
        return new mscorlib_System_Type_impl(mscorlib.Api.RuntimeType._get_BaseType(this.handle))
    }

    get_DeclaringType(): mscorlib.Type {
        return new mscorlib_System_Type_impl(mscorlib.Api.RuntimeType._get_DeclaringType(this.handle))
    }

    get_FullName(): string {
        return readU16(mscorlib.Api.RuntimeType._get_FullName(this.handle))
    }

    get_IsEnum(): boolean {
        return mscorlib.Api.RuntimeType._get_IsEnum(this.handle)
    }

    get_IsGenericParameter(): boolean {
        return mscorlib.Api.RuntimeType._get_IsGenericParameter(this.handle)
    }

    get_IsGenericType(): boolean {
        return mscorlib.Api.RuntimeType._get_IsGenericType(this.handle)
    }

    get_Name(): string {
        return readU16(mscorlib.Api.RuntimeType._get_Name(this.handle))
    }

    get_Namespace(): string {
        return readU16(mscorlib.Api.RuntimeType._get_Namespace(this.handle))
    }

    get_ReflectedType(): mscorlib.Type {
        return new mscorlib_System_Type_impl(mscorlib.Api.RuntimeType._get_ReflectedType(this.handle))
    }

    get_TypeHandle(): mscorlib.RuntimeTypeHandle {
        return new mscorlib_System_RuntimeTypeHandle_impl(mscorlib.Api.RuntimeType._get_TypeHandle(this.handle))
    }

    get_UnderlyingSystemType(): mscorlib.Type {
        return new mscorlib_System_Type_impl(mscorlib.Api.RuntimeType._get_UnderlyingSystemType(this.handle))
    }

    get_Module(): mscorlib.Module {
        return new mscorlib_System_Reflection_Module_impl(mscorlib.Api.RuntimeType._get_Module(this.handle))
    }
}

declare global {
    namespace mscorlib {
        class RuntimeType extends mscorlib_System_RuntimeType_impl { }
    }
}

mscorlib.RuntimeType = mscorlib_System_RuntimeType_impl

export { mscorlib_System_RuntimeType_impl }