// Random tree
const vscode = acquireVsCodeApi();
let highlightNodes = new Set();
let highlightLink = new Set();
let hoverNode = null;
let locking = false;
const N = 80;
const gData = {
    nodes: [...Array(N).keys()].map((i) => ({ id: i })),
    links: [...Array(N).keys()]
        .filter((id) => id)
        .map((id) => ({
            source: id,
            target: Math.round(Math.random() * (id - 1)),
        })),
};

function addSpriteText(node) {
    const sprite = new SpriteText(node.id);
    sprite.color = "#fff";
    sprite.textHeight = 10;
    sprite.position.set(0, 12, 0);
    return sprite;
}

const Graph = ForceGraph3D()(document.getElementById("graph")).enableNodeDrag(
    false
);
// .jsonUrl("./test.json");
// .graphData(gData);

Graph.nodeColor((node) =>
    highlightNodes.has(node) ? "rgb(255,0,0,1)" : "rgba(0,255,255,0.6)"
)
    .linkWidth((link) => (highlightLink.has(link) ? 4 : 1))
    .linkDirectionalParticles((link) => (highlightLink.has(link) ? 4 : 0))
    .linkDirectionalParticleWidth(4)
    .nodeRelSize(6)
    .onNodeHover((node) => {
        // console.log("NODE: ", node);
        // if (locking) {
        //     return;
        // }
        // // no state change
        // if (!node && !hoverNode) {
        //     return;
        // }
        // if (!node && hoverNode) {
        //     highlightNodes.delete(hoverNode);
        //     links.forEach((link) => {
        //         if (link.source === hoverNode && highlightLink.has(link)) {
        //             highlightLink.delete(link);
        //         }
        //     });
        //     hoverNode = null;
        // }
        // if (node) {
        //     hoverNode = node;
        //     highlightNodes.add(node);
        //     links.forEach((link) => {
        //         if (link.source === node && !highlightLink.has(link)) {
        //             highlightLink.add(link);
        //         }
        //     });
        // }
        // updateHighlight();
    })
    .onLinkHover((link) => {
        updateHighlight();
    })
    .onNodeClick((node) => {
        // info = {
        //     path:
        //         "/Users/apple/WORKSPACE_3/WebSVF/src/WebSVF-frontend-server/public/js/genLandingPageAnalysis.js",
        //     line: node.id,
        //     start: 5,
        //     end: 10,
        // };
        // postInfo(info);
        console.log("NODE: ", node);
        if (node) {
            if (highlightNodes.has(node)) {
                locking = false;
                highlightNodes.delete(node);
                GraphData.links.forEach((link) => {
                    if (link.source === node && highlightLink.has(link)) {
                        highlightLink.delete(link);
                    }
                });
            } else {
                locking = true;
                highlightNodes.add(node);
                GraphData.links.forEach((link) => {
                    if (link.source === node && !highlightLink.has(link)) {
                        highlightLink.add(link);
                    } else {
                        console.log(link.source, node);
                    }
                });
            }
        }

        updateHighlight();
    })
    .nodeThreeObject((node) => {
        const sprite = new SpriteText(node.nodeid);
        sprite.color = "#fff";
        sprite.textHeight = 10;
        sprite.position.set(0, 12, 0);
        return sprite;
    })
    .nodeThreeObjectExtend((node) => {
        return true;
    });

function updateHighlight() {
    // trigger update of highlighted objects in scene
    Graph.nodeColor(Graph.nodeColor())
        .linkWidth(Graph.linkWidth())
        .linkDirectionalParticles(Graph.linkDirectionalParticles());
}
document.getElementById("leftBtn").addEventListener("click", () => {
    postMessage("value_follow_graph", "3dCodeGraph");
    postMessage("Value Follow Graph", "info");
});
document.getElementById("middleBtn").addEventListener("click", () => {
    postMessage("control_follow_graph", "3dCodeGraph");
    postMessage("Control Follow Graph", "info");
});
function postMessage(send_text, command) {
    vscode.postMessage({
        command: command,
        text: send_text,
    });
}

function postInfo(info) {
    vscode.postMessage({
        command: "toSomeWhere",
        path: info.path,
        line: info.line,
        start: info.start,
        end: info.end,
    });
}
window.addEventListener("resize", function () {
    Graph.width(window.innerWidth - 2).height(window.innerHeight - 2);
    console.log("width: ", window.innerWidth - 2);
    console.log("height: ", window.innerHeight - 2);
});
window.addEventListener("message", (event) => {
    const message = event.data;
    switch (message.status) {
        case "connected":
            document.getElementById("showSpan").textContent = message.status;
            break;
        case "3dCodeGraph":
            // Graph.jsonUrl("vscode-resource:" + message.filePath);
            const dataObj = JSON.parse(message.data);
            Graph.graphData(dataObj);
            GraphData = Graph.graphData();
            console.log("GraphData:", GraphData);
            document.getElementById("showSpan").textContent = message.filePath;
            break;
        default:
            break;
    }
});

document.onreadystatechange = function () {
    if (document.readyState === "complete") {
        vscode.postMessage({
            command: "connect",
            text: "Hello world",
        });
    }
};
