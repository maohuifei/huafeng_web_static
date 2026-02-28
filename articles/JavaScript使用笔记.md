---
title: JavaScript 使用笔记
categories: 使用笔记
createTime: 2022-11-11
updateTime: 2026-02-21
description: JavaScript使用笔记
top: 0
---
## 数组对象

### 检测是否为数组：instanceof / isArray

**方法一：**
使用 `instanceof Array` 运算符检测：

```javascript
function checkArray(arr) {
    if (arr instanceof Array) {
        // ...
    }
}
```

**方法二：**
使用 `Array.isArray()` 方法检测（HTML5 新增，IE9+ 支持）：

```javascript
function checkArray(arr) {
    if (Array.isArray(arr)) {
        // ...
    }
}
```

---

### 插入/删除元素：push/pop & shift/unshift

#### 队列操作（FIFO）

- `push()`：在数组末端添加元素
- `shift()`：移除数组首端元素

#### 栈操作（LIFO）

- `push()`：在数组末端添加元素
- `pop()`：从数组末端移除元素

**双端队列操作示例：**

```javascript
// 末端操作
let fruits = ['Apple', 'Orange', 'Pear']
alert(fruits.pop()) // 移除 "Pear" 并弹出
alert(fruits) // Apple, Orange

fruits.push('Pear')
alert(fruits) // Apple, Orange, Pear

// 首端操作
let fruits2 = ['Apple', 'Orange', 'Pear']
alert(fruits2.shift()) // 移除 Apple 并弹出
alert(fruits2) // Orange, Pear

fruits2.unshift('Apple')
alert(fruits2) // Apple, Orange, Pear
```

**批量操作：**

```javascript
let arr = ['Apple']
arr.push('Orange', 'Peach')
arr.unshift('Pineapple', 'Lemon')
// ["Pineapple", "Lemon", "Apple", "Orange", "Peach"]
```

---

### 数组排序：reverse/sort

**翻转数组：**

```javascript
let arr = ['three', 'two', 'one']
arr.reverse()
console.log(arr) // ["one", "two", "three"]
```

**排序优化：**

```javascript
let nums = [3, 1, 16, 7, 68]
nums.sort((a, b) => a - b) // 升序 [1, 3, 7, 16, 68]
nums.sort((a, b) => b - a) // 降序 [68, 16, 7, 3, 1]
```

---

### 数组索引：indexOf/lastIndexOf

```javascript
let colors = ['red', 'green', 'yellow', 'pink', 'pink']
console.log(colors.indexOf('pink')) // 3（首个匹配项）
console.log(colors.lastIndexOf('pink')) // 4（末次匹配项）
console.log(colors.indexOf('blue')) // -1（未找到）
```

---

### 数组转字符串：toString/join

```javascript
let nums = [1, 2, 3, 4, 5]
console.log(nums.toString()) // "1,2,3,4,5"
console.log(nums.join('-')) // "1-2-3-4-5"
```

---

### 数组操作：splice

**删除/替换元素：**

```javascript
let arr = [1, 2, 3, 4, 5]
console.log(arr.splice(1, 3)) // 返回 [2, 3, 4]
console.log(arr) // 剩余 [1, 5]

// 插入元素
let arr2 = [1, 2, 3]
arr2.splice(1, 0, 9, 99, 999)
console.log(arr2) // [1, 9, 99, 999, 2, 3]
```

---

### 截取数组：slice

```javascript
let nums = [1, 2, 3, 4, 5, 6, 7]
console.log(nums.slice(1, -1)) // [2, 3, 4, 5, 6]
console.log(nums.slice(0, 3)) // [1, 2, 3]
console.log(nums.slice(3)) // [4, 5, 6, 7]
```

---

### 拼接数组：concat

```javascript
let arr1 = [1, 2, 3]
let arr2 = [4, 5]
console.log(arr1.concat(arr2)) // [1, 2, 3, 4, 5]
```

---

## 字符串对象

### 不可变性特性

字符串重新赋值会创建新内存空间，原空间保留。

---

### 字符定位：indexOf/lastIndexOf

```javascript
let str = '改革春风吹满地，春天来了'
console.log(str.indexOf('春')) // 2
console.log(str.indexOf('春', 3)) // 8
console.log(str.lastIndexOf('春')) // 8
```

---

### 字符获取

```javascript
let str = '改革春风吹满地'
console.log(str.charAt(2)) // "春"
console.log(str.charCodeAt(2)) // 26149 (Unicode)
console.log(str[2]) // "春" (ES6)
```

---

### 字符串拼接：concat

```javascript
let base = 'Hello'
console.log(base.concat(' World', '!')) // "Hello World!"
```

---

### 字符串截取

```javascript
let str = 'abcdefg'
console.log(str.substr(2, 3)) // "cde" (从索引2取3字符)
console.log(str.slice(2, 5)) // "cde" (索引2到5)
console.log(str.substring(2, 5)) // "cde" (同slice，但兼容旧浏览器)
```

---

### 字符串替换：replace

```javascript
let text = 'apple,orange,apple'
console.log(text.replace('apple', 'kiwi')) // "kiwi,orange,apple"（仅替换首个）
```

---

### 字符串分割：split

```javascript
let colors = 'red,blue,yellow,pink'
console.log(colors.split(',')) // ["red", "blue", "yellow", "pink"]
```

---

### 大小写转换

```javascript
let word = 'JavaScript'
console.log(word.toUpperCase()) // "JAVASCRIPT"
console.log(word.toLowerCase()) // "javascript"
```

---

## 数据类型与内存管理

### 值类型 vs 引用类型

- **值类型**：String、Number、Boolean、undefined、null（栈内存）
- **引用类型**：Object、Array、Date（堆内存）

---

### 参数传递特性

- 值类型参数传递：副本操作，不影响原值
- 引用类型参数传递：地址引用，修改会影响原对象

```javascript
// 值类型示例
function modify(num) {
    num = 10
}
let x = 5
modify(x)
console.log(x) // 5

// 引用类型示例
function updateObj(obj) {
    obj.name = 'Modified'
}
let person = { name: 'Original' }
updateObj(person)
console.log(person.name) // "Modified"
```

---

## 鼠标事件对比

| 事件           | 触发条件                   | 特性     |
| -------------- | -------------------------- | -------- |
| `onmouseover`  | 鼠标进入元素时             | 支持冒泡 |
| `onmouseenter` | 鼠标首次进入元素时         | 不冒泡   |
| `onmouseout`   | 鼠标离开元素时             | 支持冒泡 |
| `onmouseleave` | 鼠标完全离开元素时         | 不冒泡   |
| `onmousemove`  | 鼠标在元素内移动时连续触发 | 高频触发 |
