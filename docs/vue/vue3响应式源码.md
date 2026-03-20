# vue3响应式源码

```js
// 用于存储所有响应式对象的依赖关系
// WeakMap: 键是目标对象，值是一个 Map（属性 -> 依赖集合）
const targetMap = new WeakMap();

// 当前正在执行的副作用函数
let activeEffect = null;

/**
 * 将普通对象转换为响应式对象
 * 使用 Proxy 拦截 get/set 操作
 */
function reactive(target) {
  const handler = {
    get(target, key, receiver) {
      // 收集依赖
      track(target, key);
      // 返回属性值，确保 this 指向正确
      return Reflect.get(target, key, receiver);
    },
    set(target, key, value, receiver) {
      const oldValue = target[key];
      const result = Reflect.set(target, key, value, receiver);
      if (oldValue !== value) {
        // 值发生变化时触发更新
        trigger(target, key);
      }
      return result;
    },
  };
  return new Proxy(target, handler);
}

/**
 * 在 get 拦截器中收集依赖
 */
function track(target, key) {
  if (!activeEffect) return;
  let depsMap = targetMap.get(target);
  if (!depsMap) {
    targetMap.set(target, (depsMap = new Map()));
  }
  let dep = depsMap.get(key);
  if (!dep) {
    depsMap.set(key, (dep = new Set()));
  }
  dep.add(activeEffect);
}

/**
 * 在 set 拦截器中触发更新
 */
function trigger(target, key) {
  const depsMap = targetMap.get(target);
  if (!depsMap) return;
  const dep = depsMap.get(key);
  if (dep) {
    dep.forEach((effect) => effect());
  }
}

/**
 * 注册副作用函数
 * 立即执行一次，并建立依赖关系
 */
function effect(fn) {
  const effectFn = () => {
    try {
      activeEffect = effectFn;
      fn();
    } finally {
      activeEffect = null;
    }
  };
  effectFn();
}

// ------------------- 使用示例 -------------------
const state = reactive({
  count: 0,
  name: "Vue3",
});

// 第一个副作用：依赖 count 和 name
effect(() => {
  console.log(`Count is: ${state.count}`);
});

// 第二个副作用：只依赖 name
effect(() => {
  console.log(`Name is: ${state.name}`);
});

// 修改数据，会触发相应的副作用重新执行
console.log("--- 修改 count ---");
state.count++;

console.log("--- 修改 name ---");
state.name = "Reactivity";
```
