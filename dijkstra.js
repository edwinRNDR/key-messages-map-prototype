/**
 * Find adjacent nodes for a given node
 * @param {Array<{source: string, target: string}>} links - Array of link objects representing edges
 * @param {string} node - The node whose adjacent nodes are to be found
 * @returns {Array<{source: string, target: string}>} - Subtree
 */
function findAdjacentSubtree(links, node) {
    const adjacentNodes = new Set();
    let subLinks = []
    for (const link of links) {
        if ((link.source.id||link.source) === node) {
            adjacentNodes.add(link.target);
            subLinks.push({source: node, target:link.target})
        } else if ((link.target.id||link.targe0) === node) {
            adjacentNodes.add(link.source);
            subLinks.push({source: node, target:link.source})
        }
    }
    return subLinks
}

function findAdjacentNodes(links, node) {
    const adjacentNodes = new Set();
    for (const link of links) {
        if ((link.source.id||link.source) === node) {
            adjacentNodes.add(link.target);
        } else if ((link.target.id||link.targe0) === node) {
            adjacentNodes.add(link.source);
        }
    }
    return adjacentNodes
}

function countAdjacentNodes(nodes, links) {
    const nodeMap = new Map();

    for (const node of nodes) {
        nodeMap.set(node.id, node);
        node.count = new Map()
    }

    for (const link of links) {
        const source = nodeMap.get(link.source.id||link.source);
        const target = nodeMap.get(link.target.id||link.target);

        if (!source) {
            console.log('source not found', link.source.id||link.source)
            continue;
        }

        if (!target) {
            console.log('target not found', link.target.id||link.target)
            continue;
        }

        source.count.set(target.type, (source.count.get(target.type) || 0) + 1);
        source.count.set('total', (source.count.get('total') || 0) + 1);
        target.count.set(source.type, (target.count.get(source.type) || 0) + 1);
        target.count.set('total', (target.count.get('total') || 0) + 1);
    }
}


function findShortestPath(edges, start, end) {
    // Build adjacency list from edges (bidirectional)
    const graph = buildUndirectedGraph(edges);

    // Set of visited nodes
    const visited = new Set();

    // Distance from start to each node
    const distances = {};

    // Previous node in optimal path from source
    const previous = {};

    // Priority queue (simplistic implementation)
    const queue = [];

    // Initialize distances with Infinity for all nodes except start
    for (const node in graph) {
        distances[node] = node === start ? 0 : Infinity;
        previous[node] = null;
        queue.push(node);
    }

    // Main Dijkstra algorithm
    while (queue.length > 0) {
        // Find node with minimum distance
        queue.sort((a, b) => distances[a] - distances[b]);
        const current = queue.shift();

        // If we reached the end node, we're done
        if (current === end) {
            break;
        }

        // If the current node is unreachable
        if (distances[current] === Infinity) {
            break;
        }

        visited.add(current);

        // For each neighbor of current node
        for (const neighbor in graph[current]) {
            if (visited.has(neighbor)) continue;

            // Calculate new distance
            const weight = graph[current][neighbor];
            const newDistance = distances[current] + weight;

            // If new distance is better
            if (newDistance < distances[neighbor]) {
                distances[neighbor] = newDistance;
                previous[neighbor] = current;
            }
        }
    }

    // Reconstruct the path
    const path = [];
    let current = end;

    // No path found
    if (previous[end] === null && end !== start) {
        return {distance: Infinity, path: []};
    }

    while (current) {
        path.unshift(current);
        current = previous[current];
    }

    return {
        distance: distances[end],
        path: path
    };
}

/**
 * Find all shortest paths between two nodes using Dijkstra's algorithm for undirected graphs
 * @param {Array<{source: string, target: string, weight: number}>} edges - Array of edge objects
 * @param {string} start - Starting node
 * @param {string} end - Ending node
 * @returns {Object} - Object containing the distance and array of all shortest paths
 */
function findAllShortestPaths(edges, start, end) {
    // Build adjacency list from edges (bidirectional)
    const graph = buildUndirectedGraph(edges);

    // Distance from start to each node
    const distances = {};

    // Keep track of all nodes with the same minimum distance
    const previous = {};

    // Initialize data structures
    for (const node in graph) {
        distances[node] = node === start ? 0 : Infinity;
        previous[node] = [];
    }

    // Priority queue
    const queue = Object.keys(graph).map(node => ({
        node,
        distance: distances[node]
    }));

    // Set to track processed nodes
    const processed = new Set();

    // Main Dijkstra algorithm
    while (queue.length > 0) {
        // Sort queue by distance
        queue.sort((a, b) => a.distance - b.distance);

        // Get node with minimum distance
        const { node: current, distance } = queue.shift();

        // If current distance is infinity, remaining nodes are unreachable
        if (distance === Infinity) break;

        // Mark as processed
        processed.add(current);

        // For each neighbor of the current node
        for (const neighbor in graph[current]) {
            if (processed.has(neighbor)) continue;

            // Calculate distance through current node
            const weight = graph[current][neighbor];
            const newDistance = distances[current] + weight;

            // If we found a shorter path to neighbor
            if (newDistance < distances[neighbor]) {
                // Update distance
                distances[neighbor] = newDistance;

                // Clear previous paths and add new shortest path
                previous[neighbor] = [current];

                // Update queue with new distance
                const index = queue.findIndex(item => item.node === neighbor);
                if (index !== -1) {
                    queue[index].distance = newDistance;
                }
            }
            // If we found an equally short path
            else if (newDistance === distances[neighbor]) {
                // Add this path as an alternative
                previous[neighbor].push(current);
            }
        }
    }

    // Reconstruct all paths
    const allPaths = [];

    // Helper function to recursively build all paths
    function buildPaths(node, path) {

        if (!node) {
            return;
        }

        // If we reached the start, we have a complete path
        if (node === start) {
            allPaths.push([...path, node]);
            return;
        }

        // No path to this node
        if (!previous[node] ||  previous[node].length === 0) {
            return;
        }

        // Try all previous nodes
        for (const prev of previous[node]) {
            // Avoid cycles
            if (!path.includes(prev)) {
                buildPaths(prev, [...path, node]);
            }
        }
    }

    // Start building paths from the end node
    buildPaths(end, []);

    // Reverse paths to get them in start->end order
    const formattedPaths = allPaths.map(path => path.reverse());

    return {
        distance: distances[end],
        paths: formattedPaths
    };
}

/**
 * Find the minimum spanning tree using Prim's algorithm
 * @param {Array<{source: string, target: string, weight: number}>} edges - Array of edge objects
 * @param {string} startNode - Starting node for the MST
 * @returns {Object} - Object containing the total weight and edges of the MST
 */
function minimumSpanningTree(edges, startNode) {

    // Build adjacency list from edges (bidirectional)
    const graph = buildUndirectedGraph(edges);

    // If the graph is empty or the start node doesn't exist
    if (!graph[startNode]) {
        return { totalWeight: 0, mstEdges: [] };
    }

    // Set of nodes included in MST
    const included = new Set([startNode]);

    // Edges in the MST
    const mstEdges = [];

    // Total weight of the MST
    let totalWeight = 0;

    // Continue until all connected nodes are included
    while (included.size < Object.keys(graph).length) {
        let minEdge = null;
        let minWeight = Infinity;
        let nextNode = null;

        // Find the minimum weight edge connecting an included node to a non-included node
        for (const node of included) {
            for (const neighbor in graph[node]) {
                if (!included.has(neighbor) && graph[node][neighbor] < minWeight) {
                    minWeight = graph[node][neighbor];
                    minEdge = { source: node, target: neighbor, weight: minWeight };
                    nextNode = neighbor;
                }
            }
        }

        // If no edge is found, the graph is disconnected
        if (!nextNode) {
            break;
        }

        // Add the edge to MST
        mstEdges.push(minEdge);
        totalWeight += minWeight;

        // Include the new node
        included.add(nextNode);
    }

    // Check if MST includes all nodes
    if (included.size < Object.keys(graph).length) {
        console.warn('The graph is disconnected. The MST only covers a portion of the graph.');
    }

    return {
        totalWeight,
        mstEdges,
        includedNodes: Array.from(included)
    };
}

/**
 * Find the minimum spanning tree using Prim's algorithm starting from a given subtree
 * @param {Array<{source: string, target: string, weight: number}>} edges - Array of edge objects
 * @param {Array<{source: string, target: string, weight: number}>} initialSubtree - Edges of the initial subtree
 * @param {function} weightFunction
 * @returns {Object} - Object containing the total weight and edges of the MST
 */
function minimumSpanningTreeFromSubtree(edges, initialSubtree, weightFunction = null) {
    // Build adjacency list from all edges (bidirectional)
    const graph = buildUndirectedGraph(edges, weightFunction);

    // Set of nodes included in MST (start with all nodes from the initial subtree)
    const included = new Set();

    // Edges in the MST (start with the initial subtree edges)
    const mstEdges = [...initialSubtree];

    // Total weight of the MST (start with the weight of the initial subtree)
    let totalWeight = initialSubtree.reduce((sum, edge) => sum + 1, 0);

    // Validate the initial subtree and collect its nodes
    if (!isValidSubtree(initialSubtree)) {
        throw new Error("The provided initial structure is not a valid subtree.");
    }

    // Add all nodes from the initial subtree to the included set
    for (const edge of initialSubtree) {
        included.add(edge.source);
        included.add(edge.target);
    }

    // If the initial subtree is empty, we need to select a starting node
    if (initialSubtree.length === 0) {
        if (Object.keys(graph).length === 0) {
            return { totalWeight: 0, mstEdges: [], includedNodes: [] };
        }

        // Start with the first node in the graph
        const startNode = Object.keys(graph)[0];
        included.add(startNode);
    }

    // Continue until all connected nodes are included
    while (included.size < Object.keys(graph).length) {
        let minEdge = null;
        let minWeight = Infinity;
        let nextNode = null;

        // Find the minimum weight edge connecting an included node to a non-included node
        for (const node of included) {
            for (const neighbor in graph[node]) {
                if (!included.has(neighbor) && graph[node][neighbor] < minWeight) {
                    minWeight = graph[node][neighbor];
                    minEdge = { source: node, target: neighbor, weight: minWeight };
                    nextNode = neighbor;
                }
            }
        }

        // If no edge is found, the graph is disconnected
        if (!nextNode) {
            break;
        }

        // Add the edge to MST
        mstEdges.push(minEdge);
        totalWeight += minWeight;

        // Include the new node
        included.add(nextNode);
    }

    return {
        totalWeight,
        mstEdges,
        includedNodes: Array.from(included)
    };
}

/**
 * Validate if the given edges form a valid subtree (connected and acyclic)
 * @param {Array<{source: string, target: string}>} subtreeEdges
 * @returns {boolean} true if valid subtree, false otherwise
 */
function isValidSubtree(subtreeEdges) {
    // Empty subtree is valid
    if (subtreeEdges.length === 0) {
        return true;
    }

    // Build an adjacency list for the subtree
    const adjList = {};
    const nodes = new Set();

    for (const edge of subtreeEdges) {
        nodes.add(edge.source);
        nodes.add(edge.target);

        if (!adjList[edge.source]) adjList[edge.source] = [];
        if (!adjList[edge.target]) adjList[edge.target] = [];

        adjList[edge.source].push(edge.target);
        adjList[edge.target].push(edge.source);
    }

    // // For a tree with n nodes, it must have exactly n-1 edges
    // if (subtreeEdges.length !== nodes.size - 1) {
    //     console.log(`tree has ${subtreeEdges.length} edges, but should have ${nodes.size - 1}`)
    //     return false;
    // }

    // Check connectivity using BFS
    const visited = new Set();
    const queue = [Array.from(nodes)[0]]; // Start from any node

    while (queue.length > 0) {
        const node = queue.shift();

        if (visited.has(node)) {
            continue;
        }

        visited.add(node);

        for (const neighbor of adjList[node] || []) {
            if (!visited.has(neighbor)) {
                queue.push(neighbor);
            }
        }
    }

    // If all nodes are visited, the graph is connected
    return visited.size === nodes.size;
}

/**
 * Build an adjacency list graph from an array of edges, treating all edges as undirected
 * @param {Array<{source: string, target: string, weight: number}>} edges
 * @param {function(edge:{}, source: string, target: string)} weightFunction - A function that computes the weight for each edge, or undefined for default behavior
 * @returns {Object} Adjacency list for an undirected graph
 */
function buildUndirectedGraph(edges, weightFunction) {
    const graph = {};

    // Initialize graph with empty adjacency lists
    for (const edge of edges) {

        let source = edge.source.id || edge.source
        let target = edge.target.id || edge.target

        if (!graph[source]) graph[source] = {};
        if (!graph[target]) graph[target] = {};
    }

    // Fill adjacency lists with weights (bidirectional)
    for (const edge of edges) {


        const type = edge.type
        let defaultWeight = 10
        let source = edge.source.id || edge.source
        let target = edge.target.id || edge.target

        let weight = 0.0
        if (!weightFunction) {

            switch (type) {
                case 'article_article-keyword':
                    defaultWeight = 1;
                    break

                case 'project-topic_project':
                    defaultWeight = 2;
                    break

                case 'article_project':
                    defaultWeight = 3;
                    break;
                case 'project_partner':
                    defaultWeight = 6;
                    break;
                case 'project-keyword_project':
                    defaultWeight = 2;
                    break;

                case 'cause-effect_cause':
                    defaultWeight = 3;
            }

            // Assuming the weight property exists, otherwise default to 1
            weight = edge.weight !== undefined ? edge.weight : defaultWeight;
        } else {
            weight = weightFunction(edge, source, target)
        }



        // Add edge in both directions
        graph[source][target] = weight;
        graph[target][source] = weight; // This is the key change for undirected graphs
    }

    return graph;
}

/**
 * Finds the degree of separation between one node and all other nodes in the graph
 * @param {Array} links - Array of objects with 'source' and 'target' properties
 * @param {string} startNode - The starting node
 * @returns {Object} Object mapping each node to its degree of separation from startNode, or -1 if unreachable
 */
function findAllDegreesOfSeparation(links, startNode) {
    // Handle edge cases
    if (!links || links.length === 0) return {};

    // Build adjacency list from links
    const graph = {};
    const allNodes = new Set();

    links.forEach(link => {
        const { source, target } = link;

        // Track all nodes
        allNodes.add(source);
        allNodes.add(target);

        // Add bidirectional connections (undirected graph)
        if (!graph[source]) graph[source] = [];
        if (!graph[target]) graph[target] = [];

        graph[source].push(target);
        graph[target].push(source);
    });

    // Check if start node exists in the graph
    if (!graph[startNode]) {
        // Return all nodes with -1 (unreachable) if start node doesn't exist
        const result = {};
        allNodes.forEach(node => {
            result[node] = node === startNode ? 0 : -1;
        });
        return result;
    }

    // Initialize result with all nodes set to -1 (unreachable)
    const distances = {};
    allNodes.forEach(node => {
        distances[node] = -1;
    });

    // BFS to find shortest paths to all reachable nodes
    const queue = [startNode];
    const visited = new Set([startNode]);
    distances[startNode] = 0;

    while (queue.length > 0) {
        const current = queue.shift();

        // Check all neighbors
        for (const neighbor of graph[current]) {
            if (!visited.has(neighbor)) {
                visited.add(neighbor);
                distances[neighbor] = distances[current] + 1;
                queue.push(neighbor);
            }
        }
    }

    return distances;
}

/**
 *
 * @param {Array<{source: string, target: string, weight: number}>} edges
 * @param {string} node
 * @returns {Array<{source: string, target: string, weight: number}>}
 */
function findEdgesThroughNode(edges, node) {
    return edges.filter(edge => edge.source === node || edge.target === node);
}

export { findAdjacentSubtree, findShortestPath, findAllShortestPaths, minimumSpanningTree, minimumSpanningTreeFromSubtree, findAllDegreesOfSeparation, findEdgesThroughNode, findAdjacentNodes, countAdjacentNodes };