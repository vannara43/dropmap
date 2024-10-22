const canvas = document.getElementById('fortniteMap');
const ctx = canvas.getContext('2d');

// Load the Fortnite map image
const mapImage = new Image();
mapImage.src = 'https://fortnite-api.com/images/map_en.png'; // Change this to the actual path of your map image

mapImage.onload = () => {
    ctx.drawImage(mapImage, 0, 0, canvas.width, canvas.height);
};

// Store the start, end, and third positions
let startPosition = null;
let endPosition = null;
let thirdPosition = null;

// Handle canvas click to mark the start, end, and third locations
canvas.addEventListener('click', (event) => {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Check if startPosition is null
    if (!startPosition) {
        startPosition = { x, y };
        alert('Start location marked! Now mark the end location.');
    } else if (!endPosition) {
        endPosition = { x, y };
        alert('End location marked! Click "Plot Route" to draw the line.');
    } else if (startPosition && endPosition && !thirdPosition) {
        thirdPosition = { x, y };
        alert('Third location marked! The new exit route will be drawn.');
    } else {
        alert('You can only mark one start, one end, and one third location. Please reset to mark new locations.');
    }

    redrawMap(); // Redraw the map with current markers
});

// Function to redraw the map and markers
function redrawMap() {
    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Redraw the map
    ctx.drawImage(mapImage, 0, 0, canvas.width, canvas.height);

    // Draw the plotted line if both start and end positions exist
    drawRoute(); // Draw the line between the start and end points

    // Draw start and end markers if they exist
    if (startPosition) {
        drawMarker(startPosition.x, startPosition.y, 'yellow'); // Yellow marker for start
        // Draw text label next to the start point
        ctx.fillStyle = 'yellow'; // Text color
        ctx.font = '16px Arial'; // Set the font size and type
        ctx.fillText('Bus starts here', startPosition.x + 15, startPosition.y); // Adjust the x and y for positioning
    }
    if (endPosition) {
        drawMarker(endPosition.x, endPosition.y, 'yellow'); // Yellow marker for end
        ctx.fillStyle = 'yellow'; // Text color
        ctx.font = '16px Arial'; // Set the font size and type
        ctx.fillText('End of bus', endPosition.x + 15, endPosition.y); // Adjust the x and y for positioning
    }
    // Draw third marker if it exists
    if (thirdPosition) {
        drawMarker(thirdPosition.x, thirdPosition.y, 'red'); // Red marker for third position
        drawExitRoute(); // Draw the exit route to the third position
    }
}

// Draw a marker on the map
function drawMarker(x, y, color) {
    ctx.fillStyle = color; // Use the passed color for the marker
    ctx.beginPath();
    ctx.arc(x, y, 10, 0, Math.PI * 2, true); // Circle for marker
    ctx.fill();
}

// Function to draw a dashed line between start and end positions
function drawRoute() {
    if (startPosition && endPosition) {
        ctx.strokeStyle = 'lightblue'; // Change line color to light blue
        ctx.lineWidth = 5; // Width of the line
        ctx.setLineDash([5, 5]); // Set the line dash pattern

        ctx.beginPath();
        ctx.moveTo(startPosition.x, startPosition.y);
        ctx.lineTo(endPosition.x, endPosition.y);
        ctx.stroke();

        // Reset line dash to solid for other drawings
        ctx.setLineDash([]);
    }
}

// Function to draw a dashed line from the closest point on the route to the third position
function drawExitRoute() {
    if (endPosition && thirdPosition) {
        // Calculate the closest point on the line segment from start to end
        const closestPoint = closestPointOnSegment(startPosition, endPosition, thirdPosition);

        ctx.strokeStyle = 'orange'; // Color of the new route
        ctx.lineWidth = 5; // Width of the line
        ctx.setLineDash([5, 5]); // Set the line dash pattern

        ctx.beginPath();
        ctx.moveTo(closestPoint.x, closestPoint.y); // Start from the closest point
        ctx.lineTo(thirdPosition.x, thirdPosition.y);
        ctx.stroke();

        // Reset line dash to solid for other drawings
        ctx.setLineDash([]);
    }
}

// Function to calculate the closest point on a line segment from a point
function closestPointOnSegment(start, end, point) {
    const lineVector = { x: end.x - start.x, y: end.y - start.y };
    const pointVector = { x: point.x - start.x, y: point.y - start.y };

    const lineLengthSquared = lineVector.x * lineVector.x + lineVector.y * lineVector.y;
    if (lineLengthSquared === 0) return start; // Start and end are the same point

    const t = Math.max(0, Math.min(1, (pointVector.x * lineVector.x + pointVector.y * lineVector.y) / lineLengthSquared));

    return {
        x: start.x + t * lineVector.x,
        y: start.y + t * lineVector.y
    };
}

// Add event listener for the Plot Route button
document.getElementById('plotRouteButton').addEventListener('click', () => {
    if (startPosition && endPosition) {
        drawRoute(); // Draw the line between the two points
    } else {
        alert('Please mark both a start and an end location on the map first!');
    }
});

// Add event listener for the Reset button
document.getElementById('resetButton').addEventListener('click', () => {
    startPosition = null; // Clear the start position
    endPosition = null;   // Clear the end position
    thirdPosition = null; // Clear the third position
    redrawMap(); // Redraw the map without any markers or lines
});
