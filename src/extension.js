const vscode = require('vscode');
const { McpServer } = require('@modelcontextprotocol/sdk/server/mcp.js');
const { SSEServerTransport } = require('@modelcontextprotocol/sdk/server/sse.js');
const http = require('http');
const url = require('url');
const { z } = require('zod');
const echo = require('./tools/echo');

// MCP Server port
const MCP_PORT = 6102;

/**
 * Creates and configures the MCP server with tools
 * @returns {McpServer} The configured MCP server instance
 */
function createMcpServer() {
    const server = new McpServer({
        name: "vscode-mcp-server",
        version: "1.0.0",
    });

    // Register tools
    echo.register(server);

    return server;
}

/**
 * Creates and configures the HTTP server for MCP connections
 * @param {McpServer} mcpServer - The MCP server instance
 * @returns {http.Server} The configured HTTP server
 */
function createHttpServer(mcpServer) {
    let transport;

    const httpServer = http.createServer(async (req, res) => {
        const path = url.parse(req.url || '', true).pathname;
        const routeKey = `${req.method} ${path}`;

        console.log(`Request: ${routeKey}`);

        switch (routeKey) {
            case 'GET /sse': {
                transport = new SSEServerTransport("/messages", res);
                await mcpServer.connect(transport);
                return;
            }
            case 'POST /messages': {
                if (!transport) {
                    res.statusCode = 500;
                    res.end("No transport found");
                    return;
                }
                await transport.handlePostMessage(req, res);
                return;
            }
            default: {
                res.statusCode = 404;
                res.end('Not found');
                return;
            }
        }
    });

    return httpServer;
}

/**
 * Starts the HTTP server for MCP connections
 * @param {http.Server} httpServer - The HTTP server instance
 * @param {vscode.ExtensionContext} context - The VS Code extension context
 * @param {number} port - The port to listen on
 */
function startServer(httpServer, context, port) {
    httpServer.listen(port, () => {
        const message = `MCP SSE Server running at http://127.0.0.1:${port}/sse`;

        vscode.window.showInformationMessage(message);

        console.log(message);
    });

    // Add disposal to shut down the HTTP server and output channel on extension deactivation
    context.subscriptions.push({
        dispose: () => {
            httpServer.close();
        },
    });
}

module.exports = {
    /**
     * @param {vscode.ExtensionContext} context
     */
    activate(context) {
        // Create MCP server
        const mcpServer = createMcpServer();

        // Create and start HTTP server
        const httpServer = createHttpServer(mcpServer);

        startServer(httpServer, context, MCP_PORT);
    },
    deactivate() { }
}
