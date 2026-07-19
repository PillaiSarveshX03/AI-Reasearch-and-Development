from google import genai

client = genai.Client(api_key="AQ.Ab8RN6ImhWJz_-m-OFhhotqTcvtFn-7vxMjQVUh03YiZOBz8FQ")

for model in client.models.list():
    print(model.name)