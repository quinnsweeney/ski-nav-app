class PriorityQueue {
    constructor() {
        this.elements = [];
    }

    enqueue(element, priority) {
        this.elements.push({ element, priority });
        this.elements.sort((a, b) => a.priority - b.priority);
    }

    dequeue() {
        return this.elements.shift().element;
    }

    isEmpty() {
        return this.elements.length === 0;
    }
}


/**
 * Finds the shortest path between two points using the A* algorithm.
 * @param {Array} nodes - Array of all points of interest (POIs).
 * @param {Array} edges - Array of all lifts and trail segments.
 * @param {number} startNodeId - The ID of the starting POI.
 * @param {number} endNodeId - The ID of the destination POI.
 * @returns {Array|null} - An array of edge objects representing the path, or null if no path is found.
 */
export function findShortestPath(nodes, edges, startNodeId, endNodeId) {
    // Data Structures Initialization 
    const frontier = new PriorityQueue();
    frontier.enqueue(startNodeId, 0);

    const cameFrom = new Map(); 
    const costSoFar = new Map(); 
    cameFrom.set(startNodeId, null);
    costSoFar.set(startNodeId, 0);

    const nodeMap = new Map(nodes.map(node => [node.id, node]));
    
    const neighbors = new Map();
    nodes.forEach(node => neighbors.set(node.id, []));
    edges.forEach(edge => {
        neighbors.get(edge.start_point_id).push(edge);
    });


    // A* Algorithm Loop
    while (!frontier.isEmpty()) {
        const currentId = frontier.dequeue();

        // Goal reached
        if (currentId === endNodeId) {
            break;
        }

        // Check neighbors of the current node
        const currentNeighbors = neighbors.get(currentId) || [];
        for (const edge of currentNeighbors) {
            const nextId = edge.end_point_id;
            const newCost = costSoFar.get(currentId) + (edge.estimated_time_minutes || 1);

            // If we haven't visited this neighbor or found a cheaper path to it
            if (!costSoFar.has(nextId) || newCost < costSoFar.get(nextId)) {
                costSoFar.set(nextId, newCost);

                const priority = newCost; 
                frontier.enqueue(nextId, priority);
                
                cameFrom.set(nextId, { prevId: currentId, edge });
            }
        }
    }


    // Reconstruct the Path
    if (!cameFrom.has(endNodeId)) {
        return null; 
    }

    const path = [];
    let current = endNodeId;
    while (current !== startNodeId) {
        const { prevId, edge } = cameFrom.get(current);
        path.push(edge);
        current = prevId;
    }
    path.reverse();

    return path;
}
