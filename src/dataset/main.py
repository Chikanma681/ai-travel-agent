from datasets import load_dataset

dataset = load_dataset("argilla/tripadvisor-hotel-reviews", split="train")

montreal_reviews = dataset.filter(lambda x: "montreal" in x["text"].lower())

print(montreal_reviews[:5])

montreal_reviews.to_csv("montreal_reviews.csv")
