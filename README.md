# MCP Server VS Code Extension 🚀

A VS Code extension implementing the Model Context Protocol (MCP) server with basic echo functionality.

## Features

- Runs an MCP server on port 6102
- Implements the Echo resource for testing
- Implements the Echo tool for testing
- Uses Server-Sent Events (SSE) for communication

## How to Use

1. Install the extension dependencies:
   ```
   npm install
   ```

2. Build the extension:
   ```
   npm run build
   ```

3. Install the extension in VS Code.

4. The MCP server automatically starts when VS Code launches.

5. Connect to the MCP server via SSE at:
   ```
   http://localhost:6102/sse
   ```
