from mcp.server.mcpserver import MCPServer

mcp = MCPServer(
    name="HQ-MCP",
    version="1.0.0",
    description="Fictional aircraft information and maintenance MCP server"
)


@mcp.tool()
def get_aircraft_status(aircraft_id: str) -> str:
    """Get the current status of a simulated aircraft."""
    return f"Aircraft {aircraft_id} is operational."


if __name__ == "__main__":
    mcp.run()