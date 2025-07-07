const { createDefaultPreset } = require("ts-jest");

const tsJestTransformCfg = createDefaultPreset().transform;

/** @type {import("jest").Config} **/
module.exports = {
  testEnvironment: "node",
  transform: {
    ...tsJestTransformCfg,
  },
<<<<<<< HEAD
};
=======
};


>>>>>>> 2b32968266e5537e572ca823da1b74a99fe61881
