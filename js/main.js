// declare variables
let mapOptions = { center: [34.2009, -118.444], zoom: 9 };

// use the variables
const map = L.map("map").setView(mapOptions.center, mapOptions.zoom);
map.addControl(new L.Control.Fullscreen());

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
	attribution:
		'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map);

let neighborhoodDataStruct = {};

let neighborhoodData;
fetch("static/neighborhoods.geojson")
	.then((response) => response.json())
	.then((data) => {
		neighborhoodData = data;
		neighborhoodData.features.forEach((feature) => {
			neighborhoodDataStruct[feature.properties.name] = {
				total: 0,
				yesCount: 0,
				responses: [],
			};
		});
	});

// Fetch CSV data
Papa.parse(
	"https://docs.google.com/spreadsheets/d/e/2PACX-1vTntSWZ4GHhgcLHHYOY5UH56ktQS_gO1MAT_rBWTFMpU40ZK5Bm95DiMTy3OgnSfXvCz8wL6xIw9GlN/pub?output=csv",
	{
		download: true,
		header: true,
		complete: function (results) {
			const csvData = results.data;
			csvData.forEach((item) => {
				const point = turf.point([item.lng, item.lat]);
				const response =
					item[
						"Did you feel supported in reaching your (college) goals in high school?"
					];
				neighborhoodData.features.forEach((feature) => {
					if (turf.booleanPointInPolygon(point, feature)) {
						neighborhoodDataStruct[feature.properties.name].total++;
						if (response === "Yes") {
							neighborhoodDataStruct[feature.properties.name]
								.yesCount++;
						}
						neighborhoodDataStruct[
							feature.properties.name
						].responses.push(response);
					}
				});
			});

			L.geoJSON(neighborhoodData, {
				style: function (feature) {
					// Colors based on % of yes responses for Support in Reaching College Goals. Prob will change to something else later.
					const total =
						neighborhoodDataStruct[feature.properties.name].total;
					const yesCount =
						neighborhoodDataStruct[feature.properties.name]
							.yesCount;
					const yesPercentage = total === 0 ? 0 : yesCount / total;
					let color;
					if (total === 0) color = "grey";
					else if (yesPercentage < 0.25) color = "red";
					else if (yesPercentage < 0.5) color = "yellow";
					else if (yesPercentage < 0.75) color = "lightgreen";
					else color = "purple";
					return { color: color };
				},
				onEachFeature: function (feature, layer) {
					const responses =
						neighborhoodDataStruct[
							feature.properties.name
						].responses.join("<br>");
					layer.bindPopup(
						`<strong>${feature.properties.name}</strong><br>${responses}`
					);
				},
			}).addTo(map);
		},
	}
);

// Legend
var legend = L.control({ position: "bottomright" });

legend.onAdd = function (map) {
	var div = L.DomUtil.create("div", "info legend"),
		grades = [0, 0.25, 0.5, 0.75],
		colors = ["red", "yellow", "lightgreen", "purple"];

	div.style.backgroundColor = "white";
	div.style.padding = "10px";
	div.style.borderRadius = "5px";

	div.innerHTML = "Support in reaching college goals:<br>";
	for (var i = 0; i < grades.length; i++) {
		div.innerHTML +=
			'<i style="background:' +
			colors[i] +
			'; width: 18px; height: 18px; float: left;"></i> ' +
			grades[i] * 100 +
			(grades[i + 1] ? "&ndash;" + grades[i + 1] * 100 + "%<br>" : "+%");
	}
	return div;
};

legend.addTo(map);