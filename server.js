const express = require("express");
const cors = require("cors");
const { MongoClient, ObjectId } = require("mongodb");
require("dotenv").config();

const uri = process.env.MONGODB_URI;

const client = new MongoClient(uri);

async function getAllImages() {
	try {
		await client.connect();
		const db = client.db("my-unsplash").collection("images");
		const results = await db.find({}).toArray();
		console.log("Get all images OK");
		return results;
	} catch {
		console.log("Error connecting");
		return [];
	}
}

async function getImagesByLabel(labels) {
	try {
		await client.connect();
		const db = client.db("my-unsplash").collection("images");

		const labelArr = labels.split(" ");
		const regexString = labelArr.map((label) => `(?=.*${label})`).join("");
		const regexQuery = new RegExp(regexString, "i");
		const query = { label: { $regex: regexQuery } };

		const results = await db.find(query).toArray();
		console.log("Get by label OK");
		return results;
	} catch {
		console.log("Error connecting");
		return [];
	}
}

async function uploadImage(label, imageUrl) {
	try {
		await client.connect();
		const db = client.db("my-unsplash").collection("images");
		console.log("Image uploaded");
		return await db.insertOne({ label, imageUrl });
	} catch {
		console.log("Error connecting");
		return -1;
	}
}

async function deleteImage(id) {
	try {
		await client.connect();
		const db = client.db("my-unsplash").collection("images");
		const result = await db.deleteOne({ _id: new ObjectId(id) });
		console.log("Image deleted");
		return result;
	} catch {
		console.log("Error connecting");
		return -1;
	}
}

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
	cors({
		origin: "*",
	})
);

app.post("/upload_image", async (req, res) => {
	console.log(req.body);
	const { label, imageUrl } = req.body;
	if (label && imageUrl) {
		res.json(await uploadImage(req.body.label, req.body.imageUrl));
	} else res.json({ message: "Problem on uploading image" });
});

app.get("/all_images", async (req, res) => {
	res.json(await getAllImages());
});

app.post("/by_label", async (req, res) => {
	const labels = req.body.label;

	res.json(await getImagesByLabel(labels));
});

app.delete("/delete_image", async (req, res) => {
	const id = req.body.id;

	res.json(await deleteImage(id));
});

app.listen(5000, () => {
	console.log(`Server started...`);
});
