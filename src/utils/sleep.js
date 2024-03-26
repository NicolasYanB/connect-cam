function sleep(time) {
  return new Promise(resolve => {
      setTimeout(resolve, time ?? 100);
  });
};

export {sleep};