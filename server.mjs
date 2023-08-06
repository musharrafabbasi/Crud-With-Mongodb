import express from "express";
import mongoose from "mongoose";
import morgan from 'morgan';
import cors from 'cors'

const app = express();
app.use(express.json());
app.use(cors(["http://localhost:3000", "127.0.0.1", "https://ewrer234234.appspot.app.com"]));

app.use(morgan('combined'));

// Connect to MongoDB
const mongodbURI = "mongodb+srv://dbuser:dbpassword123@cluster0.acx2co8.mongodb.net/?retryWrites=true&w=majority"; // Replace with your MongoDB Atlas URI
mongoose.connect(mongodbURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch(error => {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1); // Exit the process with an error code
  });

// Define a product schema
const productSchema = new mongoose.Schema({
  name: String,
  price: String,
  description: String
});

const Product = mongoose.model("Product", productSchema);

app.get("/", (req, res) => {
  res.send("hello world!");
});

app.get("/products", async (req, res) => {
  try {
    const allProducts = await Product.find({});
    res.send({
      message: "all products",
      data: allProducts
    });
  } catch (error) {
    console.log("error", error);
    res.status(500).send({ message: "failed to get products, please try later" });
  }
});

app.post("/product", async (req, res) => {
  const { name, price, description } = req.body;

  if (!name || !price || !description) {
    res.status(400).send({
      message: "required parameter missing. example JSON request body: { name: 'abc product', price: '$23.12', description: 'abc product description' }"
    });
    return;
  }

  try {
    const product = new Product({
      name,
      price,
      description
    });

    await product.save();
    res.status(201).send({ message: "created product", data: product });

  } catch (error) {
    console.log("error: ", error);
    res.status(500).send({ message: "Failed to add, please try later" })
  }
});

app.put("/product/:id", async (req, res) => {
  const { name, price, description } = req.body;

  if (!name || !price || !description) {
    res.status(400).send({
      message: "required parameter missing. example JSON request body: { name: 'abc product', price: '$23.12', description: 'abc product description' }"
    });
    return;
  }

  try {
    const updatedProduct = await Product.findOneAndUpdate(
      { _id: req.params.id },
      { name, price, description },
      { new: true }
    );
    res.send({ message: "product updated successfully", data: updatedProduct });

  } catch (error) {
    console.log("error", error);
    res.status(500).send({ message: "failed to update product, please try later" });
  }
});

app.delete("/product/:id", async (req, res) => {
  try {
    await Product.findOneAndDelete({ _id: req.params.id });
    res.send({ message: "product deleted successfully" });

  } catch (error) {
    console.log("error", error);
    res.status(500).send({ message: "failed to delete product, please try later" });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
