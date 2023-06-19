const mongoose = require("mongoose");

const state = {
  db: null,
};

module.exports.connect = async function () {
  const url = "mongodb://127.0.0.1:27017";
  const dbname = "venture_apparel";

  try {
    await mongoose.connect(url + "/" + dbname, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    state.db = mongoose.connection;
    console.log("Connected to MongoDB successfully!🚀");
  } catch (err) {
    console.error("Failed to connect to MongoDB:", err);
    throw err;
  }
};

module.exports.get = function () {
  return state.db;
};
