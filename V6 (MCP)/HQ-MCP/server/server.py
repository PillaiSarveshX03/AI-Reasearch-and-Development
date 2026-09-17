import sqlite3

from mcp.server.mcpserver import MCPServer


mcp = MCPServer(
    name="HQ-MCP",
    version="1.0.0",
    description="Fictional aircraft information and maintenance MCP server"
)


DATABASE = "database/aircraft.db"


@mcp.tool()
def get_aircraft_status(aircraft_id: str) -> str:
    """Get the status and basic information of a simulated aircraft."""

    connection = sqlite3.connect(DATABASE)
    cursor = connection.cursor()

    cursor.execute(
        """
        SELECT aircraft_id, model, squadron, fuel, flight_hours, status
        FROM aircraft
        WHERE aircraft_id = ?
        """,
        (aircraft_id,)
    )

    aircraft = cursor.fetchone()

    connection.close()

    if aircraft is None:
        return f"Aircraft {aircraft_id} was not found."

    return (
        f"Aircraft ID: {aircraft[0]}\n"
        f"Model: {aircraft[1]}\n"
        f"Squadron: {aircraft[2]}\n"
        f"Fuel: {aircraft[3]}%\n"
        f"Flight Hours: {aircraft[4]}\n"
        f"Status: {aircraft[5]}"
    )


@mcp.tool()
def get_aircraft_list() -> str:
    """Get a list of all simulated aircraft."""

    connection = sqlite3.connect(DATABASE)
    cursor = connection.cursor()

    cursor.execute(
        """
        SELECT aircraft_id, model, status
        FROM aircraft
        """
    )

    aircraft = cursor.fetchall()

    connection.close()

    if not aircraft:
        return "No aircraft found."

    return "\n".join(
        f"{aircraft_id} - {model} - {status}"
        for aircraft_id, model, status in aircraft
    )


@mcp.tool()
def get_maintenance_history(aircraft_id: str) -> str:
    """Get the maintenance history of a simulated aircraft."""

    connection = sqlite3.connect(DATABASE)
    cursor = connection.cursor()

    cursor.execute(
        """
        SELECT maintenance_date,
               maintenance_type,
               description,
               technician
        FROM maintenance
        WHERE aircraft_id = ?
        ORDER BY maintenance_date DESC
        """,
        (aircraft_id,)
    )

    records = cursor.fetchall()

    connection.close()

    if not records:
        return f"No maintenance records found for {aircraft_id}."

    result = []

    for record in records:
        maintenance_date, maintenance_type, description, technician = record

        result.append(
            f"Date: {maintenance_date}\n"
            f"Type: {maintenance_type}\n"
            f"Description: {description}\n"
            f"Technician: {technician}"
        )

    return "\n\n".join(result)



if __name__ == "__main__":
    mcp.run()