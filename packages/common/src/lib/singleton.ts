export const Singleton = () => {
  return <T extends { new (...args: any[]): InstanceType<T> }>(constructor: T) => {
    let instance: InstanceType<T>;
    const newConstructor: any = function (...args: any[]) {
      if (!instance) {
        instance = new constructor(...args);
      }
      return instance;
    };
    newConstructor.prototype = constructor.prototype;
    return newConstructor;
  };
};
