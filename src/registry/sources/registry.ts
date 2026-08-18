async function getRegistryBase(): Promise<string> {
  try {
    const { getConfigValue } = await import('../../core/config.js')
    return (await getConfigValue('registryUrl')) ?? 'https://skilldex-registry.vercel.app/v1'
  } catch {
    return process.env.SKILLFORGE_REGISTRY_URL ?? 'https://skilldex-registry.vercel.app/v1'
  }
}
