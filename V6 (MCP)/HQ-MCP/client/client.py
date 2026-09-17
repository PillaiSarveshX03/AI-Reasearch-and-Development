import asyncio

from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client


server_params = StdioServerParameters(
    command="python",
    args=["server/server.py"],
)


def print_tool_result(title, result):
    print(f"\n{'=' * 50}")
    print(title)
    print('=' * 50)

    if result.is_error:
        print("ERROR:")
        print(result.content)
        return

    for content in result.content:
        if hasattr(content, "text"):
            print(content.text)




async def main():
    async with stdio_client(server_params) as (read, write):
        async with ClientSession(read, write) as session:

            await session.initialize()

            result = await session.call_tool(
                "get_aircraft_status",
                arguments={
                    "aircraft_id": "FALCON-001"
                }
            )

            print_tool_result("AIRCRAFT STATUS", result)



            result = await session.call_tool(
                "get_aircraft_list"
            )

            print_tool_result("AIRCRAFT LIST", result)


            result = await session.call_tool(
                "get_maintenance_history",
                arguments={
                    "aircraft_id": "FALCON-001"
                }
            )

            print_tool_result("AIRCRAFT LIST", result)


if __name__ == "__main__":
    asyncio.run(main())