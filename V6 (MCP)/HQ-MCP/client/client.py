import asyncio

from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client


server_params = StdioServerParameters(
    command="python",
    args=["server/server.py"],
)


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

            print("Aircraft Status:")
            print(result)



            result = await session.call_tool(
                "get_aircraft_list"
            )

            print("\nAircraft List:")
            print(result)


if __name__ == "__main__":
    asyncio.run(main())