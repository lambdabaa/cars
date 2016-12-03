// @flow

async function serially(tasks: Array<Function>): Promise<Array<any>> {
  let results = [];
  for (let i = 0; i < tasks.length; i++) {
    const result = await tasks[i]();
    results.push(result);
  }

  return results;
}

module.exports = serially;
