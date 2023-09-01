import { InternalLuftBaseType, InternalParsingResult, LuftType } from "./base-types";
import { ParsingContext } from "../parsing-context";

export class LuftLazy<T = unknown> extends LuftType<T> {
  public override readonly schema: { typeFactory: () => LuftType<T> };

  constructor(typeFactory: () => LuftType<T>) {
    super();
    this.schema = { typeFactory: typeFactory };
  }

  public get supportedTypes(): string[] {
    return this.schema.typeFactory().supportedTypes;
  }

  private get delegate(): LuftType<T> {
    return this.schema.typeFactory();
  }

  public clone(): LuftLazy<T> {
    return new LuftLazy(this.schema.typeFactory).replaceValidationStorage(this.validationStorage);
  }

  protected _coerce(data: unknown, context: ParsingContext): InternalParsingResult<any> {
    return (this.delegate as unknown as InternalLuftBaseType<any>).run(data, context, false);
  }

  protected _validate(data: unknown, context: ParsingContext): InternalParsingResult<any> {
    return (this.delegate as unknown as InternalLuftBaseType<any>).run(data, context, false);
  }
}
