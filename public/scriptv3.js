const canvas = document.getElementById('fortniteMap');
const ctx = canvas.getContext('2d');

// Load the Fortnite map image
const mapImage = new Image();
mapImage.src = 'https://fortnite-api.com/images/map_en.png';

mapImage.onload = () => {
    ctx.drawImage(mapImage, 0, 0, canvas.width, canvas.height);
};

// Simulated height map (2D array). Each element represents elevation at that point.
const heightMap = generateHeightMap(canvas.width, canvas.height);

// Store positions
let startPosition = null;
let endPosition = null;
let thirdPosition = null;
let gliderDeployPoint = null;
let busDropPoint = null;

// Scaling factor for pixels to meters (adjust based on the actual map scale)
const pixelsToMeters = 1; // Assuming 1 pixel = 1 meter for simplicity

// Handle canvas click to mark the start, end, and third locations
canvas.addEventListener('click', (event) => {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    if (!startPosition) {
        startPosition = { x, y };
    } else if (!endPosition) {
        endPosition = { x, y };
    } else if (!thirdPosition) {
        thirdPosition = { x, y };
        busDropPoint = calculateBusDropPoint(startPosition, endPosition); // Calculate bus drop point at closest point
        gliderDeployPoint = findGliderDeployPoint(busDropPoint, thirdPosition, 100); // Set the minimum distance to 100
    } else {
        alert('You can only mark one start, one end, and one third location. Please reset to mark new locations.');
    }

    redrawMap();
});

// Function to generate a random height map for simulation purposes
function generateHeightMap(width, height) {
    const map = [];
    for (let y = 0; y < height; y++) {
        map[y] = [];
        for (let x = 0; x < width; x++) {
            map[y][x] = Math.floor(Math.random() * 255); // Simulate elevation values (0 to 255)
        }
    }
    return map;
}

// Calculate the closest point on the bus route to the third marker
function calculateBusDropPoint(start, end) {
    return closestPointOnSegment(start, end, thirdPosition);
}

// Find the glider deploy point based on the bus drop point and destination
function findGliderDeployPoint(busDrop, destination, minDistance = 100) {
    const distanceToDestination = calculateDistance(busDrop, destination);

    // If the bus drop point is 100 meters or less from the destination, deploy at the bus drop
    if (distanceToDestination <= minDistance) {
        return { ...busDrop }; // Return the bus drop point
    }

    // Create a set of points to sample around the destination
    const candidates = [];

    // Calculate a point 100 meters away from the destination in various directions
    for (let angle = 0; angle < 360; angle += 10) { // Sample every 10 degrees
        const rad = angle * (Math.PI / 180); // Convert to radians
        const xOffset = Math.cos(rad) * minDistance;
        const yOffset = Math.sin(rad) * minDistance;

        const candidatePoint = {
            x: destination.x + xOffset,
            y: destination.y + yOffset
        };

        // Ensure the candidate point is within bounds
        if (candidatePoint.x >= 0 && candidatePoint.x < canvas.width && candidatePoint.y >= 0 && candidatePoint.y < canvas.height) {
            candidates.push(candidatePoint);
        }
    }

    // Find the candidate with the lowest elevation
    let lowestPoint = null;
    let lowestElevation = Infinity; // Start with a high value

    for (const candidate of candidates) {
        const elevation = heightMap[Math.floor(candidate.y)][Math.floor(candidate.x)];
        // Check for the lowest elevation
        if (elevation < lowestElevation) {
            lowestElevation = elevation;
            lowestPoint = candidate;
        }
    }

    // If no valid point found, return null or a default value
    return lowestPoint ? lowestPoint : { x: destination.x, y: destination.y }; // Default to destination if no valid point
}


// Function to find the lowest elevation point between two points
function findLowestElevationPoint(start, end) {
    const numSteps = 100; // Number of steps to sample between the points
    let lowestPoint = { x: start.x, y: start.y };
    let lowestElevation = heightMap[Math.floor(start.y)][Math.floor(start.x)];

    // Iterate between the start and end point, checking elevations
    for (let i = 1; i <= numSteps; i++) {
        const t = i / numSteps;
        const x = start.x + t * (end.x - start.x);
        const y = start.y + t * (end.y - start.y);

        const elevation = heightMap[Math.floor(y)][Math.floor(x)];
        if (elevation < lowestElevation) {
            lowestElevation = elevation;
            lowestPoint = { x, y };
        }
    }

    return lowestPoint; // Return the lowest elevation point
}



// Function to find the lowest elevation point between two points
function findLowestElevationPoint(start, end) {
    const numSteps = 100; // Number of steps to sample between the points
    let lowestPoint = { x: start.x, y: start.y };
    let lowestElevation = heightMap[Math.floor(start.y)][Math.floor(start.x)];

    // Iterate between the start and end point, checking elevations
    for (let i = 1; i <= numSteps; i++) {
        const t = i / numSteps;
        const x = start.x + t * (end.x - start.x);
        const y = start.y + t * (end.y - start.y);

        const elevation = heightMap[Math.floor(y)][Math.floor(x)];
        if (elevation < lowestElevation) {
            lowestElevation = elevation;
            lowestPoint = { x, y };
        }
    }

    return lowestPoint;
}

// Function to calculate distance between two points in meters
function calculateDistance(point1, point2) {
    const distanceInPixels = Math.hypot(point2.x - point1.x, point2.y - point1.y);
    return distanceInPixels * pixelsToMeters; // Convert pixels to meters
}

// Function to redraw the map and markers
function redrawMap() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(mapImage, 0, 0, canvas.width, canvas.height);

    drawRoute();

    if (startPosition) drawMarker(startPosition.x, startPosition.y, 'yellow', 'Bus starts here');
    if (endPosition) drawMarker(endPosition.x, endPosition.y, 'yellow', 'End of bus');
    if (busDropPoint) drawMarker(busDropPoint.x, busDropPoint.y, 'lightblue', 'Bus Drop Point');
    if (gliderDeployPoint) drawMarker(gliderDeployPoint.x, gliderDeployPoint.y, 'lightgreen', 'Deploy Glider Here');
    if (thirdPosition) {
        drawMarker(thirdPosition.x, thirdPosition.y, 'magenta', 'Destination');
        drawExitRoute();

        // Calculate and display the distance from bus drop point to the third marker
        const distanceToThirdMarker = calculateDistance(busDropPoint, thirdPosition);
        displayDistance(distanceToThirdMarker);
    }
}

// Draw a marker on the map
function drawMarker(x, y, color, label) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, 10, 0, Math.PI * 2, true);
    ctx.fill();
    ctx.fillStyle = color;
    ctx.font = '16px Arial';
    ctx.fillText(label, x + 15, y);
}

// Draw the bus route between the start and end positions
function drawRoute() {
    if (startPosition && endPosition) {
        ctx.strokeStyle = 'lightblue';
        ctx.lineWidth = 5;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(startPosition.x, startPosition.y);
        ctx.lineTo(endPosition.x, endPosition.y);
        ctx.stroke();
        ctx.setLineDash([]);
    }
}

// Function to draw a route from the closest point on the bus route to glider deploy point, then to third marker
function drawExitRoute() {
    if (busDropPoint && gliderDeployPoint && thirdPosition) {
        // Draw from bus drop point to glider deploy point (lightgreen dashed line)
        ctx.strokeStyle = 'lightgreen';
        ctx.lineWidth = 5;
        ctx.setLineDash([5, 5]); // Dashed line
        ctx.beginPath();
        ctx.moveTo(busDropPoint.x, busDropPoint.y);
        ctx.lineTo(gliderDeployPoint.x, gliderDeployPoint.y);
        ctx.stroke();

        // Draw from glider deploy point to third marker (green solid line)
        ctx.strokeStyle = 'magenta'; // Change color to green for this segment
        ctx.lineWidth = 5;
        ctx.setLineDash([5, 5]); // Solid line
        ctx.beginPath();
        ctx.moveTo(gliderDeployPoint.x, gliderDeployPoint.y);
        ctx.lineTo(thirdPosition.x, thirdPosition.y);
        ctx.stroke();
    }
}

// Function to display the distance on the canvas
function displayDistance(distance) {
    const distanceInMeters = Math.round(distance); // Round to nearest whole number
    ctx.fillStyle = 'white';
    ctx.font = '18px Arial';
    ctx.fillText(`Distance to destination marker: ${distanceInMeters} meters`, 20, 30);
}

// Function to calculate the closest point on a line segment from a point
function closestPointOnSegment(start, end, point) {
    const lineVector = { x: end.x - start.x, y: end.y - start.y };
    const pointVector = { x: point.x - start.x, y: point.y - start.y };

    const lineLengthSquared = lineVector.x * lineVector.x + lineVector.y * lineVector.y;
    if (lineLengthSquared === 0) return start;

    const t = Math.max(0, Math.min(1, (pointVector.x * lineVector.x + pointVector.y * lineVector.y) / lineLengthSquared));

    return {
        x: start.x + t * lineVector.x,
        y: start.y + t * lineVector.y
    };
}

// Add event listener for the Plot Route button
document.getElementById('plotRouteButton').addEventListener('click', () => {
    if (startPosition && endPosition && thirdPosition) {
        drawRoute();
    } else {
        alert('Please mark all locations on the map first!');
    }
});

// Add event listener for the Reset button
document.getElementById('resetButton').addEventListener('click', () => {
    startPosition = null;
    endPosition = null;
    thirdPosition = null;
    gliderDeployPoint = null;
    busDropPoint = null;
    redrawMap();
});
