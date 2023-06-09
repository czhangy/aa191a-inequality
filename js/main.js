// declare variables
let mapOptions = { center: [34.2009, -118.444], zoom: 9 };
let stories = [];
let currentPage = null;

// event listeners
document
	.getElementById("last-page")
	.addEventListener("click", () => setStory(currentPage - 1));
document
	.getElementById("next-page")
	.addEventListener("click", () => setStory(currentPage + 1));
document.querySelectorAll("input[type=checkbox]").forEach((el) => {
	el.addEventListener("change", () => {
		initNDS();
		setMap();
	});
});

// use the variables
const map = L.map("map").setView(mapOptions.center, mapOptions.zoom);
map.addControl(new L.Control.Fullscreen());

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
	attribution:
		'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map);

let neighborhoodData;
let neighborhoodDataStruct = {};
let neighborhoodsLayer = null;
let csvData = null;

// Get initial GeoJSON data
fetch("static/neighborhoods.geojson")
	.then((response) => response.json())
	.then((data) => {
		neighborhoodData = data;
		initNDS();
	});

// Fetch CSV data
Papa.parse(
	"https://docs.google.com/spreadsheets/d/e/2PACX-1vTntSWZ4GHhgcLHHYOY5UH56ktQS_gO1MAT_rBWTFMpU40ZK5Bm95DiMTy3OgnSfXvCz8wL6xIw9GlN/pub?output=csv",
	{
		download: true,
		header: true,
		complete: (results) => {
			csvData = results.data;
			setMap();
		},
	}
);

// Legend
let legend = L.control({ position: "bottomright" });
legend.onAdd = function (map) {
	let div = L.DomUtil.create("div", "info legend");

	div.style.backgroundColor = "white";
	div.style.padding = "10px";
	div.style.borderRadius = "5px";
	div.style.fontFamily = "font-family: 'Archivo', sans-serif";

	div.innerHTML =
		"<strong>Key:</strong><br> % of Students Who Felt Supported in <br> Reaching College Goals in High School<br><br>";

	div.innerHTML +=
		'<i style="background:#E0161B; width: 18px; height: 18px; float: left; margin-right: 5px;"></i> ' +
		"0 &ndash; 25%<br>" +
		'<i style="background:#E0B724; width: 18px; height: 18px; float: left; margin-right: 5px;"></i> ' +
		"25 &ndash; 50%<br>" +
		'<i style="background:#0117E1; width: 18px; height: 18px; float: left; margin-right: 5px;"></i> ' +
		"50 &ndash; 75%<br>" +
		'<i style="background:#00A448; width: 18px; height: 18px; float: left; margin-right: 5px;"></i> ' +
		"75+%";

	return div;
};
legend.addTo(map);

// Handles pages in story box
const setStory = (page) => {
	currentPage = page;
	if (page < 0 || page >= stories.length) {
		return;
	}
	document.getElementById("page-num").innerHTML = currentPage + 1 + "/";
	document.getElementById("college-prep-resources").innerHTML =
		stories[page][
			"Which college preparatory resources did your high school offer?"
		];
	document.getElementById("career-resources").innerHTML =
		stories[page][
			"During high school did you ever see a career counselor or attend a career event?"
		];
	document.getElementById("support").innerHTML =
		stories[page][
			"What do you remember about this support and how did that make you feel at the time?"
		];
	document.getElementById("post-grad").innerHTML =
		stories[page][
			"Please share how you felt that your high school education prepared you for the steps after high school graduation."
		];
};

// Clear story when click off of region
map.on("click", () => {
	document.getElementById("stories-content").style.display = "none";
	document.getElementById("stories-placeholder").style.display = "flex";
});

//
const getResponseCount = (neighborhoodDataStruct, name, response) => {
	let count = 0;
	for (let i = 0; i < neighborhoodDataStruct[name].total; i++) {
		if (
			neighborhoodDataStruct[name].responses[i][
				"Did you feel supported in reaching your (college) goals in high school?"
			] === response
		) {
			count++;
		}
	}
	return count;
};

// Initialize neighborhoodDataStruct with neighborhoodData
const initNDS = () => {
	neighborhoodData.features.forEach((feature) => {
		neighborhoodDataStruct[feature.properties.name] = {
			total: 0,
			yesCount: 0,
			responses: [],
		};
	});
};

// Set filters for csv data
const setFilters = (el) => {
	const key = "Do identify as any of the following? (Check all that apply)";
	if (
		document.getElementById("low-income").checked &&
		el[key].includes("Financial aid")
	) {
		return true;
	} else if (
		document.getElementById("first-gen").checked &&
		el[key].includes("First generation")
	) {
		return true;
	} else if (
		document.getElementById("person-of-color").checked &&
		el[key].includes("Person of color")
	) {
		return true;
	} else if (
		document.getElementById("low-income").checked &&
		el[key] === ""
	) {
		return true;
	}
	return false;
};

// Set the data
const setMap = () => {
	if (neighborhoodsLayer) {
		map.removeLayer(neighborhoodsLayer);
	}
	console.log(csvData);
	const mapData = csvData.filter((el) => setFilters(el));
	mapData.forEach((item) => {
		const point = turf.point([item.lng, item.lat]);
		const response =
			item[
				"Did you feel supported in reaching your (college) goals in high school?"
			];
		neighborhoodData.features.forEach((feature) => {
			if (turf.booleanPointInPolygon(point, feature)) {
				neighborhoodDataStruct[feature.properties.name].total++;
				if (response === "Yes") {
					neighborhoodDataStruct[feature.properties.name].yesCount++;
				}
				neighborhoodDataStruct[feature.properties.name].responses.push(
					item
				);
			}
		});
	});

	neighborhoodsLayer = L.geoJSON(neighborhoodData, {
		style: function (feature) {
			const total = neighborhoodDataStruct[feature.properties.name].total;
			const yesCount =
				neighborhoodDataStruct[feature.properties.name].yesCount;
			const yesPercentage = total === 0 ? 0 : yesCount / total;
			let color;
			if (total === 0) color = "none";
			else if (yesPercentage < 0.25) color = "#E0161B";
			else if (yesPercentage < 0.5) color = "#E0B724";
			else if (yesPercentage < 0.75) color = "#0117E1";
			else color = "#00A448";
			return { color: color };
		},
		onEachFeature: function (feature, layer) {
			layer.bindPopup(
				`<div class="popup"><strong>${
					feature.properties.name
				}</strong><span>Number of respondents: ${
					neighborhoodDataStruct[feature.properties.name].total
				}</span><p>Did you feel supported in reaching your goals in high school?</p><ul><li><span class="label">Yes:</span>${getResponseCount(
					neighborhoodDataStruct,
					feature.properties.name,
					"Yes"
				)}</li><li><span class="label">Unsure:</span>${getResponseCount(
					neighborhoodDataStruct,
					feature.properties.name,
					"Unsure"
				)}</li><li><span class="label">No:</span>${getResponseCount(
					neighborhoodDataStruct,
					feature.properties.name,
					"No"
				)}</li></ul></div>`
			);
			layer.on("click", () => {
				stories =
					neighborhoodDataStruct[feature.properties.name].responses;
				document.getElementById("stories-content").style.display =
					"block";
				document.getElementById("stories-placeholder").style.display =
					"none";
				document.getElementById("page-max").innerHTML = stories.length;
				setStory(0);
			});
		},
	});
	neighborhoodsLayer.addTo(map);
};
