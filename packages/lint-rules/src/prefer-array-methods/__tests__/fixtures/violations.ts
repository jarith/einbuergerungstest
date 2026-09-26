// @ts-nocheck

// 1. for loop with .push() into []
{
  const results = []
  for (let i = 0; i < items.length; i++) {
    results.push(items[i] * 2)
  }
}

// 2. for...of loop with .push() into []
{
  const mapped = []
  for (const item of items) {
    mapped.push(item.name)
  }
}

// 3. for loop with conditional .push() (filter+map pattern)
{
  const filtered = []
  for (let i = 0; i < items.length; i++) {
    if (items[i].active) {
      filtered.push(items[i].value)
    }
  }
}

// 4. for...of loop with obj[key] = value on {}
{
  const lookup = {}
  for (const item of items) {
    lookup[item.id] = item.value
  }
}

// 5. for...of loop with .set() on new Map()
{
  const map = new Map()
  for (const item of items) {
    map.set(item.key, item.value)
  }
}

// 6. for...of loop with .add() on new Set()
{
  const unique = new Set()
  for (const item of items) {
    unique.add(item.id)
  }
}

// 7. for loop with .unshift() into []
{
  const reversed = []
  for (let i = 0; i < items.length; i++) {
    reversed.unshift(items[i])
  }
}
