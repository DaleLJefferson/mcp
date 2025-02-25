const vscode = require('vscode');
const { McpServer, ResourceTemplate } = require('@modelcontextprotocol/sdk/server/mcp.js');
const { SSEServerTransport } = require('@modelcontextprotocol/sdk/server/sse.js');
const http = require('http');
const url = require('url');
const { z } = require('zod');

// MCP Server port
const MCP_PORT = 6102;

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
    // Display a message when the extension activates
    vscode.window.showInformationMessage('MCP Server is now active!');
    console.log('MCP Server extension is now active');

    const server = new McpServer({
        name: "vscode-mcp-server",
        version: "1.0.0",
    });

    server.tool(
        "echo",
        { message: z.string() },
        async ({ message }) => ({
            content: [{ type: "text", text: `Tool echo: ${message}` }]
        })
    );

    let transport;

    // Create HTTP server
    const httpServer = http.createServer(async (req, res) => {
        // Parse the URL to get the pathname (without query parameters)
        const path = url.parse(req.url || '', true).pathname;
        const routeKey = `${req.method} ${path}`;

        console.log(`Request: ${routeKey}`);

        switch (routeKey) {
            case 'GET /sse':
                transport = new SSEServerTransport("/messages", res);
                await server.connect(transport);
                return;

            case 'POST /messages':
                if (!transport) {
                    res.statusCode = 500;
                    res.end("No transport found");
                    return;
                }
                await transport.handlePostMessage(req, res);
                return;

            default:
                res.statusCode = 404;
                res.end('Not found');
                return;
        }
    });

    httpServer.listen(MCP_PORT, () => {
        console.log(`MCP Server is running on port ${MCP_PORT}`);
    });
}

function deactivate() { }

module.exports = {
    activate,
    deactivate
}
