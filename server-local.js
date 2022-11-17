const express = require("express");
const cors = require("cors");
const fs = require("fs");

let results = JSON.parse(fs.readFileSync("test.json"));

function getAllImages() {
	try {
		console.log("File reading OK");
		return results;
	} catch {
		console.log("Error reading file");
		return [];
	}
}

function getImagesByLabel(labels) {
	try {
		const labelArr = labels.split(" ");
		const regexString = labelArr.map((label) => `(?=.*${label})`).join("");
		const regexQuery = new RegExp(regexString, "ig");

		const allImages = getAllImages();

		console.log("Get by label OK");
		return allImages.filter((image) => image.label.match(regexQuery) !== null);
	} catch {
		console.log("Error connecting");
		return [];
	}
}

function uploadImage(label, imageUrl) {
	try {
		console.log("Image uploaded");
		const allImages = getAllImages();
		const newId = parseInt(allImages.at(-1).id) + 1;
		allImages.push({ id: newId, label, imageUrl });
		results = [...allImages];
		return 1;
	} catch {
		console.log("Error connecting");
		return -1;
	}
}

function deleteImage(id) {
	try {
		const allImages = getAllImages();
		results = allImages.filter((image) => parseInt(image.id) !== parseInt(id));
		console.log("Image deleted");
		return 1;
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
		res.json(uploadImage(req.body.label, req.body.imageUrl));
	} else res.json({ message: "Problem on uploading image" });
});

app.get("/all_images", async (req, res) => {
	res.json(getAllImages());
});

app.post("/by_label", async (req, res) => {
	const labels = req.body.label;

	res.json(getImagesByLabel(labels));
});

app.delete("/delete_image", async (req, res) => {
	const id = req.body.id;
	res.json(deleteImage(id));
});

app.listen(3000, () => {
	console.log(`Server started...`);
});
