const { z } = require('zod');

module.exports = {
    /**
     * Registers the echo tool with the MCP server
     * @param {import('@modelcontextprotocol/sdk/server/mcp.js').McpServer} server - The MCP server instance
     */
    register(server) {
        server.tool(
            "echo",
            { message: z.string() },
            async ({ message }) => ({
                content: [{ type: "text", text: `Tool echo: ${message}` }]
            })
        );
    }
}; 