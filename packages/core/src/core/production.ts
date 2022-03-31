let production: boolean | undefined

export const isProduction = (): boolean => {
  if (typeof production !== "boolean") {
    const prodEnv = (process.env.production || "false").toLowerCase()
    production = prodEnv === "true"
  }
  return production
}
