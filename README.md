# Educational Inequality

### What social problem is being addressed?

Educational inequality in the LA county area and its relation to socioeconomic conditions.

### Who is being empowered by your mapplication?

- Families raising K-12 children in the LA area in the public school system
- Teachers/school staff working with a lack of resources due to underfunding
- Students

### What technical and ethical problems could there be in developing this tool?

- Technical
  - Much of the data is collected by the state, which may not be directly accessible to us
  - If relying on standardized test scores, the data may not be fully accurate due to a lack of incentive for students to perform on such tests
  - Standardized tests don't accurately represent the quality of a student's education
  - LA county contains 75+ school districts
- Ethical
  - Reduction of education quality to a quantitative value is an oversimplification and may lead to inaccuracy in the final result
  - Poor performing school districts may be discouraged and find themselves in a self-fulfilling prophecy


### Technology used in the project

- Leaflet
  - We used leaflet for our project mapping. We imported a GeoJSON that contains multipolygons with the neighborhoods/regions of LA county. 
  - Each affirmative response to our "Support in reaching college goals question" is aggregated per region and the percentage of "Yes" responses defines the color of the neighborhood (ex. 25% of students feel supported is red).
  - We used Javascript for leaflet, also importing Papaparse for our Google Form response parsing. We also included a library that supports a point-in-polygon calculation to match responses to neighborhoods.
- Google Forms
  - We used Google Forms due to its simple to use interface and powerful connection to Google Sheets.
  - Within Google Sheets, we have a script that calculates coordinated based on the location sent on the survey. This gives us our point for mapping.
  - We used PapaParse and conditional statements within Javascript to manage our responses and include them in the map.
- VSCode
  - We used VSCode as our code editor, specifically the live server feature that allows us to see our changes live.
 - Github
   - We used GitHub as our Version Control System, allowing concurrent working on features through branching and pull requests.


### How others can use it in the future

- Students
  - Students can use this application to be more aware of others' experiences and what resources helped them in their journeys
- Educators
  - Educators can understand what aspects of their support are valued most
