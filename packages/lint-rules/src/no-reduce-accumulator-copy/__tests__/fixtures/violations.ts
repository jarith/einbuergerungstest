items.reduce((acc, item) => Object.assign({}, acc, { [item.id]: item }), {})
