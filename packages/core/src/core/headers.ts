export class Headers {
  public constructor(private headers: Record<string, string[]> = {}) {}

  public append(name: string, value: string): void {
    if (!(name in this.headers)) {
      this.headers[name] = []
    }
    this.headers[name].push(value)
  }

  public delete(name: string): void {
    delete this.headers[name]
  }

  public entries(): [string, string[]][] {
    return Object.entries(this.headers)
  }

  public get(name: string): string[] {
    if (name in this.headers) return this.headers[name]
    return []
  }

  public has(name: string): boolean {
    return name in this.headers && this.headers[name].length > 0
  }

  public keys(): string[] {
    return Object.keys(this.headers)
  }

  public values(): string[][] {
    return Object.values(this.headers)
  }

  public encode(): Record<string, string> {
    const encodedHeaders: Record<string, string> = {}
    for (const [name, value] of this.entries()) {
      encodedHeaders[name] = value.join(", ")
    }
    return encodedHeaders
  }
}
