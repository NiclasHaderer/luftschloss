export const Singleton = () => {
  return <T extends { new (...args: any[]): InstanceType<T> }>(constructor: T) => {
    let instance: InstanceType<T>;
    return class {
      constructor(...args: any[]) {
        if (instance) return instance;

        instance = new constructor(...args);
        return instance as T;
      }
    } as T;
  };
};
