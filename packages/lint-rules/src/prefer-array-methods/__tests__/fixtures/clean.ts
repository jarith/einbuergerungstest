// @ts-nocheck

// 1. Declarative methods: .map(), .filter(), .reduce()
{
  const doubled = items.map((x) => x * 2)
  const active = items.filter((x) => x.active)
  const sum = items.reduce((acc, x) => acc + x, 0)
}

// 2. .push() outside a loop
{
  const results = []
  results.push(42)
}

// 3. .push() in loop but target not initialized as empty (parameter)
{
  const process = (results) => {
    for (const item of items) {
      results.push(item)
    }
  }
}

// 4. .push() inside a callback (.forEach()) within a loop (function boundary stops traversal)
{
  const results = []
  for (const group of groups) {
    group.items.forEach((item) => {
      results.push(item)
    })
  }
}

// 5. Loop without collection mutation
{
  let total = 0
  for (const item of items) {
    total += item.value
  }
}

// 6. map.set() in loop but map not initialized as new Map() (parameter)
{
  const process = (map) => {
    for (const item of items) {
      map.set(item.key, item.value)
    }
  }
}

// 7. obj[key] = value in loop but obj not initialized as {}
{
  const process = (obj) => {
    for (const item of items) {
      obj[item.id] = item.value
    }
  }
}
