const express = require("express");
const cors = require("cors");
const app = express();
const port = 3000;

// >>>>>>>>>>>>> Middleware setup <<<<<<<<<<<<<<
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// >>>>>>>>>>>>>>>>>> Routes <<<<<<<<<<<<<<<<
require("./app/route")(app);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
