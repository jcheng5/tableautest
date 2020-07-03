requirejs(["dump", "ifc/server"], function(dump, server) {
  console.log("Loading complete");
  // dump.default();

  window.addEventListener("message", 
    server.default({
      sum: function(...values) {
        return values.reduce((prev, curr) => prev + curr, 0);
      },
      multiply: function(...values) {
        return new Promise((resolve, reject) => {
          setTimeout(() => {
            resolve(values.reduce((prev, curr) => prev * curr, 1));
          }, 2000);
        });
      }
    })
  );
});
