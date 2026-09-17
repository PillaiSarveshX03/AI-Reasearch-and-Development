from mcp.server.mcpserver import MCPServer

mcp = MCPServer(
    name="HQ-MCP",
    version="1.0.0",
    description="Fictional aircraft information and maintenance MCP server"
)

aircraft_data = {
    "FALCON-001": {
        "model": "HX-9",
        "squadron": "Alpha",
        "fuel": 78,
        "flight_hours": 142,
        "status": "Operational"
    },
    "FALCON-002": {
        "model": "HX-9",
        "squadron": "Bravo",
        "fuel": 42,
        "flight_hours": 219,
        "status": "Maintenance"
    }
}

@mcp.tool()
def get_aircraft_status(aircraft_id: str) -> str:
    """Get the status and basic information of a simulated aircraft."""

    aircraft = aircraft_data.get(aircraft_id)

    if aircraft is None:
        return f"Aircraft {aircraft_id} was not found."

    return (
        f"Aircraft ID: {aircraft_id} \n"
        f"Model: {aircraft['model']}\n"
        f"Squadron: {aircraft['squadron']}\n"
        f"Fuel: {aircraft['fuel']}%\n"
        f"Flight Hours: {aircraft['flight_hours']}\n"
        f"Status: {aircraft['status']}"
    )

@mcp.tool()
def get_aircraft_list() -> str:
    """Get a list of all simulated aircraft."""

    aircraft_list = []

    for aircraft_id, aircraft in aircraft_data.items():
        aircraft_list.append(
            f"{aircraft_id} - {aircraft['model']} - {aircraft['status']}"
        )

    return "\n".join(aircraft_list)

if __name__ == "__main__":
    mcp.run()